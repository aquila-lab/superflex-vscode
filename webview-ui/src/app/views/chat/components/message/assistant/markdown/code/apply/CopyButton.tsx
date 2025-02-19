import { CheckIcon, CopyIcon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Button } from '../../../../../../../../../common/ui/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '../../../../../../../../../common/ui/Tooltip'

export const CopyButton = ({ content }: { content: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(() => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 5000)
  }, [])

  return (
    <CopyToClipboard
      text={String(content)}
      onCopy={() => {}}
    >
      {isCopied ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='text-muted-foreground px-1 py-0.5 rounded-md hover:bg-muted'>
              <CheckIcon className='size-3.5' />
            </div>
          </TooltipTrigger>
          <TooltipContent portal>
            <p className='text-xs m-0 text-muted-foreground'>Copied</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Button
          size='xs'
          variant='text'
          className='px-1 py-0.5 hover:bg-muted'
          onClick={handleCopy}
        >
          <CopyIcon className='size-3.5' />
        </Button>
      )}
    </CopyToClipboard>
  )
}
