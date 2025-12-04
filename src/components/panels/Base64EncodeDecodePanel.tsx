import { TextEncodeDecodeShared } from './TextEncodeDecodeShared';

export function Base64EncodeDecodePanel() {
  return (
    <TextEncodeDecodeShared
      decodedLabel="Decoded"
      encodedLabel="Encoded"
      encodePlaceholder="Enter text to encode..."
      decodePlaceholder="Enter base64 to decode..."
      errorMessage="Invalid base64"
      encode={(text) => btoa(text)}
      decode={(text) => atob(text)}
    />
  );
}
