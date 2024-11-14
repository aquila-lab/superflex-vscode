import path from "path";
import * as vscode from "vscode";
import { machineIdSync } from "node-machine-id";

import { EXTENSION_ID } from "./constants";
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

  // Updating the file path for current open file for wins machine
  if (runningOnWindows()) {
    uri = uri
      .replace(/^([A-Z]:)?/i, (match) => match.toLowerCase()) // Ensure drive letter is lowercase
      .replace(/\//g, "\\") // Convert forward slashes to backslashes
      .replace(/^\\+/, "") // Remove leading backslashes
      .replace(/\\+/g, "\\"); // Replace multiple backslashes with single
  }

  uri = uri.replace(/\\/g, "/");

  return path.normalize(uri);
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

export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function getExtensionVersion(): string {
  const extension = vscode.extensions.getExtension(EXTENSION_ID);
  return extension?.packageJSON.version || "unknown";
}

export function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const UNIQUE_ID_KEY = "uniqueID";
export function getUniqueID(context: vscode.ExtensionContext): { uniqueID: string; isNew: boolean } {
  let uniqueID = context.globalState.get<string>(UNIQUE_ID_KEY);

  if (!uniqueID) {
    uniqueID = vscode.env.machineId;
    if (uniqueID === "someValue.machineId") {
      uniqueID = machineIdSync();
    }
    context.globalState.update(UNIQUE_ID_KEY, uniqueID);
    return { uniqueID, isNew: true };
  }

  return { uniqueID, isNew: false };
}

export function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}
