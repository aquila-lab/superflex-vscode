import fs from "fs";
import path from "path";
import * as vscode from "vscode";

import { decodeUriAndRemoveFilePrefix } from "../common/utils";

class SuperflexCacheClass {
  workspaceFolderPath: string | undefined;
  storagePath: string | undefined;
  globalStoragePath: string | undefined;

  setWorkspaceFolderPath(workspaceFolderPath: vscode.Uri): void {
    this.workspaceFolderPath = decodeUriAndRemoveFilePrefix(workspaceFolderPath.path);
  }

  setStoragePath(storageUri: vscode.Uri | undefined): void {
    if (!storageUri) {
      return;
    }

    const storagePath = decodeUriAndRemoveFilePrefix(storageUri.path);
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    this.storagePath = storagePath;
  }

  setGlobalStoragePath(globalStorageUri: vscode.Uri): void {
    const globalStoragePath = decodeUriAndRemoveFilePrefix(globalStorageUri.path);
    if (!fs.existsSync(globalStoragePath)) {
      fs.mkdirSync(globalStoragePath, { recursive: true });
    }

    this.globalStoragePath = globalStoragePath;
  }

  /**
   * Get the file from the cache.
   *
   * @param filename The name of the file to get.
   * @returns The data of the file.
   */
  get(filename: string): string | undefined {
    if (!this.storagePath) {
      throw new Error("Storage path is not set");
    }

    const file = path.join(this.storagePath, filename);
    if (!fs.existsSync(file)) {
      return undefined;
    }

    return fs.readFileSync(file, "utf8");
  }

  /**
   * Set the file in the cache. If the file already exists, it will be overwritten.
   *
   * @param filename The name of the file to set.
   * @param data The data to set.
   */
  set(filename: string, data: string): void {
    if (!this.storagePath) {
      throw new Error("Storage path is not set");
    }

    const writeBuffer = Buffer.from(data);
    fs.writeFileSync(path.join(this.storagePath, filename), writeBuffer);
  }

  /**
   * Get the file from the global cache.
   *
   * @param filename The name of the file to get.
   * @returns The data of the file.
   */
  getGlobal(filename: string): string | undefined {
    if (!this.globalStoragePath) {
      throw new Error("Global storage path is not set");
    }

    const file = path.join(this.globalStoragePath, filename);
    if (!fs.existsSync(file)) {
      return undefined;
    }

    return fs.readFileSync(file, "utf8");
  }

  /**
   * Set the file in the global cache. If the file already exists, it will be overwritten.
   *
   * @param filename The name of the file to set.
   * @param data The data to set.
   */
  setGlobal(filename: string, data: string): void {
    if (!this.globalStoragePath) {
      throw new Error("Global storage path is not set");
    }

    const writeBuffer = Buffer.from(data);
    fs.writeFileSync(path.join(this.globalStoragePath, filename), writeBuffer);
  }
}

const SuperflexCache = new SuperflexCacheClass();

export { SuperflexCache };
