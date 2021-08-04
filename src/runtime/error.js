"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twirpError = exports.isTwirpIntermediaryError = exports.isTwirpError = void 0;
// const ErrorCode = {
//   canceled: 408,
//   unknown: 500,
//   invalid_argument: 400,
//   malformed: 400,
//   deadline_exceeded: 408,
//   not_found: 404,
//   bad_route: 404,
//   already_exists: 409,
//   permission_denied: 403,
//   unauthenticated: 401,
//   resource_exhausted: 403,
//   failed_precondition: 412,
//   aborted: 409,
//   out_of_range: 400,
//   unimplemented: 501,
//   internal: 500,
//   unavailable: 503,
//   data_loss: 500,
// } as const;
// type ErrorNumber = typeof ErrorCode[keyof typeof ErrorCode];
function isTwirpError(error) {
    return error.code !== undefined;
}
exports.isTwirpError = isTwirpError;
function isTwirpIntermediaryError(error) {
    var _a;
    return ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.http_error_from_intermediary) === "true";
}
exports.isTwirpIntermediaryError = isTwirpIntermediaryError;
function errorCodeFromStatusCode(status) {
    var _a;
    if (300 >= status && status <= 400) {
        return "internal";
    }
    const statusError = {
        401: "unauthenticated",
        403: "permission_denied",
        404: "bad_route",
        429: "unavailable",
        502: "unavailable",
        503: "unavailable",
        504: "unavailable",
    };
    return (_a = statusError[status]) !== null && _a !== void 0 ? _a : "internal";
}
async function twirpError(res) {
    const text = await res.text();
    try {
        const json = JSON.parse(text);
        if (isTwirpError(json)) {
            return json;
        }
    }
    catch (_a) { }
    const errorFromIntermediary = {
        code: errorCodeFromStatusCode(res.status),
        msg: "HTTP Error from Intermediary Proxy",
        meta: {
            http_error_from_intermediary: "true",
            status_code: res.status.toString(),
            body: text,
        },
    };
    const location = res.headers.get("Location");
    if (location) {
        errorFromIntermediary.meta["location"] = location;
    }
    return errorFromIntermediary;
}
exports.twirpError = twirpError;
