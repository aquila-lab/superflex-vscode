import fs from 'node:fs'
import path from 'node:path'
import { Mutex } from 'async-mutex'
import * as vscode from 'vscode'

import { AppError, AppErrorSlug } from 'shared/model/AppError.model'
import { SUPERFLEX_RULES_FILE_NAME } from '../../shared/common/constants'
import {
  type Message,
  type MessageContent,
  type Thread,
  extractFigmaSelectionUrl
} from '../../shared/model'
import {
  type EventRequestPayload,
  EventRequestType,
  type EventResponseMessage,
  type EventResponsePayload,
  EventResponseType,
  type FastApplyPayload,
  type FetchThreadsPayload,
  type FilePayload,
  newEventResponse
} from '../../shared/protocol'
import * as api from '../api'
import {
  HttpStatusCode,
  getFigmaSelectionImageUrl,
  validateFigmaSelection
} from '../api'
import type { Assistant } from '../assistant'
import SuperflexAssistant from '../assistant/SuperflexAssistant'
import { Telemetry } from '../common/analytics/Telemetry'
import { FIGMA_AUTH_PROVIDER_ID } from '../common/constants'
import { enrichFilePayloads } from '../common/files'
import {
  decodeUriAndRemoveFilePrefix,
  generateFileID,
  getOpenWorkspace,
  toKebabCase
} from '../common/utils'
import { createDiffStream, myersDiff } from '../diff/myers'
import type { VerticalDiffManager } from '../diff/vertical/manager'
import { findWorkspaceFiles } from '../scanner'
import { EventRegistry, type Handler } from './EventRegistry'

/**
 * ChatAPI class for interacting with the chat service.
 */
export class ChatAPI {
  private _assistant?: Assistant
  private _isReady = false
  private _ready = new vscode.EventEmitter<void>()
  private _isInitialized = false
  private _initializedMutex = new Mutex()
  private _chatEventRegistry = new EventRegistry()
  private _isSyncProjectRunning = false
  private _thread?: Thread
  private _workspaceDirPath?: string
  private _isPremiumGeneration = true
  public verticalDiffManager: VerticalDiffManager

