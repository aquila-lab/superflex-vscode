import fs from "fs";
import path from "path";
import asyncQ from "async";

import * as api from "../api";
import { Thread } from "../core/Thread.model";
import { SuperflexCache } from "../cache/SuperflexCache";
import { Message, MessageReqest, TextDelta } from "../core/Message.model";
import { Assistant } from "./Assistant";
import { createFilesMapName } from "./common";

const ASSISTENT_NAME = "Superflex";

export default class SuperflexAssistant implements Assistant {
  readonly projectRootPath: string;
  readonly owner: string;
  readonly repo: string;

  constructor(projectRootPath: string, owner: string, repo: string) {
    if (!fs.existsSync(projectRootPath)) {
      throw new Error("Root path does not exist");
    }
    if (!fs.lstatSync(projectRootPath).isDirectory()) {
      throw new Error("Root path is not a directory");
    }

    this.projectRootPath = projectRootPath;
    this.owner = owner;
    this.repo = repo;
  }

  async createThread(title?: string): Promise<Thread> {
    const thread = await api.createThread({ owner: this.owner, repo: this.repo, title });
    return thread;
  }

  async sendMessage(
    threadID: string,
    messages: MessageReqest[],
    streamResponse?: (event: TextDelta) => void
  ): Promise<Message> {
    const message = await api.sendThreadMessage({ owner: this.owner, repo: this.repo, threadID, messages });

    // const stream = await api.stream.sendThreadMessage({ owner: this.owner, repo: this.repo, threadID, messages });
    //
    // if (streamResponse) {
    //   stream.on("textDelta", (event) => streamResponse({ value: event.value }));
    // }
    //
    // const message = await stream.final();

    return message;
  }

  async syncFiles(progressCb?: (current: number) => void): Promise<void> {
    if (!SuperflexCache.storagePath) {
      throw new Error("Storage path is not set");
    }

    if (progressCb) {
      progressCb(0);
    }

    const storagePath = SuperflexCache.storagePath;
    const cachedFilePathToIDMap = SuperflexCache.get(createFilesMapName(ASSISTENT_NAME));
    const filePathToIDMap: Map<string, CachedFile> = cachedFilePathToIDMap
      ? jsonToMap<CachedFile>(cachedFilePathToIDMap, cachedFileReviver)
      : new Map<string, CachedFile>();

    const documentPaths = SuperflexCache.cacheFilesSync(filePaths, { ext: ".txt" });
    const progressCoefficient = 98 / documentPaths.length;

    const workers = this.createSyncWorkers(filePathToIDMap, storagePath, 10);
    await this.processFiles(workers, documentPaths, progressCoefficient, progressCb);

    if (progressCb) {
      progressCb(99);
    }

    await this.cleanUpFiles(filePathToIDMap, documentPaths, storagePath);

    SuperflexCache.set(FILE_ID_MAP_NAME, mapToJson(filePathToIDMap));
    SuperflexCache.removeCachedFilesSync();

    if (progressCb) {
      progressCb(100);
    }
  }

  private createSyncWorkers(
    filePathToIDMap: Map<string, CachedFile>,
    storagePath: string,
    concurrency: number
  ): asyncQ.QueueObject<CachedFileObject> {
    const workers = asyncQ.queue(async (documentPath: CachedFileObject) => {
      const fileStat = fs.statSync(documentPath.originalPath);

      const relativeFilepath = path.relative(storagePath, documentPath.cachedPath);
      const cachedFile = filePathToIDMap.get(relativeFilepath);

      // Skip uploading the file if it has not been modified since the last upload
      if (cachedFile && fileStat.mtime.getTime() <= cachedFile.createdAt) {
        return;
      }

      try {
        if (cachedFile) {
          try {
            await this._openai.files.del(cachedFile.fileID);
          } catch (err) {
            // Ignore
          }
        }

        const file = await this._openai.files.create({
          file: fs.createReadStream(documentPath.cachedPath),
          purpose: "assistants",
        });

        await this._openai.beta.vectorStores.files.createAndPoll(this.id, { file_id: file.id });

        filePathToIDMap.set(relativeFilepath, { fileID: file.id, createdAt: fileStat.mtime.getTime() });
      } catch (err: any) {
        console.error(`Failed to upload file ${documentPath}: ${err?.message}`);
      }
    }, concurrency); // Number of concurrent workers

    return workers;
  }

  private processFiles(
    workers: asyncQ.QueueObject<CachedFileObject>,
    documentPaths: CachedFileObject[],
    progressCoefficient: number,
    progressCb?: (current: number) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (documentPaths.length === 0) {
        resolve();
        return;
      }

      documentPaths.forEach((documentPath, index) => {
        workers.push(documentPath, () => {
          if (progressCb) {
            progressCb(Math.round(index * progressCoefficient));
          }
        });
      });

      // Resolve the promise when all tasks are finished
      workers.drain(() => {
        console.info("Syncing files completed successfully.");
        resolve();
      });

      // Optionally handle errors
      workers.error((err, task) => {
        console.error(`Error processing file ${task}: ${err.message}`);
        reject(err);
      });
    });
  }

  private async cleanUpFiles(
    filePathToIDMap: Map<string, CachedFile>,
    documentPaths: CachedFileObject[],
    storagePath: string
  ): Promise<void> {
    for (const [relativeFilepath, cachedFile] of filePathToIDMap) {
      const exists = documentPaths.find(
        (documentPath) => path.relative(storagePath, documentPath.cachedPath) === relativeFilepath
      );
      if (exists) {
        continue;
      }

      try {
        await this._openai.files.del(cachedFile.fileID);
        filePathToIDMap.delete(relativeFilepath);
      } catch (err: any) {
        if (err?.status === 404) {
          filePathToIDMap.delete(relativeFilepath);
          return;
        }
        console.error(`Failed to delete file ${relativeFilepath}: ${err?.message}`);
      }
    }
  }
}
