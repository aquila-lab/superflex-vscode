import * as vscode from "vscode";

import { EventRegistry } from "./EventRegistry";

type ProcessImageRequest = {
  imageUrl: string;
};

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
      .registerEvent<ProcessImageRequest, void>(
        "process_image",
        async (req) => {
          // TODO: Implement image processing
        }
      );
  }

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req
  ): Promise<Res> {
    return this.chatEventRegistry.handleEvent(event, requestPayload);
  }
}
