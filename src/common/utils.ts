import crypto from 'node:crypto'
import path from 'node:path'
import { machineIdSync } from 'node-machine-id'
import * as vscode from 'vscode'

import { EXTENSION_ID } from './constants'
import { getPlatform } from './operatingSystem'

export function decodeUriAndRemoveFilePrefix(uri: string): string {
  try {
    if (getPlatform() === 'windows' && uri?.includes('file:///')) {
      uri = uri.replace('file:///', '')
    } else if (uri?.includes('file://')) {
      uri = uri.replace('file://', '')
    }
    if (uri?.includes('vscode-userdata:')) {
      uri = uri.replace('vscode-userdata:', '')
    }

    if (uri) {
      try {
        uri = decodeURIComponent(uri)
      } catch (_) {
        // If decoding fails, try to selectively decode only known safe sequences
        uri = uri
          .replace(/%20/g, ' ')
          .replace(/%23/g, '#')
          .replace(/%3F/g, '?')
          .replace(/%25/g, '%')
          .replace(/%2B/g, '+')
          .replace(/%5B/g, '[')
          .replace(/%5D/g, ']')
          .replace(/%7B/g, '{')
          .replace(/%7D/g, '}')
      }
    }

    // Updating the file path for current open file for wins machine
    if (getPlatform() === 'windows') {
      uri = uri
        .replace(/^([A-Z]:)?/i, match => match.toLowerCase()) // Ensure drive letter is lowercase
        .replace(/\//g, '\\') // Convert forward slashes to backslashes
        .replace(/^\\+/, '') // Remove leading backslashes
        .replace(/\\+/g, '\\') // Replace multiple backslashes with single
    }

    uri = uri.replace(/\\/g, '/')

    return path.normalize(uri)
  } catch (_) {
    return uri
  }
}

export function getOpenWorkspace(): vscode.WorkspaceFolder | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders || []
  if (workspaceFolders.length === 0) {
    return undefined
  }

  return workspaceFolders[0]
}

// Generic helper function to convert Map to JSON
export function mapToJson<T>(map: Map<string, T>): string {
  return JSON.stringify(Array.from(map.entries()))
}

// Generic helper function to convert JSON to Map
export function jsonToMap<T>(
  jsonStr: string,
  reviver?: (key: string, value: any) => T
): Map<string, T> {
  const entries: [string, T][] = JSON.parse(jsonStr)
  return new Map<string, T>(
    entries.map(([key, value]) => [key, reviver ? reviver(key, value) : value])
  )
}

export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

export function getExtensionVersion(): string {
  const extension = vscode.extensions.getExtension(EXTENSION_ID)
  return extension?.packageJSON.version || 'unknown'
}

export function getNonce() {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const UNIQUE_ID_KEY = 'uniqueID'
export function getUniqueID(context: vscode.ExtensionContext): {
  uniqueID: string
  isNew: boolean
} {
  let uniqueID = context.globalState.get<string>(UNIQUE_ID_KEY)

  if (!uniqueID) {
    uniqueID = vscode.env.machineId
    if (uniqueID === 'someValue.machineId') {
      uniqueID = machineIdSync()
    }
    context.globalState.update(UNIQUE_ID_KEY, uniqueID)
    return { uniqueID, isNew: true }
  }

  return { uniqueID, isNew: false }
}

export function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

export function generateFileID(
  relativePath: string,
  startLine = 0,
  endLine = -1
): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${relativePath}#${startLine}-${endLine}`)
    .digest('hex')
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `8${hash.slice(17, 20)}`,
    hash.slice(20, 32)
  ].join('-')
}

export function rgbaToHex(color: {
  r: number
  g: number
  b: number
  a: number
}): string {
  const r = Math.round(color.r * 255)
  const g = Math.round(color.g * 255)
  const b = Math.round(color.b * 255)
  const opacity = Math.round(color.a * 100)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${opacity.toString(16).padStart(2, '0')}`
}
