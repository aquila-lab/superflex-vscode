import { IoIosReturnLeft } from 'react-icons/io'
import { Button } from '../../../../../../common/ui/Button'

export const BaseMessageButton = ({
  isDisabled,
  hasContent,
  onClick,
  buttonText
}: {
  isDisabled: boolean
  hasContent: boolean
  onClick: () => void
  buttonText: string
}) => {
  return (
    <Button
      size='xs'
      variant='text'
      active={!isDisabled && hasContent ? 'active' : 'none'}
      disabled={isDisabled || !hasContent}
      className={isDisabled ? 'opacity-60' : ''}
      onClick={onClick}
    >
      <span className='sr-only'>Enter</span>
      <IoIosReturnLeft
        className='size-4'
        aria-hidden='true'
      />
      <span>{buttonText}</span>
    </Button>
  )
}
