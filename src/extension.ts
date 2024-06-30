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

      // Write the vector store id to root folder
      // This will be used to identify the vector store for the workspace
      // and to update it when new files are added
      await fs.writeFileSync(
        settingsUri,
        Buffer.from(
          JSON.stringify({
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
