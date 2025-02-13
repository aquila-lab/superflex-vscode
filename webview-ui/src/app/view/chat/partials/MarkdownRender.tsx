import { type ReactNode, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { MarkdownCode } from './MarkdownCode'
import type { Role } from '../../../../../../shared/model'
import {
  type MarkdownCodeProps,
  cn,
  roleClassName,
  defaultClassName
} from '../../../../common/utils'

export const MarkdownRender = ({
  role,
  isStreamingMessage = false,
  children
}: { role: Role; isStreamingMessage?: boolean; children: ReactNode }) => {
  const codeComponents = useMemo(
    () => ({
      code: (props: MarkdownCodeProps) => (
        <MarkdownCode {...props} isStreamingMessage={isStreamingMessage} />
      )
    }),
    [isStreamingMessage]
  )

  return (
    <ReactMarkdown
      className={cn(roleClassName[role] ?? defaultClassName)}
      components={codeComponents}
    >
      {String(children)}
    </ReactMarkdown>
  )
}
