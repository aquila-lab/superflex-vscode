import { BaseMessageButton } from './BaseMessageButton'

export const SendButton = ({
  hasContent,
  isDisabled,
  onSend
}: {
  hasContent: boolean
  isDisabled: boolean
  onSend: () => void
}) => {
  return (
    <BaseMessageButton
      isDisabled={isDisabled}
      hasContent={hasContent}
      onClick={onSend}
      buttonText='send'
    />
  )
}
