import { twirpErrorFromResponse } from "./error";

export async function JSONrequest<T = unknown>(
  url: string,
  body?: Record<string, any>
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await twirpErrorFromResponse(res);
  }

  return res.json();
}

export async function PBrequest(
  url: string,
  body?: Uint8Array
): Promise<Uint8Array> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/protobuf",
    },
    body,
  });

  if (!res.ok) {
    throw await twirpErrorFromResponse(res);
  }

  const buffer = await res.arrayBuffer();
  return new Uint8Array(buffer);
}
