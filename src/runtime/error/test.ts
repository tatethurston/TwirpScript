import { describe, it } from "@jest/globals";
import { isTwirpError, twirpErrorFromResponse } from ".";
import { RpcTransportResponse } from "../client";

describe("isTwirpError", () => {
  it("true when code is present", () => {
    expect(isTwirpError({ code: "malformed", msg: "malformed" })).toEqual(true);
  });

  it("false when code is not present", () => {
    expect(isTwirpError({})).toEqual(false);
  });
});

describe("twirpErrorFromResponse", () => {
  it("returns the Twirp error as JSON", async () => {
    const twirpError = {
      code: "malformed",
      msg: "malformed",
    };
    const res = await twirpErrorFromResponse({
      text: () => JSON.stringify(twirpError),
    } as unknown as RpcTransportResponse);
    expect(res).toEqual(twirpError);
  });

  it("returns a TwirpIntermediaryError when JSON parsing fails", async () => {
    const res = await twirpErrorFromResponse({
      text: () => "an error occurred at the CDN",
      status: 300,
      headers: { get: () => "foo" },
    } as unknown as RpcTransportResponse);

    expect(res).toEqual({
      code: "internal",
      msg: "HTTP Error from Intermediary Proxy",
      meta: {
        http_error_from_intermediary: "true",
        status_code: "300",
        body: "an error occurred at the CDN",
        location: "foo",
      },
    });
  });

  it("returns a TwirpIntermediaryError when not a Twirp error", async () => {
    const notATwirpError = JSON.stringify({ error: "uh oh!" });

    const res = await twirpErrorFromResponse({
      text: () => notATwirpError,
      status: 401,
      headers: { get: () => undefined },
    } as unknown as RpcTransportResponse);

    expect(res).toEqual({
      code: "unauthenticated",
      msg: "HTTP Error from Intermediary Proxy",
      meta: {
        http_error_from_intermediary: "true",
        status_code: "401",
        body: notATwirpError,
        location: undefined,
      },
    });
  });
});