  constructor(verticalDiffManager: VerticalDiffManager) {
    this.verticalDiffManager = verticalDiffManager

    this._chatEventRegistry
      /**
       * Event (ready): This event is fired when the webview is ready to receive events.
       */
      .registerEvent(EventRequestType.READY, () => {
        this._ready.fire()
        this._isReady = true
        Telemetry.capture('ready', {})
      })

      /**
       * Event (initialized): This event is fired when the webview Chat page is initialized.
       * It is used to sync the project files with the webview.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves with the initialized state.
       * @throws An error if the project files cannot be synced.
       */
      .registerEvent(
        EventRequestType.INITIALIZED,
        async (_, sendEventMessageCb) => {
          const release = await this._initializedMutex.acquire()

          try {
            let isFigmaAuthenticated = false

            const openWorkspace = getOpenWorkspace()
            if (!openWorkspace) {
              Telemetry.capture('workspace_not_found', {})
              return { isInitialized: false, isFigmaAuthenticated }
            }

            this._workspaceDirPath = decodeUriAndRemoveFilePrefix(
              openWorkspace.uri.path
            )
            this._assistant = new SuperflexAssistant(
              this._workspaceDirPath,
              'local',
              toKebabCase(openWorkspace.name)
            )

            this.syncProjectFiles(sendEventMessageCb)

            this._isInitialized = true

            const session = await vscode.authentication.getSession(
              FIGMA_AUTH_PROVIDER_ID,
              []
            )
            if (session?.accessToken) {
              isFigmaAuthenticated = true
            }

            Telemetry.capture('initialized', {})

            const user = await api.getUserInfo()
            sendEventMessageCb(
              newEventResponse(EventResponseType.GET_USER_INFO, user)
            )

            const subscription = await api.getUserSubscription()
            sendEventMessageCb(
              newEventResponse(
                EventResponseType.GET_USER_SUBSCRIPTION,
                subscription
              )
            )

            return { isInitialized: true, isFigmaAuthenticated }
          } finally {
            release()
          }
        }
      )

      /**
       * Event (sync_project): This event is fired when the user clicks the "Sync Project" button in the webview.
       * Additionally, it is periodically triggered from the webview to ensure project files remain synchronized.
       * It is used to sync the project files with AI code assistant.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves when the project files are synced.
       * @throws An error if the project files cannot be synced.
       */
      .registerEvent(
        EventRequestType.SYNC_PROJECT,
        async (_, sendEventMessageCb) => {
          // Prevent multiple sync project requests from running concurrently
          if (!this._isInitialized || this._isSyncProjectRunning) {
            return
          }

          this._isSyncProjectRunning = true

          await this.syncProjectFiles(sendEventMessageCb)

          this._isSyncProjectRunning = false
        }
      )

      /**
       * Event (new_thread): This event is fired when the user clicks the "New Chat" button in the webview.
       * It is used to create a new chat thread with AI code assistant.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves when the new chat thread is created.
       * @throws An error if the new chat thread cannot be created.
       */
      .registerEvent(
        EventRequestType.NEW_THREAD,
        async (_, sendEventMessageCb) => {
          if (!this._isInitialized || !this._assistant) {
            return false
          }

          this._thread = await this._assistant.createThread()

          Telemetry.capture('new_thread', {
            threadID: this._thread?.id ?? ''
          })

          this._assistant.getThreads({ take: 10 }).then(threads => {
            sendEventMessageCb(
              newEventResponse(EventResponseType.FETCH_THREADS, threads)
            )
          })

          return this._thread
        }
      )

      /**
       * Event (fetch_threads): This event is fired when the webview needs to fetch all threads.
       * It is used to fetch all threads from the assistant.
       *
       * @returns A promise that resolves with all threads.
       * @throws An error if the threads cannot be fetched.
       */
      .registerEvent(
        EventRequestType.FETCH_THREADS,
        async (payload: FetchThreadsPayload) => {
          if (!this._isInitialized || !this._assistant) {
            return []
          }

          return this._assistant.getThreads(payload)
        }
      )

      /**
       * Event (fetch_thread): This event is fired when the webview needs to fetch a specific thread.
       * It is used to fetch a thread by its ID from the assistant.
       *
       * @param payload - Payload containing the thread ID.
       * @returns A promise that resolves with the thread.
       * @throws An error if the thread cannot be fetched.
       */
      .registerEvent(
        EventRequestType.FETCH_THREAD,
        async (payload: { threadID: string }) => {
          if (
            !this._isInitialized ||
            !this._assistant ||
            !this._workspaceDirPath
          ) {
            return null
          }

          this._thread = await this._assistant.getThread(payload.threadID)

          for (const message of this._thread.messages) {
            if (!message.content.files) {
              continue
            }

            message.content.files = enrichFilePayloads(
              message.content.files,
              this._workspaceDirPath
            )
          }

          return this._thread
        }
      )

      /**
       * Event (update_thread): This event is fired when the user updates a thread.
       * It is used to update a thread by its ID from the assistant.
       *
       * @param payload - Payload containing the thread ID and title.
       * @returns A promise that resolves with the updated thread.
       */
      .registerEvent(
        EventRequestType.UPDATE_THREAD,
        async (payload: { threadID: string; title: string }) => {
          if (!this._assistant) {
            return
          }

          return this._assistant.updateThread(payload.threadID, payload.title)
        }
      )

      /**
       * Event (delete_thread): This event is fired when the user deletes a thread.
       * It is used to delete a thread by its ID from the assistant.
       *
       * @param payload - Payload containing the thread ID.
       * @returns A promise that resolves when the thread is deleted.
       */
      .registerEvent(
        EventRequestType.DELETE_THREAD,
        async (payload: { threadID: string }) => {
          if (!this._assistant) {
            return
          }

          await this._assistant.deleteThread(payload.threadID)

          return { threadID: payload.threadID }
        }
      )

      /**
       * Event (create_figma_attachment): This event is fired when the user selects a Figma file in the webview.
       * It is used to extract the Figma selection URL get image url and send it back to the webview.
       *
       * @param payload - Payload containing the Figma selection link.
       * @returns A promise that resolves with the FigmaAttachment.
       */
      .registerEvent(
        EventRequestType.CREATE_FIGMA_ATTACHMENT,
        async (payload: string, _) => {
          if (!this._isInitialized) {
            throw new AppError(
              'Chat is not initialized',
              AppErrorSlug.ChatNotInitialized
            )
          }

          if (!payload) {
            throw new AppError(
              'Figma selection link is required',
              AppErrorSlug.FigmaSelectionLinkRequired
            )
          }

          const figmaSelectionUrl = extractFigmaSelectionUrl(payload)
          if (!figmaSelectionUrl) {
            throw new AppError(
              'Invalid Figma selection link',
              AppErrorSlug.InvalidFigmaSelectionLink
            )
          }

          const imageUrl = await getFigmaSelectionImageUrl(figmaSelectionUrl)

          const warning = await validateFigmaSelection(figmaSelectionUrl)

          return {
            fileID: figmaSelectionUrl.fileID,
            nodeID: figmaSelectionUrl.nodeID,
            imageUrl,
            warning
          }
        }
      )

      /**
       * Event (stop_message): This event is fired when the user clicks the "Stop" button in the webview Chat.
       * It is used to stop the message stream.
       */
      .registerEvent(EventRequestType.STOP_MESSAGE, async () => {
        if (!this._isInitialized || !this._assistant) {
          return
        }

        this._assistant.stopMessage()
        return true
      })

      /**
       * Event (send_message): This event is fired when the user sends a message in the webview Chat.
       * It is used to send a message to the AI code assistant, and return the assistant's message response.
       *
       * @param payload - Payload containing the messages to send.
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       */
      .registerEvent(
        EventRequestType.SEND_MESSAGE,
        async (payload: MessageContent, sendEventMessageCb) => {
          if (
            !this._isInitialized ||
            !this._assistant ||
            !this._workspaceDirPath
          ) {
            return null
          }

          const timeNow = Date.now()

          let thread = this._thread
          if (!thread) {
            thread = await this._assistant.createThread()
            this._thread = thread
          }

          const { stream, response } = await this._assistant.sendMessage(
            thread.id,
            payload
          )

          for await (const delta of stream) {
            switch (delta.type) {
              case 'delta': {
                sendEventMessageCb(
                  newEventResponse(
                    EventResponseType.MESSAGE_TEXT_DELTA,
                    delta.textDelta
                  )
                )
                break
              }
              case 'complete': {
                if (delta.message?.content.files) {
                  delta.message.content.files = enrichFilePayloads(
                    delta.message.content.files,
                    this._workspaceDirPath
                  )
                }

                sendEventMessageCb(
                  newEventResponse(
                    EventResponseType.MESSAGE_COMPLETE,
                    delta.message
                  )
                )
                break
              }
            }
          }

          const { isPremium } = await response()

          Telemetry.capture('new_message', {
            threadID: thread.id,
            numberOfSelectedFiles: (payload.files ?? []).length,
            isFigmaFileAttached: payload.attachment?.figma !== undefined,
            isImageFileAttached: payload.attachment?.image !== undefined,
            processingDeltaTimeMs: Date.now() - timeNow
          })

          // Send subscription prompt if user is out of premium requests
          if (!isPremium && this._isPremiumGeneration) {
            sendEventMessageCb(
              newEventResponse(EventResponseType.SHOW_SOFT_PAYWALL_MODAL)
            )
          }
          this._isPremiumGeneration = isPremium

          return true
        }
      )

      /**
       * Event (fast_apply): This event is used to apply the code to the file in the workspace.
       * Limited functionality for now: Only supports writing to the new file.
       *
       * @param payload - Payload containing the file path and code.
       * @returns A promise that resolves when the code is applied.
       * @throws An error if the code cannot be applied.
       */
      .registerEvent(
        EventRequestType.FAST_APPLY,
        async (payload: FastApplyPayload) => {
          if (!this._workspaceDirPath || !this._assistant) {
            return false
          }

          const resolvedPath = path.resolve(
            this._workspaceDirPath,
            decodeUriAndRemoveFilePrefix(payload.filePath)
          )

          if (fs.existsSync(resolvedPath)) {
            Telemetry.capture('fast_apply_called', { createdFile: false })

            const document =
              await vscode.workspace.openTextDocument(resolvedPath)
            const originalCode = fs.readFileSync(resolvedPath, 'utf8')

            let modifiedCode = payload.edits
            if (originalCode !== '') {
              modifiedCode = await this._assistant.fastApply(
                originalCode,
                payload.edits
              )
            }

            // Create diff lines using Myers diff algorithm
            const diffLines = myersDiff(originalCode, modifiedCode)

            // Show the document
            await vscode.window.showTextDocument(document)

            // Stream the diffs
            await this.verticalDiffManager.streamDiffLines(
              createDiffStream(diffLines),
              false
            )
            return true
          }

          Telemetry.capture('fast_apply_called', { createdFile: true })

          // Handle new file creation
          const directory = path.dirname(resolvedPath)
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
          }

          fs.writeFileSync(resolvedPath, '', 'utf8')
          const document = await vscode.workspace.openTextDocument(resolvedPath)

          // Create diff lines using Myers diff algorithm
          const diffLines = myersDiff('', payload.edits)

          // Show the document
          await vscode.window.showTextDocument(document)

          // Stream the diffs
          await this.verticalDiffManager.streamDiffLines(
            createDiffStream(diffLines),
            true
          )

          return true
        }
      )

