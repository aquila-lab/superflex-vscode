import { memo, useMemo, useState } from 'react'
import { CodeEditor } from '../../../../../../../../common/ui/CodeEditor'
import {
  Collapsible,
  CollapsibleTrigger
} from '../../../../../../../../common/ui/Collapsible'
import {
  COLLAPSED_HEIGHT,
  LINE_HEIGHT,
  PADDING,
  cn,
  getLinesCount
} from '../../../../../../../../common/utils'
import { CodeBlock } from './CodeBlock'
import { CodeBlockToolbar } from './CodeBlockToolbar'
import { useCodeBlockLoading } from '../../../../../providers/CodeBlockLoadingProvider'

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
    const { isLoading } = useCodeBlockLoading()

    const isLoadingState = useMemo(
      () => (filePath ? isLoading(filePath) : false),
      [filePath, isLoading]
    )

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
            onOpenChange={isLoadingState ? undefined : setIsOpen}
          >
            <div
              className={cn(
                'relative',
                !isOpen && 'max-h-[500px] overflow-hidden',
                isLoadingState && 'pointer-events-none'
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

            <div className='flex justify-center'>
              <CollapsibleTrigger
                className={
                  'flex items-center justify-center pb-1 text-muted-secondary-foreground ml-0 absolute bottom-0 left-0 right-0'
                }
                isOpen={isOpen}
                disabled={isLoadingState}
              />
            </div>
          </Collapsible>
        </div>
      </div>
    )
  }
)
