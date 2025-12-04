import { TextEncodeDecodeSimultaneous } from './TextEncodeDecodeSimultaneous';

export function Base64SimultaneousPanel() {
  return (
    <TextEncodeDecodeSimultaneous
      placeholder="Enter text to encode and decode..."
      encodeErrorMessage="Invalid input"
      decodeErrorMessage="Invalid base64 input"
      encode={(text) => btoa(text)}
      decode={(text) => atob(text)}
      useCodeBlock={true}
    />
  );
}