      /**
       * Event (fast_apply_accept): This event is used to accept all changes in the streaming fast apply.
       *
       * @param payload - Payload containing the file path.
       * @returns A promise that resolves when the changes are accepted.
       * @throws An error if the changes cannot be accepted.
       */
      .registerEvent(
        EventRequestType.FAST_APPLY_ACCEPT,
        async (payload: { filePath: string }) => {
          if (!this._workspaceDirPath) {
            return false
          }

          const resolvedPath = path.resolve(
            this._workspaceDirPath,
            decodeUriAndRemoveFilePrefix(payload.filePath)
          )
          if (!fs.existsSync(resolvedPath)) {
            return false
          }

          // Show the document first
          const document = await vscode.workspace.openTextDocument(resolvedPath)
          await vscode.window.showTextDocument(document)

          // Accept all changes in the current diff
          await this.verticalDiffManager.acceptRejectAllChanges(
            true,
            document.uri.toString()
          )
          return true
        }
      )

      /**
       * Event (fast_apply_reject): This event is used to reject all changes in the streaming fast apply.
       *
       * @param payload - Payload containing the file path.
       * @returns A promise that resolves when the changes are rejected.
       * @throws An error if the changes cannot be rejected.
       */
      .registerEvent(
        EventRequestType.FAST_APPLY_REJECT,
        async (payload: { filePath: string }) => {
          if (!this._workspaceDirPath) {
            return false
          }

          const resolvedPath = path.resolve(
            this._workspaceDirPath,
            decodeUriAndRemoveFilePrefix(payload.filePath)
          )
          if (!fs.existsSync(resolvedPath)) {
            return false
          }

          // Show the document first
          const document = await vscode.workspace.openTextDocument(resolvedPath)
          await vscode.window.showTextDocument(document)

          // Reject all changes in the current diff
          await this.verticalDiffManager.acceptRejectAllChanges(
            false,
            document.uri.toString()
          )

          const fileContent = fs.readFileSync(resolvedPath, 'utf8')
          if (fileContent.trim() === '') {
            await vscode.commands.executeCommand(
              'workbench.action.closeActiveEditor'
            )
            fs.unlinkSync(resolvedPath)
          }

          return true
        }
      )

