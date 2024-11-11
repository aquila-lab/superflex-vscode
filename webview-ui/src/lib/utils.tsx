import React, { useContext } from 'react';
import DOMPurify from 'dompurify';
import { themeIcons } from 'seti-file-icons';
import styled from 'styled-components';
import { VscThemeContext } from '../context/VscTheme';

export const FileIcon = ({ filename, height, width }: { filename: string; height: string; width: string }) => {
  const filenameParts = filename.includes(' (') ? filename.split(' ') : [filename, ''];
  filenameParts.pop();

  const getIcon = themeIcons({
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
  });

  // Sanitize the SVG string before rendering it
  const { svg, color } = getIcon(filenameParts.join(' '));
  const sanitizedSVG = DOMPurify.sanitize(svg);

  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedSVG }} style={{ width, height, fill: color, flexShrink: 0 }} />
  );
};
export function parseHexColor(hexColor: string): {
  r: number;
  g: number;
  b: number;
} {
  if (hexColor.startsWith('#')) {
    hexColor = hexColor.slice(1);
  }

  if (hexColor.length > 6) {
    hexColor = hexColor.slice(0, 6);
  }

  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  return { r, g, b };
}

const StyledPre = styled.pre<{ theme: any }>`
  & .hljs {
    color: --vscode-editor-foreground;
  }

  margin-top: 0;
  margin-bottom: 0;
  border-radius: 0 0 5px 5px !important;

  ${(props) =>
    Object.keys(props.theme)
      .map((key, index) => {
        return `
      & ${key} {
        color: ${props.theme[key]};
      }
    `;
      })
      .join('')}
`;

export const SyntaxHighlightedPre = (props: any) => {
  const currentTheme = useContext(VscThemeContext);

  return <StyledPre {...props} theme={currentTheme} />;
};
