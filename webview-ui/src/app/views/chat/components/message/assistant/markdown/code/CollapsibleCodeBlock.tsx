import { memo, useState, useMemo } from 'react'
import {
  Collapsible,
  CollapsibleTrigger
} from '../../../../../../../../common/ui/Collapsible'
import {
  cn,
  LINE_HEIGHT,
  getLinesCount,
  PADDING,
  COLLAPSED_HEIGHT
} from '../../../../../../../../common/utils'
import { CodeBlock } from './CodeBlock'
import { CodeEditor } from '../../../../../../../../common/ui/CodeEditor'
import { CodeBlockToolbar } from './CodeBlockToolbar'

export const CollapsibleCodeBlock = memo(
  ({
    filePath,
    draft,
    extension
  }: {
    filePath?: string
    draft: string
    extension: string
  }) => {
    const [isOpen, setIsOpen] = useState(false)

    const linesCount = useMemo(() => getLinesCount(draft), [draft])
    const estimatedHeight = useMemo(
      () => linesCount * LINE_HEIGHT + PADDING,
      [linesCount]
    )
    const shouldRenderCollapsible = useMemo(
      () => estimatedHeight > COLLAPSED_HEIGHT,
      [estimatedHeight]
    )

    if (!shouldRenderCollapsible) {
      return (
        <CodeBlock
          filePath={filePath}
          draft={draft}
          extension={extension}
        />
      )
    }

    return (
      <div className='rounded-md border border-border bg-background mt-1'>
        <CodeBlockToolbar filePath={filePath}>{draft}</CodeBlockToolbar>

        <div className='relative'>
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <div
              className={cn(
                'relative',
                !isOpen && 'max-h-[500px] overflow-hidden'
              )}
            >
              <CodeEditor
                extension={extension}
                filePath={filePath}
                maxHeight={isOpen ? undefined : COLLAPSED_HEIGHT}
              >
                {draft}
              </CodeEditor>

              {!isOpen && (
                <div className='absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none' />
              )}
            </div>

            <div className='flex justify-center border-t border-border'>
              <CollapsibleTrigger
                className='flex items-center justify-center py-1'
                isOpen={isOpen}
              />
            </div>
          </Collapsible>
        </div>
      </div>
    )
  }
)
