import { TextEncodeDecodeSimultaneous } from './TextEncodeDecodeSimultaneous';

export function URLSimultaneousPanel() {
  return (
    <TextEncodeDecodeSimultaneous
      placeholder="Enter text to encode and decode..."
      encodeErrorMessage="Invalid input"
      decodeErrorMessage="Invalid URL encoded input"
      encode={(text) => encodeURIComponent(text)}
      decode={(text) => decodeURIComponent(text)}
      useCodeBlock={false}
    />
  );
}
