import { twirpErrorFromResponse } from "./index.js";
import { mockRpcTransportResponse } from "../client/test.mocks.js";

describe("twirpErrorFromResponse", () => {
  it("Twirp error when Twirp error", async () => {
    const twirpError = {
      code: "malformed",
      msg: "malformed",
    };

    const res = await twirpErrorFromResponse({
      ...mockRpcTransportResponse,
      text: () => Promise.resolve(JSON.stringify(twirpError)),
    });

    expect(res).toEqual(twirpError);
  });

  it("TwirpIntermediaryError when JSON parsing fails", async () => {
    const res = await twirpErrorFromResponse({
      ...mockRpcTransportResponse,
      text: () => Promise.resolve("an error occurred at the CDN"),
      status: 300,
      headers: { get: () => "foo" },
    });

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

  it("TwirpIntermediaryError when not a Twirp error", async () => {
    const notATwirpError = JSON.stringify({ error: "uh oh!" });

    const res = await twirpErrorFromResponse({
      ...mockRpcTransportResponse,
      text: () => Promise.resolve(notATwirpError),
    });

    expect(res).toEqual({
      code: "internal",
      msg: "HTTP Error from Intermediary Proxy",
      meta: {
        http_error_from_intermediary: "true",
        status_code: "500",
        body: notATwirpError,
        location: undefined,
      },
    });
  });
});
