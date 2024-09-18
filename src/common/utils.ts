import path from "path";
import * as vscode from "vscode";

import { runningOnWindows } from "./operatingSystem";

function lowercaseDriveLetter(uri: string) {
  return uri.replace(/^\/?\w+:/, (match) => match.toLowerCase());
}

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

  uri = uri.replace(/\\/g, "/");
  uri = lowercaseDriveLetter(uri);

  // Remove leading slash on Windows
  if (runningOnWindows() && uri.startsWith("/")) {
    uri = uri.replace("/", "");
  }

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
