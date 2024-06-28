import * as vscode from "vscode";

import { EventRegistry } from "./EventRegistry";

type APIConfig = {
  serverUrl?: string | undefined;
};

export class ChatAPI {
  private ready = new vscode.EventEmitter<void>();

  private chatEventRegistry = new EventRegistry();

  public onReady = new Promise((resolve) => {
    this.ready.event(resolve);
  });

  constructor(context: vscode.ExtensionContext, config: APIConfig) {
    this.chatEventRegistry
      .registerEvent<void, void>("ready", async () => {
        this.ready.fire();
      })
      .registerEvent<void, void>("process_image", async () => {
        // TODO: Implement image processing
      });
  }

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req
  ): Promise<Res> {
    return this.chatEventRegistry.handleEvent(event, requestPayload);
  }
}
