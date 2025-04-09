import { useState, useMemo } from 'react'
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

export const ThinkingMessage = ({
  content,
  type = 'enhance'
}: {
  content: string
  type?: 'enhance' | 'thinking'
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const thinkingSeconds = useMemo(() => {
    // Calculate seconds based on content complexity
    const charCount = content.length
    const lineCount = content.split('\n').length
    const codeBlockCount = (content.match(/```/g) || []).length / 2

    // Base calculation on character count
    // Average thinking content is around 1800-2000 chars
    const baseSeconds = Math.max(2, Math.ceil(charCount / 400))

    // Add time for code blocks and structure
    const complexityFactor = 1 + codeBlockCount * 0.5 + lineCount / 100

    // Final calculation with some randomness
    const seconds = Math.ceil(baseSeconds * complexityFactor)

    // For very short content, ensure minimum of 2 seconds
    return Math.max(2, seconds)
  }, [content])

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
            'text-xs font-medium flex items-center gap-1.5',
            'text-muted-foreground hover:text-foreground'
          )}
          isOpen={isOpen}
        >
          <div className='flex items-center justify-center gap-1.5'>
            {type === 'enhance' ? (
              <StarsIcon className='h-3 w-3' />
            ) : (
              <RiBrainLine className='h-3 w-3' />
            )}
            {type === 'enhance'
              ? 'Enhanced prompt'
              : `Thought for ${thinkingSeconds} seconds`}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={cn('text-xs mt-2 leading-snug', 'text-muted-foreground')}
          >
            <MarkdownRender role={Role.User}>{content}</MarkdownRender>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </MessageContainer>
  )
}
