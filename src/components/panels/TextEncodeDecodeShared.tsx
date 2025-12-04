import { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { CodeBlock } from '../CodeBlock';

/**
 * Shared component for text encoding/decoding panels with mode switching
 *
 * Features:
 * - Two-panel layout: Plain text on left, encoded text on right
 * - Mode switching button in the center to toggle between encode/decode
 * - In encode mode: left side is editable input, right side shows encoded output
 * - In decode mode: right side is editable input, left side shows decoded output
 * - Output displayed in CodeBlock with syntax highlighting and copy button
 * - Error handling with user-friendly error messages
 *
 * Used by:
 * - Base64EncodeDecodePanel
 * - URLEncodeDecodePanel
 */
interface TextEncodeDecodeSharedProps {
  /** Label for the decoded text column (e.g., "Plain Text", "Decoded") */
  decodedLabel: string;
  /** Label for the encoded text column (e.g., "Base64", "URL Encoded") */
  encodedLabel: string;
  /** Placeholder text when encoding */
  encodePlaceholder: string;
  /** Placeholder text when decoding */
  decodePlaceholder: string;
  /** Error message to display when encoding/decoding fails */
  errorMessage: string;
  /** Function to encode plain text */
  encode: (text: string) => string;
  /** Function to decode encoded text */
  decode: (text: string) => string;
}

export function TextEncodeDecodeShared({
  decodedLabel,
  encodedLabel,
  encodePlaceholder,
  decodePlaceholder,
  errorMessage,
  encode,
  decode,
}: TextEncodeDecodeSharedProps) {
  const [plainText, setPlainText] = useState('');
  const [encodedText, setEncodedText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    try {
      if (mode === 'encode') {
        const encoded = plainText ? encode(plainText) : '';
        setEncodedText(encoded);
      } else {
        const decoded = encodedText ? decode(encodedText) : '';
        setPlainText(decoded);
      }
    } catch (err) {
      setError(errorMessage);
      if (mode === 'encode') {
        setEncodedText('');
      } else {
        setPlainText('');
      }
    }
  }, [plainText, encodedText, mode, encode, decode, errorMessage]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-24 gap-1 items-start">
        <div className="col-span-11 space-y-3">
          <label className="label" htmlFor="plain-text">
            <span className="label-text font-medium">{decodedLabel}</span>
          </label>
          {mode === 'encode' ? (
            <textarea
              id="plain-text"
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder={encodePlaceholder}
              rows={8}
              className="textarea textarea-bordered w-full resize-none font-mono"
            />
          ) : (
            <CodeBlock code={plainText} />
          )}
        </div>

        <div className="col-span-2 flex items-center justify-center pt-8">
          <div
            className="tooltip"
            data-tip={mode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}
          >
            <button onClick={toggleMode} className="btn btn-circle btn-sm">
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="col-span-11 space-y-3">
          <label className="label" htmlFor="encoded-text">
            <span className="label-text font-medium">{encodedLabel}</span>
          </label>
          {mode === 'decode' ? (
            <textarea
              id="encoded-text"
              value={encodedText}
              onChange={(e) => setEncodedText(e.target.value)}
              placeholder={decodePlaceholder}
              rows={8}
              className="textarea textarea-bordered w-full resize-none font-mono"
            />
          ) : (
            <CodeBlock code={encodedText} />
          )}
        </div>
      </div>
    </>
  );
}