      /**
       * Event (open_file): This event is fired when the user clicks on a file in the webview.
       * It is used to open the file in the VS Code editor.
       *
       * @param payload - Payload containing the relative file path.
       */
      .registerEvent(
        EventRequestType.OPEN_FILE,
        async (payload: { filePath: string }) => {
          if (!this._workspaceDirPath) {
            return
          }

          const resolvedPath = path.resolve(
            this._workspaceDirPath,
            decodeUriAndRemoveFilePrefix(payload.filePath)
          )
          if (!fs.existsSync(resolvedPath)) {
            return
          }

          const document = await vscode.workspace.openTextDocument(resolvedPath)
          await vscode.window.showTextDocument(document)
        }
      )

      /**
       * Event (fetch_files): This event is fired when the webview needs to fetch the project files.
       * It is used to fetch the project files from the workspace directory.
       *
       * @returns A promise that resolves with the project files.
       * @throws An error if the project files cannot be fetched.
       */
      .registerEvent(EventRequestType.FETCH_FILES, async () => {
        if (!this._workspaceDirPath) {
          return []
        }

        const workspaceDirPath = this._workspaceDirPath
        const documentPaths: string[] = await findWorkspaceFiles(
          workspaceDirPath,
          ['**/*']
        )
        return documentPaths
          .sort((a, b) => {
            const statA = fs.statSync(a)
            const statB = fs.statSync(b)
            return statB.mtime.getTime() - statA.mtime.getTime()
          })
          .map(docPath => {
            const relativePath = path.relative(workspaceDirPath, docPath)
            return {
              id: generateFileID(relativePath),
              name: path.basename(docPath),
              path: docPath,
              relativePath
            } as FilePayload
          })
      })

