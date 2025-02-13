import { useVSCode } from '../VSCodeProvider'

export function usePostMessage() {
  const { postMessage } = useVSCode()

  return postMessage
}
