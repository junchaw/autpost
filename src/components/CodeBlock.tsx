import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: string;
  showCopyButton?: boolean;
}

export function CodeBlock({ code, language = 'text', showCopyButton = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showCopyButton && isHovered && code && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 p-2 rounded-md bg-base-100 hover:bg-base-200 border border-base-300 transition-all shadow-sm"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-base-content/60" />
          )}
        </button>
      )}
      <Highlight theme={themes.vsDark} code={code || ' '} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} rounded-lg overflow-x-auto p-4 text-sm bg-base-200`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
