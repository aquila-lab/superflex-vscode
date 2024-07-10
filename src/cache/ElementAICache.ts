import fs from "fs";
import path from "path";

class ElementAICacheClass {
  private _workspaceFolderPath: string | undefined;
  private _storagePath: string | undefined;

  setWorkspaceFolderPath(workspaceFolderPath: string | undefined): void {
    if (workspaceFolderPath) {
      workspaceFolderPath = workspaceFolderPath.replace("file://", "");
    }

    this._workspaceFolderPath = workspaceFolderPath;
  }

  setStoragePath(storagePath: string | undefined): void {
    if (storagePath) {
      storagePath = storagePath.replace("file://", "");

      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
    }

    this._storagePath = storagePath;
  }

  cacheFilesSync(filePaths: string[]): string[] {
    if (!this._workspaceFolderPath || !this._storagePath) {
      throw new Error("Workspace folder path or storage path is not set");
    }

    const cacheFolder = path.join(this._storagePath, "files");
    if (!fs.existsSync(cacheFolder)) {
      fs.mkdirSync(cacheFolder, { recursive: true });
    }

    const documentPaths: string[] = [];
    for (const filePath of filePaths) {
      const documentPath = path.join(cacheFolder, `${filePath.replace(this._workspaceFolderPath, "")}.txt`);
      if (!fs.existsSync(path.dirname(documentPath))) {
        fs.mkdirSync(path.dirname(documentPath), { recursive: true });
      }

      fs.copyFileSync(filePath, documentPath);
      documentPaths.push(documentPath);
    }

    return documentPaths;
  }

  removeCachedFilesSync(): void {
    if (!this._storagePath) {
      throw new Error("Storage path is not set");
    }

    const cachedFilesFolder = path.join(this._storagePath, "files");
    fs.rmdirSync(cachedFilesFolder, { recursive: true });
  }
}

const ElementAICache = new ElementAICacheClass();

export { ElementAICache };
