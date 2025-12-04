import { TextEncodeDecodeShared } from './TextEncodeDecodeShared';

export function URLEncodeDecodePanel() {
  return (
    <TextEncodeDecodeShared
      decodedLabel="Decoded"
      encodedLabel="Encoded"
      encodePlaceholder="Enter text to URL encode..."
      decodePlaceholder="Enter URL encoded text to decode..."
      errorMessage="Invalid URL encoded"
      encode={(text) => encodeURIComponent(text)}
      decode={(text) => decodeURIComponent(text)}
    />
  );
}
