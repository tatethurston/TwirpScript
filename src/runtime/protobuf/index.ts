export { BinaryReader, BinaryWriter } from "protoscript";

export function encodeBase64Bytes(bytes: Uint8Array): string {
  return btoa(
    bytes.reduce((acc, current) => acc + String.fromCharCode(current), "")
  );
}

export function decodeBase64Bytes(bytes: string): Uint8Array {
  const decoded = atob(bytes);
  const buffer = new Uint8Array(decoded.length);
  buffer.forEach((_, idx) => {
    buffer[idx] = decoded.charCodeAt(idx);
  });
  return buffer;
}
