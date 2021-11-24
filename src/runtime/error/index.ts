export interface TwirpError {
  code: ErrorCode;
  msg: string;
  meta?: Record<string, string>;
}

interface TwirpIntermediaryError extends TwirpError {
  meta: {
    body: string;
    http_error_from_intermediary: "true";
    location?: string;
    status_code: string;
  };
}

type ErrorCode =
  | "canceled"
  | "unknown"
  | "invalid_argument"
  | "malformed"
  | "deadline_exceeded"
  | "not_found"
  | "bad_route"
  | "already_exists"
  | "permission_denied"
  | "unauthenticated"
  | "resource_exhausted"
  | "failed_precondition"
  | "aborted"
  | "out_of_range"
  | "unimplemented"
  | "internal"
  | "unavailable"
  | "data_loss";

export const statusCodeForErrorCode = {
  canceled: 408,
  unknown: 500,
  invalid_argument: 400,
  malformed: 400,
  deadline_exceeded: 408,
  not_found: 404,
  bad_route: 404,
  already_exists: 409,
  permission_denied: 403,
  unauthenticated: 401,
  resource_exhausted: 403,
  failed_precondition: 412,
  aborted: 409,
  out_of_range: 400,
  unimplemented: 501,
  internal: 500,
  unavailable: 503,
  data_loss: 500,
} as const;

export function isTwirpError(error: any | TwirpError): error is TwirpError {
  return (error as TwirpError)?.code in statusCodeForErrorCode;
}

function errorCodeFromStatusCode(status: number): ErrorCode {
  if (300 >= status && status <= 400) {
    return "internal";
  }

  const statusError: Record<number, ErrorCode | undefined> = {
    401: "unauthenticated",
    403: "permission_denied",
    404: "bad_route",
    429: "unavailable",
    502: "unavailable",
    503: "unavailable",
    504: "unavailable",
  };

  return statusError[status] ?? "internal";
}

export async function twirpErrorFromResponse(
  res: Response
): Promise<TwirpError> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (isTwirpError(json)) {
      return json;
    }
  } catch {}

  const errorFromIntermediary: TwirpIntermediaryError = {
    code: errorCodeFromStatusCode(res.status),
    msg: "HTTP Error from Intermediary Proxy",
    meta: {
      http_error_from_intermediary: "true",
      status_code: res.status.toString(),
      body: text,
      location: res.headers.get("Location") ?? undefined,
    },
  };
  return errorFromIntermediary;
}
