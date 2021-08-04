"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PBrequest = exports.JSONrequest = void 0;
const error_1 = require("./error");
async function JSONrequest(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw await error_1.twirpError(res);
    }
    return res.json();
}
exports.JSONrequest = JSONrequest;
async function PBrequest(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/protobuf",
        },
        body,
    });
    if (!res.ok) {
        throw await error_1.twirpError(res);
    }
    return new Uint8Array(await res.arrayBuffer());
}
exports.PBrequest = PBrequest;
