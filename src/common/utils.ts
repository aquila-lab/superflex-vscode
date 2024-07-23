import * as vscode from "vscode";
import * as crypto from "crypto";

import { runningOnWindows } from "./operatingSystem";

export function decodeUriAndRemoveFilePrefix(uri: string): string {
  if (runningOnWindows() && uri && uri.includes("file:///")) {
    uri = uri.replace("file:///", "");
  } else if (uri && uri.includes("file://")) {
    uri = uri.replace("file://", "");
  }
  if (uri && uri.includes("vscode-userdata:")) {
    uri = uri.replace("vscode-userdata:", "");
  }

  if (uri) {
    uri = decodeURIComponent(uri);
  }

  return uri;
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

// Generic helper function to convert Map to JSON
export function mapToJson<T>(map: Map<string, T>): string {
  return JSON.stringify(Array.from(map.entries()));
}

// Generic helper function to convert JSON to Map
export function jsonToMap<T>(jsonStr: string, reviver?: (key: string, value: any) => T): Map<string, T> {
  const entries: [string, T][] = JSON.parse(jsonStr);
  return new Map<string, T>(entries.map(([key, value]) => [key, reviver ? reviver(key, value) : value]));
}

export function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
