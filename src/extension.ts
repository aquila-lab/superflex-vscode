require("dotenv").config();

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import * as vscode from "vscode";
import { homedir } from "os";

import { decodeUriAndRemoveFilePrefix } from "./common/utils";
import { findFiles } from "./scanner";
import { ChatAPI } from "./chat/ChatApi";
import ChatViewProvider from "./chat/ChatViewProvider";
import registerChatWidgetWebview from "./chat/chatWidgetWebview";
import { SUPPORTED_FILE_EXTENSIONS } from "./common/constants";
import ElementAIAuthenticationProvider, { AUTH_PROVIDER_ID } from "./authentication/ElementAIAuthenticationProvider";
import { authenticate, signIn, signOut } from "./commands";

type AppState = {
  openai: OpenAI;
  chatApi: ChatAPI;
  authProvider: ElementAIAuthenticationProvider;
  chatViewProvider: ChatViewProvider;
};

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const openai = new OpenAI();
  const chatApi = new ChatAPI(context, { openai: new OpenAI() });

  const appState: AppState = {
    openai: openai,
    chatApi: chatApi,
    authProvider: new ElementAIAuthenticationProvider(context),
    chatViewProvider: new ChatViewProvider(context, chatApi),
  };

  void scanWorkspaces(context, appState);

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering ElementAI ready to operate.
  void backgroundInit(context, appState);

  return Promise.resolve();
}

