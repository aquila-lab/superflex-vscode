import fs from "fs";
import path from "path";
import asyncQ from "async";

import { FilePayload } from "../../shared/protocol";
import { Message, MessageContent, TextDelta, Thread, ThreadRun } from "../../shared/model";
import * as api from "../api";
import { findWorkspaceFiles } from "../scanner";
import { jsonToMap, mapToJson } from "../common/utils";
import { SuperflexCache } from "../cache/SuperflexCache";
import { SUPPORTED_FILE_EXTENSIONS } from "../common/constants";
import { Assistant } from "./Assistant";
import { createFilesMapName } from "./common";
import { Telemetry } from "src/common/analytics/Telemetry";

const ASSISTENT_NAME = "superflex";
const FILES_MAP_VERSION = 1; // Increment the version when we need to reindex all files

export default class SuperflexAssistant implements Assistant {
  readonly workspaceDirPath: string;
  readonly owner: string;
  readonly repo: string;
  readonly cacheFileName: string;
  private _currentStream?: AbortController;

  constructor(workspaceDirPath: string, owner: string, repo: string) {
    if (!fs.existsSync(workspaceDirPath)) {
      throw new Error("Workspace path does not exist");
    }
    if (!fs.lstatSync(workspaceDirPath).isDirectory()) {
      throw new Error("Workspace path is not a directory");
    }

    this.workspaceDirPath = workspaceDirPath;
    this.owner = owner;
    this.repo = repo;
    this.cacheFileName = createFilesMapName(ASSISTENT_NAME, FILES_MAP_VERSION);
  }

  async createThread(title?: string): Promise<Thread> {
    // Abort any ongoing message stream first
    if (this._currentStream) {
      this._currentStream.abort();
      this._currentStream = undefined;
    }

    const thread = await api.createThread({ owner: this.owner, repo: this.repo, title });
    return thread;
  }

  async getThreads(): Promise<Thread[]> {
    return api.getThreads({
      owner: this.owner,
      repo: this.repo,
    });
  }

  async getThread(threadID: string): Promise<Thread> {
    return api.getThread({
      owner: this.owner,
      repo: this.repo,
      threadID: threadID,
    });
  }

  async sendMessage(
    threadID: string,
    files: FilePayload[],
    messages: MessageContent[],
    options?: {
      fromMessageID?: string;
      streamResponse?: (event: TextDelta) => void;
    }
  ): Promise<ThreadRun | null> {
    // Cancel any existing stream
    if (this._currentStream) {
      this._currentStream.abort();
      this._currentStream = undefined;
    }

    // Create new abort controller for this stream
    this._currentStream = new AbortController();

    try {
      const stream = await api.sendThreadMessage({
        owner: this.owner,
        repo: this.repo,
        threadID,
        files,
        messages,
        options: {
          signal: this._currentStream.signal,
          fromMessageID: options?.fromMessageID,
        },
      });

      // Create a promise that will reject if the stream is aborted
      const streamPromise = new Promise<ThreadRun>((resolve, reject) => {
        const streamResponse = options?.streamResponse;
        if (streamResponse) {
          stream.on("textDelta", (delta) => {
            // Check if stream was aborted
            if (this._currentStream?.signal.aborted) {
              reject(new Error("canceled"));
              return;
            }

            streamResponse(delta);
          });
        }

        stream.final().then(resolve).catch(reject);
      });

      const message = await streamPromise;
      this._currentStream = undefined;
      return message;
    } catch (err) {
      this._currentStream = undefined;
      if (err instanceof Error && err.message === "canceled") {
        return null;
      }
      throw err;
    }
  }

  async updateMessage(message: Message): Promise<void> {
    await api.updateMessage({
      owner: this.owner,
      repo: this.repo,
      threadID: message.threadID,
      messageID: message.id,
      feedback: message.feedback,
    });
  }

  async fastApply(code: string, edits: string): Promise<string> {
    return api.fastApply({ code, edits });
  }

