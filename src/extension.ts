import * as vscode from "vscode";

import { Logger } from "./utils/logger";
import { ChatAPI } from "./chat/ChatApi";
import ChatViewProvider from "./chat/ChatViewProvider";
import registerChatWidgetWebview from "./chat/chatWidgetWebview";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  Logger.init(context);

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering ElementAI ready to operate.
  void backgroundInit(context);

  return Promise.resolve();
}

async function backgroundInit(context: vscode.ExtensionContext) {
  registerChatWidgetWebview(
    context,
    new ChatViewProvider(
      context,
      new ChatAPI(context, { serverUrl: process.env.CHAT_SERVER_URL })
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
