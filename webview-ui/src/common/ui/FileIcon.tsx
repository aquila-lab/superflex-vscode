import DOMPurify from 'dompurify'
import { themeIcons } from 'seti-file-icons'
import { cn, getFileName } from '../../common/utils'

interface FileIconProps {
  filePath: string
  className?: string
}

const iconColors = {
  blue: '#268bd2',
  grey: '#657b83',
  'grey-light': '#839496',
  green: '#859900',
  orange: '#cb4b16',
  pink: '#d33682',
  purple: '#6c71c4',
  red: '#dc322f',
  white: '#fdf6e3',
  yellow: '#b58900',
  ignore: '#586e75'
}

export const FileIcon: React.FC<FileIconProps> = ({ filePath, className }) => {
  const filename = getFileName(filePath)

  if (filename.startsWith('.superflex')) {
    return (
      <img
        src={window.superflexLogoUri}
        alt='Superflex Logo'
        className={cn('flex-shrink-0 p-1', className)}
      />
    )
  }

  const getIcon = themeIcons(iconColors)
  const { svg, color } = getIcon(filename)
  const sanitizedSVG = DOMPurify.sanitize(svg)

  return (
    <div
      className={cn('flex-shrink-0', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedSVG }}
      style={{ fill: color }}
    />
  )
}
