import type { Monaco } from '@monaco-editor/react'
import { type ClassValue, clsx } from 'clsx'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Role } from '../../../shared/model'
import type { TypedEventResponseMessage } from '../../../shared/protocol'

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

export const roleClassName: Partial<Record<Role, string>> = {
  [Role.Assistant]: 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
}
export const defaultClassName = 'flex gap-2 flex-wrap'

export const chatInputDisabledClasses =
  "relative p-[1px] rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-[length:400%_400%] before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] before:animate-[gradient_3s_linear_infinite]"
export const chatInputEnabledClasses =
  'border border-border rounded-md overflow-y-auto max-h-96'

export type ApplyState = 'idle' | 'applying' | 'applied'

export interface MarkdownCodeProps {
  inline?: boolean
  className?: string
  children?: ReactNode
}

export const getFileSearchKeywords = (filePath: string) => {
  const parts = filePath.split(/[/\\]/)
  const fileName = parts[parts.length - 1]
  const fileNameWithoutExt = fileName.split('.')[0]

  return [
    filePath,
    filePath.replace(/\//g, '\\'),
    ...parts,
    fileName,
    fileNameWithoutExt,
    fileName.split('.').pop() || ''
  ]
}

export const customFilesFilter = (filePath: string, searchValue: string) => {
  const keywords = getFileSearchKeywords(filePath)
  const searchTerms = searchValue.toLowerCase().split(/\s+/)

  return searchTerms.every(term =>
    keywords.some(keyword => keyword.toLowerCase().includes(term))
  )
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

export type MessageHandler = (message: TypedEventResponseMessage) => void

export interface UseDragAndDrop<T> {
  onDrop: (file: File) => Promise<T> | T
  validate?: (file: File) => boolean
  onInvalid?: (file: File) => void
  onError?: (error: Error) => void
}

export interface UseImageDragAndDrop {
  onImageDrop: (imageBase64: string) => void
  onInvalidFile?: (fileType: string) => void
  onError?: (error: Error) => void
}

export const RELOAD_DURATION = 1000

export type ThreadDateGroup =
  | 'Today'
  | 'Yesterday'
  | 'Previous 7 days'
  | 'Previous 30 days'
  | string

export const categorizeThreadsByDate = <T extends { updatedAt: string | Date }>(
  threads: T[]
) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const previous7Days = new Date(today)
  previous7Days.setDate(previous7Days.getDate() - 7)
  const previous30Days = new Date(today)
  previous30Days.setDate(previous30Days.getDate() - 30)

  const result: Record<ThreadDateGroup, T[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 days': [],
    'Previous 30 days': []
  }

  threads.forEach(thread => {
    const threadDate = new Date(thread.updatedAt)
    const threadDateOnly = new Date(
      threadDate.getFullYear(),
      threadDate.getMonth(),
      threadDate.getDate()
    )

    if (threadDateOnly.getTime() === today.getTime()) {
      result.Today.push(thread)
    } else if (threadDateOnly.getTime() === yesterday.getTime()) {
      result.Yesterday.push(thread)
    } else if (threadDateOnly >= previous7Days && threadDateOnly < yesterday) {
      result['Previous 7 days'].push(thread)
    } else if (
      threadDateOnly >= previous30Days &&
      threadDateOnly < previous7Days
    ) {
      result['Previous 30 days'].push(thread)
    } else {
      const month = threadDate.toLocaleString('default', { month: 'long' })
      const year = threadDate.getFullYear()

      const groupName =
        threadDate.getFullYear() === now.getFullYear() ? month : `${year}`

      if (!result[groupName]) {
        result[groupName] = []
      }
      result[groupName].push(thread)
    }
  })

  return Object.entries(result)
    .filter(([_, threads]) => threads.length > 0)
    .reduce(
      (acc, [group, threads]) => {
        acc[group as ThreadDateGroup] = threads
        return acc
      },
      {} as Record<ThreadDateGroup, T[]>
    )
}

export const FEEDBACK_URL = 'https://forms.gle/aUZjzeUzLnrmJvdR7'
export const SUPPORT_EMAIL = 'boris@superflex.ai'
