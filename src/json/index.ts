import { twirpError } from "./error";

export async function request(
  url: string,
  body?: Record<string, any>
): Promise<unknown> {
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
