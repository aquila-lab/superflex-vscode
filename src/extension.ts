require("dotenv").config();

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import * as vscode from "vscode";
import { homedir } from "os";

import { decodeUriAndRemoveFilePrefix } from "./utils";
import { findFiles } from "./scanner";
import { ChatAPI } from "./chat/ChatApi";
import ChatViewProvider from "./chat/ChatViewProvider";
import registerChatWidgetWebview from "./chat/chatWidgetWebview";
import { SUPPORTED_FILE_EXTENSIONS } from "./utils/consts";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const openai = new OpenAI();

  void scanWorkspaces(context, openai);

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering ElementAI ready to operate.
  void backgroundInit(context, openai);

  return Promise.resolve();
}

async function scanWorkspaces(
  context: vscode.ExtensionContext,
  openai: OpenAI
) {
  console.info(`Scanning workspace folders for files`);

  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const workspaceFolder of workspaceFolders) {
    // TODO(boris): Remove this once we are out of testing
    // Currently here to not abuse the cost of API
    if (workspaceFolder.name !== "sprout-dashboard") {
      continue;
    }

    const elementaiCacheFolder = path.join(
      homedir(),
      ".elementai",
      workspaceFolder.name
    );
    await fs.mkdirSync(elementaiCacheFolder, { recursive: true });

    // Check do we aleady have created a workspace OpenAI Vector Store
    const settingsUri = path.join(elementaiCacheFolder, "settings.json");
    try {
      const settingsBuffer = await fs.readFileSync(settingsUri);
      const settings = JSON.parse(settingsBuffer.toString());
      if (settings.vector_store_id) {
        console.info(
          `Workspace ${workspaceFolder.name} already has a vector store`
        );
        return;
      }
    } catch (err) {}

    // Find all files in the workspace folder and put them in OpenAI Vector Store
    try {
      const workspaceFolderPath = decodeUriAndRemoveFilePrefix(
        workspaceFolder.uri.toString()
      );

      const documentsUri: string[] = await findFiles(
        workspaceFolderPath,
        SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`),
        ["**/node_modules/**", "**/build/**", "**/out/**", "**/dist/**"]
      );

      const vectorStore = await openai.beta.vectorStores.create({
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
        const documentPath = path.join(
          cacheFolder,
          `${path.basename(documentUri)}.txt`
        );

        await fs.copyFileSync(documentUri, documentPath);
        documentPaths.push(documentPath);
      }

      // Upload files to the storage in batches of 500
      const batchSize = 500;
      for (let i = 0; i < documentPaths.length; i += batchSize) {
        console.info(
          `Scanning files: ${batchSize * i}/${documentPaths.length}`
        );

        const fileStreams = documentPaths
          .slice(i, i + batchSize)
          .map((path) => fs.createReadStream(path));

        await openai.beta.vectorStores.fileBatches.uploadAndPoll(
          vectorStore.id,
          {
            files: fileStreams,
          }
        );
      }

      const assistant = await openai.beta.assistants.create({
        name: "ElementAI UI Assistant",
        description:
          "You are an expert frontend development assistant. You help developers by converting visual sketches and design elements into clean, maintainable code. You understand design patterns, code styles, and existing components in the codebase to ensure consistency and efficiency. Additionally, you provide suggestions and improvements based on best practices in frontend development.",
        instructions:
          "You are an expert frontend development assistant. The user's project has been uploaded into the vector store available to you. Your task is to follow the specific coding style, component reuse patterns, and design system standards established in the project. Analyze the existing codebase to understand how components are structured and styled, how they interact with each other, and how the design system is implemented. When generating code, ensure that it seamlessly integrates with the existing components and follows the same practices. Your goal is to perform tasks with the same precision, attention to detail, and consistency as a skilled human frontend engineer. Always prioritize maintainability, readability, and adherence to the project's conventions.",
        model: "gpt-4o",
        tools: [{ type: "file_search" }],
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStore.id],
          },
        },
      });

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

async function backgroundInit(
  context: vscode.ExtensionContext,
  openai: OpenAI
) {
  registerChatWidgetWebview(
    context,
    new ChatViewProvider(context, new ChatAPI(context, { openai: openai }))
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
