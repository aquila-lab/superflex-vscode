import { type ReactNode, useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import type { Role } from '../../../../../../../../../shared/model'
import {
  HEX_COLOR_REGEX,
  cn,
  defaultClassName,
  roleClassName
} from '../../../../../../../common/utils'
import { ColorToken } from '../ColorToken'
import { MarkdownCode } from './MarkdownCode'

export const MarkdownRender = ({
  role,
  children
}: {
  role: Role
  children: ReactNode
}) => {
  const components = useMemo<Components>(() => {
    const processContent = (content: ReactNode) => {
      return processHexColors(content)
    }

    return {
      code: props => <MarkdownCode {...props} />,
      p: ({ children, ...props }) => (
        <p {...props}>{processContent(children)}</p>
      ),
      li: ({ children, ...props }) => (
        <li {...props}>{processContent(children)}</li>
      ),
      strong: ({ children, ...props }) => (
        <strong {...props}>{processContent(children)}</strong>
      ),
      em: ({ children, ...props }) => (
        <em {...props}>{processContent(children)}</em>
      ),
      a: ({ children, ...props }) => (
        <a {...props}>{processContent(children)}</a>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote {...props}>{processContent(children)}</blockquote>
      ),
      span: ({ children, ...props }) => (
        <span {...props}>{processContent(children)}</span>
      )
    }
  }, [])

  return (
    <ReactMarkdown
      className={cn(roleClassName[role] ?? defaultClassName)}
      components={components}
    >
      {String(children)}
    </ReactMarkdown>
  )
}

const processHexColors = (children: ReactNode): ReactNode => {
  if (typeof children !== 'string') {
    return children
  }

  const text = children
  const result: ReactNode[] = []
  let lastIndex = 0

  const matches = Array.from(text.matchAll(new RegExp(HEX_COLOR_REGEX, 'gi')))

  if (matches.length === 0) {
    return text
  }

  for (const match of matches) {
    const colorCode = match[0]
    const startIndex = match.index ?? 0

    if (startIndex > lastIndex) {
      result.push(text.substring(lastIndex, startIndex))
    }

    result.push(
      <ColorToken
        key={`color-${colorCode}-${startIndex}`}
        color={colorCode}
      />
    )

    lastIndex = startIndex + colorCode.length
  }

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }

  return result
}
