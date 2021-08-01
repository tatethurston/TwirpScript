import { twirpError } from "./error";

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
    throw await twirpError(res);
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
    throw await twirpError(res);
  }

  return new Uint8Array(await res.arrayBuffer());
}
