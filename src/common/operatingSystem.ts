import os from 'node:os'

type Platform = 'mac' | 'linux' | 'windows' | 'unknown'

export function getPlatform(): Platform {
  const platform = os.platform()
  if (platform === 'darwin') {
    return 'mac'
  }
  if (platform === 'linux') {
    return 'linux'
  }
  if (platform === 'win32') {
    return 'windows'
  }
  return 'unknown'
}

export function getAltOrOption() {
  if (getPlatform() === 'mac') {
    return '⌥'
  }
  return 'Alt'
}

export function getMetaKeyLabel() {
  const platform = getPlatform()
  switch (platform) {
    case 'mac':
      return '⌘'
    case 'linux':
    case 'windows':
      return '^'
    default:
      return '^'
  }
}

export function getMetaKeyName() {
  const platform = getPlatform()
  switch (platform) {
    case 'mac':
      return 'Cmd'
    case 'linux':
    case 'windows':
      return 'Ctrl'
    default:
      return 'Ctrl'
  }
}