async function scanWorkspaces(context: vscode.ExtensionContext, appState: AppState) {
  console.info(`Scanning workspace folders for files`);

  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const workspaceFolder of workspaceFolders) {
    // TODO(boris): Remove this once we are out of testing
    // Currently here to not abuse the cost of API
    if (workspaceFolder.name !== "sprout-dashboard") {
      continue;
    }

    const elementaiCacheFolder = path.join(homedir(), ".elementai", workspaceFolder.name);
    await fs.mkdirSync(elementaiCacheFolder, { recursive: true });

    const workspaceFolderPath = decodeUriAndRemoveFilePrefix(workspaceFolder.uri.toString());

    const documentsUri: string[] = await findFiles(
      workspaceFolderPath,
      SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`),
      ["**/node_modules/**", "**/build/**", "**/out/**", "**/dist/**"]
    );

    const outputFilePath = path.join(elementaiCacheFolder, "combined_code.txt");
    const writeStream = fs.createWriteStream(outputFilePath);

    for (const documentUri of documentsUri) {
      const relativeFilePath = path.relative(workspaceFolderPath, documentUri);
      const fileContent = await fs.promises.readFile(documentUri, "utf-8");
      writeStream.write(`// ${relativeFilePath}\n`);
      writeStream.write(fileContent + "\n\n");
    }

    writeStream.end();

    // Check do we aleady have created a workspace OpenAI Vector Store
    const settingsUri = path.join(elementaiCacheFolder, "settings.json");
    try {
      const settingsBuffer = await fs.readFileSync(settingsUri);
      const settings = JSON.parse(settingsBuffer.toString());
      if (settings.assistant_id && settings.vector_store_id) {
        console.info(`Workspace ${workspaceFolder.name} already has a vector store`);

        const assistant = await appState.openai.beta.assistants.retrieve(settings.assistant_id);
        const vectorStore = await appState.openai.beta.vectorStores.retrieve(settings.vector_store_id);
        appState.chatApi.setAssistant(assistant, vectorStore);

        return;
      }
    } catch (err) {}

    // Find all files in the workspace folder and put them in OpenAI Vector Store
    try {
      const workspaceFolderPath = decodeUriAndRemoveFilePrefix(workspaceFolder.uri.toString());

      const documentsUri: string[] = await findFiles(
        workspaceFolderPath,
        SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`),
        ["**/node_modules/**", "**/build/**", "**/out/**", "**/dist/**"]
      );

      const vectorStore = await appState.openai.beta.vectorStores.create({
        name: `${workspaceFolder.name}-vector-store`,
        expires_after: {
          anchor: "last_active_at",
          days: 7,
        },
      });

      // Copy the files to cache folder
      const cacheFolder = path.join(elementaiCacheFolder, "files");
      await fs.mkdirSync(cacheFolder, { recursive: true });

      const documentPaths: string[] = [];
      for (const documentUri of documentsUri) {
        const documentPath = path.join(cacheFolder, `${path.basename(documentUri)}.txt`);

        await fs.copyFileSync(documentUri, documentPath);
        documentPaths.push(documentPath);
      }

      // Upload files to the storage in batches of 500
      const batchSize = 500;
      for (let i = 0; i < documentPaths.length; i += batchSize) {
        console.info(`Scanning files: ${batchSize * i}/${documentPaths.length}`);

        const fileStreams = documentPaths.slice(i, i + batchSize).map((path) => fs.createReadStream(path));

        await appState.openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
          files: fileStreams,
        });
      }

      const assistant = await appState.openai.beta.assistants.create({
        name: "ElementAI UI Assistant",
        description:
          "You are an expert frontend development assistant. You help developers by converting visual sketches and design elements into clean, maintainable code. You understand design patterns, code styles, and existing components in the codebase to ensure consistency and efficiency. Additionally, you provide suggestions and improvements based on best practices in frontend development.",
        instructions: `You are an expert frontend development assistant. You help developers by converting visual sketches and design elements into clean, maintainable code. You understand design patterns, code styles, and existing components in the codebase to ensure consistency and efficiency. Additionally, you provide suggestions and improvements based on best practices in frontend development.
The user's project has been uploaded into the vector store available to you. Your primary tasks are as follows:

1. Input Handling:
    - Image Input: If an image is provided, analyze the image thoroughly to understand its layout. Focus on determining whether components are arranged in rows or columns. Pay close attention to the relative positioning of elements (e.g., elements next to each other in the same row or stacked in the same column). If any part of the image is unclear, ask follow-up questions for clarification. Once you have a clear understanding, describe the layout generically by specifying the positions of elements in terms of rows and columns, then proceed to recreate the layout in code. Ensure the code adheres to the project's coding style, design patterns, and reuses existing components.
    - Text Input: If the input is text-based, thoroughly understand the request. Ask follow-up questions if necessary to gather all required details. Once you have a full understanding, generate the component code following the repository's coding style, design patterns, and reusing existing components.

2. Code Generation:
    - Must follow the user's coding style, which can be analyzed and learned from the uploaded files in the vector store.
    - Must understand which components exist in the repository and successfully utilize them.
    - Must follow the project design system.
    - Ensure that the generated code is consistent with the existing codebase in terms of style and design.
    - Reuse components that have already been created within the repository.
    - Maintain a focus on creating maintainable and readable code.

3. Behavior and Best Practices:
    - Operate as if you are a real human frontend engineer with full context of the repository.
    - Utilize best practices in frontend development.
    - Follow the established code style and design patterns of the repository.
    - Always generate usable code that can be run without modifications.

Always return only the source code.`,
        model: "gpt-4o",
        tools: [{ type: "file_search" }],
        temperature: 0.2,
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id],
          },
        },
      });

      appState.chatApi.setAssistant(assistant, vectorStore);

      // Write the vector store id to root folder
      // This will be used to identify the vector store for the workspace
      // and to update it when new files are added
      await fs.writeFileSync(
        settingsUri,
        Buffer.from(
          JSON.stringify({
            assistant_id: assistant.id,
            vector_store_id: vectorStore.id,
          })
        )
      );

      console.info("Finished scanning workspace folders for files");
    } catch (err) {
      console.error(err);
    }
  }
}

async function backgroundInit(context: vscode.ExtensionContext, appState: AppState) {
  registerAuthenticationProviders(context, appState.authProvider);

  registerChatWidgetWebview(context, appState.chatViewProvider);
}

async function registerAuthenticationProviders(
  context: vscode.ExtensionContext,
  authProvider: ElementAIAuthenticationProvider
): Promise<void> {
  context.subscriptions.push(authProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signin`, () => signIn(authProvider)),
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signout`, () => signOut(authProvider))
  );

  authenticate(authProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