  async syncFiles(progressCb?: (current: number, isFirstTimeSync?: boolean) => void): Promise<void> {
    const packageJsonPath = path.join(this.workspaceDirPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    if (!SuperflexCache.storagePath) {
      throw new Error("Storage path is not set");
    }

    const documentPaths: string[] = await findWorkspaceFiles(this.workspaceDirPath);
    if (documentPaths.length === 0) {
      throw Error(
        `No supported files found in the workspace.\nSupported file extensions are: ${SUPPORTED_FILE_EXTENSIONS}`
      );
    }

    const repoExists = await api.repoExists({ owner: this.owner, repo: this.repo });

    // If the repo does not exist, we will ignore the cache and upload all files
    let cachedFilesMap: Map<string, number> = new Map<string, number>();
    if (repoExists) {
      const rawCachedFilesMap = SuperflexCache.get(this.cacheFileName);
      cachedFilesMap = rawCachedFilesMap ? jsonToMap<number>(rawCachedFilesMap) : new Map<string, number>();
    }

    if (progressCb) {
      progressCb(0, !repoExists);
    }

    const progressCoefficient = 98 / documentPaths.length;

    const workers = this.createSyncWorkers(cachedFilesMap, 10);
    await this.processFiles(workers, cachedFilesMap, documentPaths, progressCoefficient, progressCb);

    if (progressCb) {
      progressCb(99);
    }

    await this.cleanUpFiles(cachedFilesMap, documentPaths);
    SuperflexCache.set(this.cacheFileName, mapToJson(cachedFilesMap));

    if (progressCb) {
      progressCb(100, false);
    }
  }

  private createSyncWorkers(cachedFilesMap: Map<string, number>, concurrency: number): asyncQ.QueueObject<string[]> {
    const workers = asyncQ.queue(async (documentPaths: string[]) => {
      const files = documentPaths.map((documentPath) => {
        const relativePath = path.relative(this.workspaceDirPath, documentPath);
        return {
          relativePath,
          source: fs.readFileSync(documentPath).toString(),
          modifiedTime: fs.statSync(documentPath).mtime.getTime(),
        };
      });

      try {
        await api.uploadFiles({ owner: this.owner, repo: this.repo, files });

        for (const file of files) {
          cachedFilesMap.set(file.relativePath, file.modifiedTime);
        }
        SuperflexCache.set(this.cacheFileName, mapToJson(cachedFilesMap));
      } catch (err: any) {
        if (err?.statusCode === api.HttpStatusCode.UNAUTHORIZED) {
          throw err;
        }
        console.error(`Failed to upload files: ${err?.message}`);
      }
    }, concurrency);

    return workers;
  }

  private processFiles(
    workers: asyncQ.QueueObject<string[]>,
    cachedFilesMap: Map<string, number>,
    documentPaths: string[],
    progressCoefficient: number,
    progressCb?: (current: number) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (documentPaths.length === 0) {
        resolve();
        return;
      }

      const maxFilesPerRequest = 1;
      let workersCount = 0;
      let filesToUpload: string[] = [];
      for (let i = 0; i < documentPaths.length; i++) {
        const documentPath = documentPaths[i];
        const relativePath = path.relative(this.workspaceDirPath, documentPath);

        const fileStat = fs.statSync(documentPath);
        const cachedFileLastModifiedAt = cachedFilesMap.get(relativePath);

        // Skip uploading the file if it has not been modified since the last upload
        if (cachedFileLastModifiedAt && fileStat.mtime.getTime() <= cachedFileLastModifiedAt) {
          continue;
        }

        filesToUpload.push(documentPath);

        // Upload the files in batches of maxFilesPerRequest
        if (filesToUpload.length >= maxFilesPerRequest) {
          workersCount++;
          workers.push([filesToUpload], () => {
            if (progressCb) {
              progressCb(Math.round(i * progressCoefficient));
            }
          });

          filesToUpload = [];
        }
      }

      // Upload the remaining files
      if (filesToUpload.length > 0) {
        workersCount++;
        workers.push([filesToUpload], () => {
          if (progressCb) {
            progressCb(Math.round(documentPaths.length * progressCoefficient));
          }
        });

        filesToUpload = [];
      }

      if (workersCount === 0) {
        resolve();
        return;
      }

      // Resolve the promise when all tasks are finished
      workers.drain(() => {
        console.info("Indexing workspace project completed successfully.");
        resolve();
      });

      // Optionally handle errors
      workers.error((err, task) => {
        console.error(`Error processing file ${task}: ${err.message}`);
        reject(err);
      });
    });
  }

  private async cleanUpFiles(cachedFilesMap: Map<string, number>, documentPaths: string[]): Promise<void> {
    const removeFiles: string[] = [];
    cachedFilesMap.forEach((_, relativePath) => {
      const exists = documentPaths.find(
        (documentPath) => path.relative(this.workspaceDirPath, documentPath) === relativePath
      );
      if (exists) {
        return;
      }

      removeFiles.push(relativePath);
    });

    try {
      await api.removeFiles({ owner: this.owner, repo: this.repo, files: removeFiles });

      for (const relativePath of removeFiles) {
        cachedFilesMap.delete(relativePath);
      }
    } catch (err: any) {
      if (err?.statusCode === api.HttpStatusCode.UNAUTHORIZED) {
        throw err;
      }
      console.error(`Failed to delete files: ${err?.message}`);
    }
  }
}
