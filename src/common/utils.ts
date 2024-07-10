import * as vscode from "vscode";
import * as crypto from "crypto";

import { runningOnWindows } from "./operatingSystem";

export function lowercaseDriveLetter(uri: string) {
  return uri.replace(/^\/?\w+:/, (match) => match.toLowerCase());
}

export function decodeUriAndRemoveFilePrefix(uri: string): string {
  if (runningOnWindows() && uri && uri.includes("file:///")) {
    uri = uri.replace("file:///", "");
  } else if (uri && uri.includes("file://")) {
    uri = uri.replace("file://", "");
  }

  if (uri) {
    uri = decodeURIComponent(uri);
  }

  uri = uri.replace(/\\/g, "/");

  return lowercaseDriveLetter(uri);
}

export function toBase64UrlEncoding(buffer: Buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function sha256(buffer: string | Uint8Array): Buffer {
  return crypto.createHash("sha256").update(buffer).digest();
}

export function getOpenWorkspace(): vscode.WorkspaceFolder | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  if (workspaceFolders.length === 0) {
    return undefined;
  }

  return workspaceFolders[0];
}
