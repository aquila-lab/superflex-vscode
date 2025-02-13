import type { Monaco } from '@monaco-editor/react'
import { type ClassValue, clsx } from 'clsx'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  type MessageAttachment,
  type MessageContent,
  Role
} from '../../../shared/model'
import type { FilePayload } from '../../../shared/protocol'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export async function readImageFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result as string
      const base64Data = base64String.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export const getFileName = (filePath: string): string => {
  return filePath.split(/[/\\]/g).pop() ?? ''
}

export const areMessageContentsEqual = (
  prevContent: MessageContent,
  nextContent: MessageContent
): boolean => {
  if (prevContent.text !== nextContent.text) {
    return false
  }

  if (prevContent.fromMessageID !== nextContent.fromMessageID) {
    return false
  }

  if (!areAttachmentsEqual(prevContent.attachment, nextContent.attachment)) {
    return false
  }

  return areFilesEqual(prevContent.files, nextContent.files)
}

const areAttachmentsEqual = (
  prevAttachment?: MessageAttachment,
  nextAttachment?: MessageAttachment
): boolean => {
  if (!(prevAttachment || nextAttachment)) {
    return true
  }
  if (!(prevAttachment && nextAttachment)) {
    return false
  }

  if (prevAttachment.image !== nextAttachment.image) {
    return false
  }

  if (prevAttachment.figma && nextAttachment.figma) {
    return (
      prevAttachment.figma.fileID === nextAttachment.figma.fileID &&
      prevAttachment.figma.nodeID === nextAttachment.figma.nodeID &&
      prevAttachment.figma.imageUrl === nextAttachment.figma.imageUrl
    )
  }

  if (prevAttachment.figma ?? nextAttachment.figma) {
    return false
  }

  return true
}

const areFilesEqual = (
  prevFiles?: FilePayload[],
  nextFiles?: FilePayload[]
): boolean => {
  if (!(prevFiles && nextFiles) || prevFiles.length !== nextFiles.length) {
    return false
  }

  return prevFiles.every((prevFile, index) => {
    const nextFile = nextFiles[index]
    return (
      prevFile.path === nextFile.path &&
      prevFile.content === nextFile.content &&
      prevFile.startLine === nextFile.startLine &&
      prevFile.endLine === nextFile.endLine &&
      prevFile.isCurrentOpenFile === nextFile.isCurrentOpenFile
    )
  })
}

export const roleClassName: Partial<Record<Role, string>> = {
  [Role.Assistant]: 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
}
export const defaultClassName = 'flex gap-2 flex-wrap'

export const chatInputDisabledClasses =
  "relative p-[1px] rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-[length:400%_400%] before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] before:animate-[gradient_3s_linear_infinite]"
export const chatInputEnabledClasses =
  'border border-border rounded-md overflow-y-auto max-h-96'

export type ApplyState = 'idle' | 'applying' | 'applied'

export interface CodeBlockInfo {
  extension: string
  filePath?: string
  startLine?: number
  endLine?: number
}

export interface MarkdownCodeProps {
  inline?: boolean
  isStreamingMessage?: boolean
  className?: string
  children?: ReactNode
}

export interface MarkdownRenderProps {
  role: Role
  isStreaming?: boolean
  children: ReactNode
}

export const getAvatarConfig = (
  role: Role,
  picture?: string | null | undefined,
  username?: string
) => {
  switch (role) {
    case Role.Assistant:
      return {
        src: window.superflexLogoUri,
        alt: 'Superflex Logo',
        fallback: 'S'
      }
    case Role.User:
      return {
        src: picture ?? undefined,
        alt: 'User Avatar',
        fallback: username ? username.charAt(0).toUpperCase() : 'U'
      }
  }
}

export const commonApplyButtonStyles = 'text-[11px] px-1 py-0 hover:bg-muted'

export const defineVSCodeTheme = (monaco: Monaco) => {
  monaco.editor.defineTheme('vscode-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': getComputedStyle(document.body).getPropertyValue(
        '--vscode-editor-background'
      ),
      'editor.foreground': getComputedStyle(document.body).getPropertyValue(
        '--vscode-editor-foreground'
      ),
      'editor.lineHighlightBackground': getComputedStyle(
        document.body
      ).getPropertyValue('--vscode-editor-lineHighlightBackground'),
      'editorLineNumber.foreground': getComputedStyle(
        document.body
      ).getPropertyValue('--vscode-editorLineNumber-foreground'),
      'editor.selectionBackground': getComputedStyle(
        document.body
      ).getPropertyValue('--vscode-editor-selectionBackground')
    }
  })
}

export const getLanguageFromPath = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase() ?? ''

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',

    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    stylus: 'stylus',

    html: 'html',
    htm: 'html',
    vue: 'vue',
    svelte: 'svelte',

    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    env: 'plaintext',

    lock: 'yaml',
    packagejson: 'json',

    sh: 'shell',
    bash: 'shell',

    md: 'markdown',
    graphql: 'graphql',
    gql: 'graphql'
  }

  return languageMap[extension] || 'plaintext'
}

export const NULL_UUID = '00000000-0000-0000-0000-000000000000'

export const HINTS = [
  {
    text: 'Drop images to chat by holding',
    shortcut: 'Shift'
  },
  {
    text: 'Quick access with',
    shortcut: '⌘+;'
  },
  {
    text: 'Add selected code to chat with',
    shortcut: '⌘+M'
  }
]
