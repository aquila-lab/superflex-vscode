import { type ChangeEvent, useCallback, useRef } from 'react'
import { IoImage } from 'react-icons/io5'
import { cn, readImageFileAsBase64 } from '../../common/utils'
import { useNewMessage } from '../../context/NewMessageContext'
import { useAttachment } from '../../context/AttachmentContext'

export const FilePicker = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isMessageStreaming, isMessageProcessing } = useNewMessage()
  const { removeAttachment, setImageAttachment } = useAttachment()
  const isDisabled = isMessageStreaming || isMessageProcessing

  const handleImageSelected = useCallback(
    (file: File) => {
      removeAttachment()

      readImageFileAsBase64(file).then(imageBase64 => {
        setImageAttachment(imageBase64)
      })
    },
    [removeAttachment, setImageAttachment]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }

      handleImageSelected(file)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleImageSelected]
  )

  return (
    <div className='flex flex-col justify-center'>
      <div className='flex-initial flex flex-col justify-center items-center rounded-md'>
        <label
          htmlFor='chat-file-picker'
          className={cn(
            'flex items-center gap-1 p-1.5 text-muted-foreground',
            isDisabled ? 'opacity-60' : 'cursor-pointer hover:text-foreground'
          )}
        >
          <IoImage className='size-3.5' />
          <span className='hidden xs:block text-xs'>Image</span>
        </label>
        <input
          hidden
          type='file'
          name='chat-file-picker'
          id='chat-file-picker'
          disabled={isDisabled}
          onChange={handleChange}
          accept={'image/jpeg, image/png'}
          ref={fileInputRef}
        />
      </div>
    </div>
  )
}
