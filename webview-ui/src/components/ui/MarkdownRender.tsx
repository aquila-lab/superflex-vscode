import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import cssextras from 'react-syntax-highlighter/dist/cjs/languages/prism/css-extras';
import sass from 'react-syntax-highlighter/dist/cjs/languages/prism/sass';
import less from 'react-syntax-highlighter/dist/cjs/languages/prism/less';
import stylus from 'react-syntax-highlighter/dist/cjs/languages/prism/stylus';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import { useState } from 'react';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('css-extras', cssextras);
SyntaxHighlighter.registerLanguage('sass', sass);
SyntaxHighlighter.registerLanguage('less', less);
SyntaxHighlighter.registerLanguage('stylus', stylus);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);

interface MarkdownRenderProps {
  mdString: string;
}

export default function MarkdownRender({ mdString }: MarkdownRenderProps) {
  return (
    <ReactMarkdown
      className="prose prose-sm"
      components={{
        code({ inline, className, ...props }: any) {
          const hasLang = /language-(\w+)/.exec(className || '');
          return !inline && hasLang ? (
            <SyntaxHighlighter
              style={oneDark}
              language={hasLang[1]}
              PreTag="div"
              className="text-md mockup-code scrollbar-thin scrollbar-track-base-content/5 scrollbar-thumb-base-content/40 scrollbar-track-rounded-md scrollbar-thumb-rounded"
              showLineNumbers={true}
              useInlineStyles={true}
              customStyle={{ margin: '0px', paddingLeft: '8px' }}>
              {String(props.children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props} />
          );
        },
        pre: (pre) => {
          const codeChunk = (pre as any).node.children[0].children[0].value as string;
          const [copyTip, setCopyTip] = useState('Copy code');

          return (
            <div className="relative overflow-x-hidden">
              <button
                style={{
                  right: 0
                }}
                className="tooltip tooltip-left absolute z-40 mr-3 mt-3"
                data-tip={copyTip}>
                <CopyToClipboard
                  text={codeChunk}
                  onCopy={async () => {
                    setCopyTip('Copied');
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    setCopyTip(`Copy code`);
                  }}>
                  <DocumentDuplicateIcon className="h-5 w-5 cursor-pointer hover:text-blue-600" />
                </CopyToClipboard>
              </button>
              <pre className="p-0 m-0 rounded-md" {...pre}></pre>
            </div>
          );
        }
      }}>
      {mdString}
    </ReactMarkdown>
  );
}
