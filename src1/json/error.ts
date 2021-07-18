type TwirpResponse = Record<string, unknown>;

type TwirpError = {
  code: string;
  msg: string;
  meta?: Record<string, string>;
};

type TwirpIntermediaryError = TwirpError & {
  meta: {
    body: string;
    http_error_from_intermediary: "true";
    location?: string;
    status_code: string;
  };
};

const ErrorCode = {
  Canceled: 408,
  Unknown: 500,
  Invalid_Argument: 400,
  Malformed: 400,
  Deadline_Exceeded: 408,
  Not_Found: 404,
  Bad_Route: 404,
  Already_Exists: 409,
  Permission_Denied: 403,
  Unauthenticated: 401,
  Resource_Exhausted: 403,
  Failed_Precondition: 412,
  Aborted: 409,
  Out_Of_Range: 400,
  Unimplemented: 501,
  Internal: 500,
  Unavailable: 503,
  Dataloss: 500,
} as const;

type ErrorNumber = typeof ErrorCode[keyof typeof ErrorCode];

export function isTwirpError<E extends TwirpResponse>(
  error: E
): error is E & TwirpError {
  return Object.values(ErrorCode).includes(error.code as any);
}

export function isTwirpIntermediaryError<E extends TwirpResponse>(
  error: E
): error is E & TwirpIntermediaryError {
  return (error.meta as any)?.http_error_from_intermediary === "true";
}

function errorCodeFromStatus(status: number): ErrorNumber {
  if (300 >= status && status <= 399) {
    return ErrorCode.Internal;
  }

  const statusError: Record<number, ErrorNumber> = {
    400: ErrorCode.Internal,
    401: ErrorCode.Unauthenticated,
    403: ErrorCode.Permission_Denied,
    404: ErrorCode.Bad_Route,
    429: ErrorCode.Unavailable,
    502: ErrorCode.Unavailable,
    503: ErrorCode.Unavailable,
    504: ErrorCode.Unavailable,
  };

  return statusError[status] ?? ErrorCode.Unknown;
}

export async function twirpError(res: Response): Promise<TwirpError> {
  const json = await res.json();
  if (isTwirpError(json)) {
    return json;
  } else {
    const bodyText = await res.text();
    const errorFromIntermediary: TwirpIntermediaryError = {
      code: errorCodeFromStatus(res.status).toString(),
      msg: "HTTP Error from Intermediary Proxy",
      meta: {
        http_error_from_intermediary: "true",
        status_code: res.status.toString(),
        body: bodyText,
      },
    };
    const location = res.headers.get("Location");
    if (location) {
      errorFromIntermediary.meta["location"] = location;
    }
    return errorFromIntermediary;
  }
}
