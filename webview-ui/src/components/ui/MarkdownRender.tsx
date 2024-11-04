import React, { useState } from 'react';

import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentDuplicateIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
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
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import { Button } from './Button';

import { cn } from '../../common/utils';
import FileIcon from '../../lib/utils';

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

const MarkdownRender: React.FunctionComponent<MarkdownRenderProps> = ({ mdString }) => {
  const [code, setCode] = useState('');
  const [copyTip, setCopyTip] = useState('Copy code');
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <ReactMarkdown
      className="prose prose-sm text-sm dark:prose-invert"
      components={{
        code({ inline, className, ...props }: any) {
          const hasLang = /language-(\w+)/.exec(className || '');
          const codeProp = String(props.children).replace(/\n$/, '');
          return !inline && hasLang ? (
            // <SyntaxHighlighter
            //   style={oneDark}
            //   language={hasLang[1]}
            //   PreTag="div"
            //   className="text-md mockup-code scrollbar-thin scrollbar-track-base-content/5 scrollbar-thumb-base-content/40 scrollbar-track-rounded-md scrollbar-thumb-rounded"
            //   showLineNumbers={true}
            //   useInlineStyles={true}
            //   customStyle={{ margin: '0px', paddingLeft: '0px' }}>
            //   {String(props.children).replace(/\n$/, '')}
            // </SyntaxHighlighter>

            <TooltipProvider delayDuration={0}>
              <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <TooltipTrigger onMouseEnter={() => setTooltipOpen(true)} onMouseLeave={() => setTooltipOpen(false)}>
                  <div className="rounded-lg border-border border-[1px] bg-background max-h-64 overflow-y-auto">
                    <Editor
                      disabled
                      value={codeProp}
                      onValueChange={(code) => setCode(codeProp)}
                      highlight={(codeProp) => hljs.highlight(codeProp, { language: hasLang[1] }).value}
                      padding={10}
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        outline: 'none',
                        border: 'none'
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent portal={false} sideOffset={-16} align="end" alignOffset={16}>
                  <CopyToClipboard
                    text={codeProp}
                    onCopy={async () => {
                      setCopyTip('Copied');
                      await new Promise((resolve) => setTimeout(resolve, 5000));
                      setCopyTip('Copy code');
                      // Keeps the tooltip open after copying
                      setTooltipOpen(true);
                    }}>
                    {copyTip === 'Copied' ? (
                      <DocumentCheckIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </CopyToClipboard>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <code className={cn('text-sm', className)} {...props} />
          );
        }
        // pre: (pre) => {
        //   const codeChunk = (pre as any).node.children[0].children[0].value as string;
        //   const [copyTip, setCopyTip] = useState('Copy code');

        //   return (
        //     <div style={{ borderColor: 'rgb(59 57 57)' }} className="relative overflow-x-auto border-2  rounded-b-lg">
        //       <div className="flex items-center">
        //         <FileIcon height="30px" width="30px" filename="python.py" />
        //         <p className="ml-2">python.py</p>
        //       </div>
        //       <button className="absolute top-3 right-3 z-10 tooltip tooltip-left" data-tip={copyTip}>
        //         <CopyToClipboard
        //           text={codeChunk}
        //           onCopy={async () => {
        //             setCopyTip('Copied');
        //             await new Promise((resolve) => setTimeout(resolve, 500));
        //             setCopyTip(`Copy code`);
        //           }}>
        //           <DocumentDuplicateIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        //         </CopyToClipboard>
        //       </button>
        //       <pre className="p-0 m-0 rounded-md" {...pre}></pre>
        //     </div>
        //   );
        // }
      }}>
      {mdString}
    </ReactMarkdown>
  );
};

export { MarkdownRender };
