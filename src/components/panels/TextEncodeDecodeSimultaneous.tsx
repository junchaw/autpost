import { useState, useEffect } from 'react';
import { CodeBlock } from '../CodeBlock';

interface TextEncodeDecodeSimultaneousProps {
  placeholder: string;
  encodeErrorMessage: string;
  decodeErrorMessage: string;
  encode: (text: string) => string;
  decode: (text: string) => string;
  useCodeBlock?: boolean;
}

export function TextEncodeDecodeSimultaneous({
  placeholder,
  encodeErrorMessage,
  decodeErrorMessage,
  encode,
  decode,
  useCodeBlock = false,
}: TextEncodeDecodeSimultaneousProps) {
  const [input, setInput] = useState('');
  const [encodedOutput, setEncodedOutput] = useState('');
  const [decodedOutput, setDecodedOutput] = useState('');
  const [encodeError, setEncodeError] = useState('');
  const [decodeError, setDecodeError] = useState('');

  useEffect(() => {
    // Encode
    setEncodeError('');
    try {
      const encoded = input ? encode(input) : '';
      setEncodedOutput(encoded);
    } catch (err) {
      setEncodeError(encodeErrorMessage);
      setEncodedOutput('');
    }

    // Decode
    setDecodeError('');
    try {
      const decoded = input ? decode(input) : '';
      setDecodedOutput(decoded);
    } catch (err) {
      setDecodeError(decodeErrorMessage);
      setDecodedOutput('');
    }
  }, [input, encode, decode, encodeErrorMessage, decodeErrorMessage]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="label" htmlFor="simultaneous-input">
          <span className="label-text font-medium">Input</span>
        </label>
        <textarea
          id="simultaneous-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="label" htmlFor="encoded-output">
            <span className="label-text font-medium">Encoded Output</span>
          </label>
          {encodeError && (
            <div className="alert alert-error p-2 text-xs">
              <span>{encodeError}</span>
            </div>
          )}
          {useCodeBlock ? (
            <CodeBlock code={encodedOutput} />
          ) : (
            <textarea
              id="encoded-output"
              value={encodedOutput}
              readOnly
              rows={6}
              className="textarea textarea-bordered w-full resize-none font-mono text-success"
            />
          )}
        </div>
        <div className="space-y-3">
          <label className="label" htmlFor="decoded-output">
            <span className="label-text font-medium">Decoded Output</span>
          </label>
          {decodeError && (
            <div className="alert alert-error p-2 text-xs">
              <span>{decodeError}</span>
            </div>
          )}
          {useCodeBlock ? (
            <CodeBlock code={decodedOutput} />
          ) : (
            <textarea
              id="decoded-output"
              value={decodedOutput}
              readOnly
              rows={6}
              className="textarea textarea-bordered w-full resize-none font-mono text-info"
            />
          )}
        </div>
      </div>
    </div>
  );
}
