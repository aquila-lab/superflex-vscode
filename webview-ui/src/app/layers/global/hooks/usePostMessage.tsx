import { useVSCode } from '../providers/VSCodeProvider'

export function usePostMessage() {
  const { postMessage } = useVSCode()

  return postMessage
}