      /**
       * Event (fetch_file_content): This event is fired when the webview needs to fetch the content of a file.
       * It is used to fetch the content of a file from the workspace directory.
       *
       * @param payload - Payload containing the file path.
       * @returns A promise that resolves with the file content.
       * @throws An error if the file content cannot be fetched.
       */
      .registerEvent(
        EventRequestType.FETCH_FILE_CONTENT,
        (payload: FilePayload) => {
          if (
            !this._isInitialized ||
            !this._workspaceDirPath ||
            !payload.path ||
            !fs.existsSync(payload.path)
          ) {
            return null
          }

          return fs.readFileSync(payload.path, 'utf8')
        }
      )

      /**
       * Event (fetch_current_open_file): This event is fired when the webview needs to fetch the current open file.
       * It is used to fetch the current open file from the extension.
       *
       * @returns A promise that resolves with the current open file.
       * @throws An error if the current open file cannot be fetched.
       */
      .registerEvent(EventRequestType.FETCH_CURRENT_OPEN_FILE, () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          return null
        }

        const newCurrentOpenFile = decodeUriAndRemoveFilePrefix(
          editor.document.uri.path
        )
        const relativePath = path.relative(
          this._workspaceDirPath ?? '',
          newCurrentOpenFile
        )

        return {
          id: generateFileID(relativePath),
          name: path.basename(newCurrentOpenFile),
          path: newCurrentOpenFile,
          relativePath,
          isCurrentOpenFile: true
        }
      })

      /**
       * Event (fetch_superflex_rules): This event is fired when the webview needs to fetch the superflex rules.
       * It is used to fetch the superflex rules from the extension.
       *
       * @returns A promise that resolves with the superflex rules.
       * @throws An error if the superflex rules cannot be fetched.
       */
      .registerEvent(EventRequestType.FETCH_SUPERFLEX_RULES, () => {
        if (!this._isInitialized || !this._workspaceDirPath) {
          return null
        }

        const superflexRulesPath = path.resolve(
          this._workspaceDirPath,
          SUPERFLEX_RULES_FILE_NAME
        )

        if (!fs.existsSync(superflexRulesPath)) {
          return null
        }

        return {
          id: generateFileID(SUPERFLEX_RULES_FILE_NAME),
          name: SUPERFLEX_RULES_FILE_NAME,
          path: superflexRulesPath,
          relativePath: SUPERFLEX_RULES_FILE_NAME
        }
      })

      /**
       * Event (update_message): This event is fired when the user provides feedback for a message in the webview Chat.
       * It is used to update the message with the feedback.
       *
       * @param payload - Payload containing the message ID and feedback.
       * @returns A promise that resolves when the message is updated.
       * @throws An error if the message cannot be updated.
       */
      .registerEvent(
        EventRequestType.UPDATE_MESSAGE,
        async (payload: Message) => {
          if (!this._isInitialized || !this._assistant) {
            return
          }

          await this._assistant.updateMessage(payload)
        }
      )

      /**
       * Event (get_user_info): This event is fired when webview requests user info.
       */
      .registerEvent(EventRequestType.GET_USER_INFO, async () => {
        return api.getUserInfo()
      })

      /**
       * Event (get_user_subscription): This event is fired when webview requests user subscription info.
       */
      .registerEvent(EventRequestType.GET_USER_SUBSCRIPTION, async () => {
        return api.getUserSubscription()
      })
  }

  /**
   * Returns a Promise that resolves when the ChatAPI is ready.
   */
  onReady(): Promise<void> {
    if (this._isReady) {
      return Promise.resolve()
    }

    return new Promise(resolve => {
      this._ready.event(resolve)
    })
  }

  isReady(): boolean {
    return this._isReady
  }

  /**
   * Registers a new event handler for the specified command.
   *
   * @param command - The command for which to register the event handler.
   * @param handler - The event handler to register.
   */
  registerEvent<T extends EventRequestType, R extends EventResponseType>(
    command: T,
    handler: Handler<T, R>
  ): void {
    this._chatEventRegistry.registerEvent(command, handler)
  }

  /**
   * Handles a chat event by delegating to the registered event handler.
   *
   * @param event - The name of the event to handle.
   * @param requestPayload - The payload of the event request.
   * @param sendEventMessageCb - A callback to send event messages to webview.
   * @return A promise that resolves to the result of the event handler.
   */
  async handleEvent<T extends EventRequestType, R extends EventResponseType>(
    event: T,
    requestPayload: EventRequestPayload[T],
    sendEventMessageCb: (msg: EventResponseMessage<R>) => void
  ): Promise<EventResponsePayload[R]> {
    return this._chatEventRegistry.handleEvent(
      event,
      requestPayload,
      sendEventMessageCb
    )
  }

  /**
   * Synchronizes project files with the assistant.
   *
   * @param sendEventMessageCb - A callback to send event messages to webview.
   * @return A promise that resolves when the synchronization is complete.
   */
  private async syncProjectFiles(
    sendEventMessageCb: (msg: EventResponseMessage<EventResponseType>) => void
  ): Promise<void> {
    if (!this._assistant) {
      return
    }

    try {
      await this._assistant.syncFiles((progress, isFirstTimeSync) => {
        sendEventMessageCb(
          newEventResponse(EventResponseType.SYNC_PROJECT_PROGRESS, {
            progress,
            isFirstTimeSync
          })
        )
      })
    } catch (err: any) {
      if (err?.statusCode === HttpStatusCode.UNAUTHORIZED) {
        throw err
      }
      if (
        err?.message?.startsWith('No supported files found in the workspace')
      ) {
        vscode.window.showWarningMessage(err.message)
      }
      console.error(err)
    }
  }

  setInitialized(initialized: boolean): void {
    this._isInitialized = initialized
  }
}
