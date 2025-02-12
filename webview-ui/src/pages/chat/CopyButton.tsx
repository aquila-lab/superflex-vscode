import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { CheckIcon } from '@radix-ui/react-icons'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@radix-ui/react-tooltip'
import { useState, useCallback } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Button } from '../../components/ui/Button'

export const CopyButton = ({ content }: { content: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(() => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 5000)
  }, [])

  return (
    <CopyToClipboard text={String(content)} onCopy={() => {}}>
      {isCopied ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='text-muted-foreground px-1 py-0.5 rounded-md hover:bg-muted'>
                <CheckIcon className='size-3.5' />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-xs m-0 text-muted-foreground'>Copied</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          size='xs'
          variant='text'
          className='px-1 py-0.5 hover:bg-muted'
          onClick={handleCopy}
        >
          <DocumentDuplicateIcon className='size-3.5' />
        </Button>
      )}
    </CopyToClipboard>
  )
}
