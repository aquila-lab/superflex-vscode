import { BaseMessageButton } from './BaseMessageButton'

export const ResendButton = ({
  hasContent,
  isFigmaLoading,
  onResend
}: {
  hasContent: boolean
  isFigmaLoading: boolean
  onResend: () => void
}) => {
  return (
    <BaseMessageButton
      isDisabled={isFigmaLoading}
      hasContent={hasContent}
      onClick={onResend}
      buttonText='resend'
    />
  )
}
