import React from 'react';
import DOMPurify from 'dompurify';
import { themeIcons } from 'seti-file-icons';
import { cn } from '../../common/utils';

interface FileIconProps {
  filename: string;
  className?: string;
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
};

export const FileIcon: React.FC<FileIconProps> = ({ filename, className }) => {
  const filenameParts = filename.includes(' (') ? filename.split(' ') : [filename, ''];
  filenameParts.pop();

  const getIcon = themeIcons(iconColors);
  const { svg, color } = getIcon(filenameParts.join(' '));
  const sanitizedSVG = DOMPurify.sanitize(svg);

  return (
    <div
      className={cn('flex-shrink-0', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedSVG }}
      style={{ fill: color }}
    />
  );
};
