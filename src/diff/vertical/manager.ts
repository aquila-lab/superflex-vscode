import * as vscode from "vscode";
import * as URI from "uri-js";

import { decodeUriAndRemoveFilePrefix } from "../../common/utils";
import { DiffLine } from "../types";
import { VerticalDiffHandler, VerticalDiffHandlerOptions } from "./handler";

export interface VerticalDiffCodeLens {
  start: number;
  numRed: number;
  numGreen: number;
}

export class VerticalDiffManager {
  public refreshCodeLens: () => void = () => {};

  private fileUriToHandler: Map<string, VerticalDiffHandler> = new Map();

  fileUriToCodeLens: Map<string, VerticalDiffCodeLens[]> = new Map();

  private userChangeListener: vscode.Disposable | undefined;

  logDiffs: DiffLine[] | undefined;

  constructor() {
    this.userChangeListener = undefined;
  }

  createVerticalDiffHandler(fileUri: string, startLine: number, endLine: number, options: VerticalDiffHandlerOptions) {
    if (this.fileUriToHandler.has(fileUri)) {
      this.fileUriToHandler.get(fileUri)?.clear(false);
      this.fileUriToHandler.delete(fileUri);
    }
    const editor = vscode.window.activeTextEditor;
    if (editor && URI.equal(editor.document.uri.toString(), fileUri)) {
      const handler = new VerticalDiffHandler(
        startLine,
        endLine,
        editor,
        this.fileUriToCodeLens,
        this.clearForfileUri.bind(this),
        this.refreshCodeLens,
        options
      );
      this.fileUriToHandler.set(fileUri, handler);
      return handler;
    } else {
      return undefined;
    }
  }

  getHandlerForFile(fileUri: string) {
    return this.fileUriToHandler.get(fileUri);
  }

  // Creates a listener for document changes by user.
  private enableDocumentChangeListener(): vscode.Disposable | undefined {
    if (this.userChangeListener) {
      // Only create one listener per file
      return;
    }

    this.userChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
      // Check if there is an active handler for the affected file
      const fileUri = event.document.uri.toString();
      const handler = this.getHandlerForFile(fileUri);
      if (handler) {
        // If there is an active diff for that file, handle the document change
        this.handleDocumentChange(event, handler);
      }
    });
  }

  // Listener for user doc changes is disabled during updates to the text document by superflex
  public disableDocumentChangeListener() {
    if (this.userChangeListener) {
      this.userChangeListener.dispose();
      this.userChangeListener = undefined;
    }
  }

  private handleDocumentChange(event: vscode.TextDocumentChangeEvent, handler: VerticalDiffHandler) {
    // Loop through each change in the event
    event.contentChanges.forEach((change) => {
      // Calculate the number of lines added or removed
      const linesAdded = change.text.split("\n").length - 1;
      const linesDeleted = change.range.end.line - change.range.start.line;
      const lineDelta = linesAdded - linesDeleted;

      // Update the diff handler with the new line delta
      handler.updateLineDelta(event.document.uri.toString(), change.range.start.line, lineDelta);
    });
  }

  clearForfileUri(fileUri: string | undefined, accept: boolean) {
    if (!fileUri) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }
      fileUri = activeEditor.document.uri.toString();
    }

    const handler = this.fileUriToHandler.get(fileUri);
    if (handler) {
      handler.clear(accept);
      this.fileUriToHandler.delete(fileUri);
    }

    this.disableDocumentChangeListener();

    vscode.commands.executeCommand("setContext", "superflex.diffVisible", false);
  }

  async acceptRejectVerticalDiffBlock(accept: boolean, fileUri?: string, index?: number) {
    if (!fileUri) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }
      fileUri = activeEditor.document.uri.toString();
    }

    if (typeof index === "undefined") {
      index = 0;
    }

    const blocks = this.fileUriToCodeLens.get(fileUri);
    const block = blocks?.[index];
    if (!blocks || !block) {
      return;
    }

    const handler = this.getHandlerForFile(fileUri);
    if (!handler) {
      return;
    }

    // Disable listening to file changes while superflex makes changes
    this.disableDocumentChangeListener();

    // CodeLens object removed from editorToVerticalDiffCodeLens here
    await handler.acceptRejectBlock(accept, block.start, block.numGreen, block.numRed);

    if (blocks.length === 1) {
      this.clearForfileUri(fileUri, true);
    } else {
      // Re-enable listener for user changes to file
      this.enableDocumentChangeListener();
    }

    this.refreshCodeLens();
  }

  async streamDiffLines(diffStream: AsyncGenerator<DiffLine>, instant: boolean) {
    vscode.commands.executeCommand("setContext", "superflex.diffVisible", true);

    // Get the current editor fileUri/range
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const fileUri = editor.document.uri.toString();
    const startLine = 0;
    const endLine = editor.document.lineCount - 1;

    // Check for existing handlers in the same file the new one will be created in
    const existingHandler = this.getHandlerForFile(fileUri);
    if (existingHandler) {
      existingHandler.clear(false);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });

    // Create new handler with determined start/end
    const diffHandler = this.createVerticalDiffHandler(fileUri, startLine, endLine, {
      instant,
      onStatusUpdate: (status, numDiffs, fileContent) => {},
      // void this.webviewProtocol.request("updateApplyState", {
      //   streamId,
      //   status,
      //   numDiffs,
      //   fileContent,
      //   filepath: fileUri,
      // }),
    });

    if (!diffHandler) {
      console.warn("Issue occurred while creating new vertical diff handler");
      return;
    }

    if (editor.selection) {
      // Unselect the range
      editor.selection = new vscode.Selection(editor.selection.active, editor.selection.active);
    }

    vscode.commands.executeCommand("setContext", "superflex.streamingDiff", true);

    try {
      this.logDiffs = await diffHandler.run(diffStream);

      // enable a listener for user edits to file while diff is open
      this.enableDocumentChangeListener();
    } catch (e) {
      this.disableDocumentChangeListener();
      vscode.window.showErrorMessage(`Error streaming diff: ${e}`);
    } finally {
      vscode.commands.executeCommand("setContext", "superflex.streamingDiff", false);
    }
  }

  async acceptRejectAllChanges(accept: boolean, fileUri?: string) {
    if (!fileUri) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }
      fileUri = activeEditor.document.uri.toString();
    }

    const blocks = this.fileUriToCodeLens.get(fileUri);
    if (!blocks || blocks.length === 0) {
      return;
    }

    // Process all blocks in the file
    for (let i = 0; i < blocks.length; i++) {
      await this.acceptRejectVerticalDiffBlock(accept, fileUri, i);
    }

    // Clear the diff manager for this file
    this.clearForfileUri(fileUri, accept);

    // Save the file
    const document = await vscode.workspace.openTextDocument(decodeUriAndRemoveFilePrefix(fileUri));
    await document.save();
  }
}
