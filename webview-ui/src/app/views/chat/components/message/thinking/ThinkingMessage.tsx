import { useState, useMemo, useEffect } from 'react'
import { Role } from '../../../../../../../../shared/model'
import { cn } from '../../../../../../common/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../../../../../../common/ui/Collapsible'
import { MessageContainer } from '../shared/MessageContainer'
import { RiBrainLine } from 'react-icons/ri'
import { StarsIcon } from 'lucide-react'
import { MarkdownRender } from '../assistant/markdown/MarkdownRender'
import { ShiningText } from '../../../../../../common/ui/ShiningText'

export const ThinkingMessage = ({
  content,
  type = 'enhance',
  open = false,
  isStreaming = false
}: {
  content: string
  type?: 'enhance' | 'thinking'
  open?: boolean
  isStreaming?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const thinkingSeconds = useMemo(() => {
    const charCount = content.length
    const lineCount = content.split('\n').length
    const codeBlockCount = (content.match(/```/g) || []).length / 2

    const baseSeconds = Math.max(2, Math.ceil(charCount / 400))

    const complexityFactor = 1 + codeBlockCount * 0.5 + lineCount / 100

    const seconds = Math.ceil(baseSeconds * complexityFactor)

    return Math.max(2, seconds)
  }, [content])

  const messageText = useMemo(() => {
    if (type === 'enhance') {
      return isStreaming ? 'Enhancing prompt' : 'Enhanced prompt'
    }

    return isStreaming ? 'Thinking' : `Thought for ${thinkingSeconds} seconds`
  }, [type, isStreaming, thinkingSeconds])

  return (
    <MessageContainer
      role={Role.User}
      className='pt-4'
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsibleTrigger
          className={cn(
            'font-medium flex items-center gap-1.5',
            'text-muted-foreground hover:text-foreground'
          )}
          isOpen={isOpen}
        >
          <div className='flex items-center justify-center gap-1.5'>
            {type === 'enhance' ? (
              <StarsIcon className='size-3.5' />
            ) : (
              <RiBrainLine className='size-3.5' />
            )}
            <span className='inline-block overflow-hidden'>
              {isStreaming ? (
                <ShiningText>{messageText}</ShiningText>
              ) : (
                messageText
              )}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className='mt-2 text-muted-foreground'>
            <MarkdownRender role={Role.Assistant}>{content}</MarkdownRender>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </MessageContainer>
  )
}
