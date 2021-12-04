import { describe, it } from "@jest/globals";
import { JSONrequest, PBrequest } from ".";

global.fetch = jest.fn();
const fetch = global.fetch as jest.Mock;

describe("JSONrequest", () => {
  it("throws a Twirp Error when status is not ok", async () => {
    const twirpError = { code: "malformed", msg: "malformed" };
    fetch.mockReturnValue({
      ok: false,
      text: () => JSON.stringify(twirpError),
    });
    let error;
    try {
      await JSONrequest("/foo");
    } catch (e) {
      error = e;
    }

    expect(error).toEqual(twirpError);
  });

  describe("headers", () => {
    beforeEach(() => {
      fetch.mockReturnValue({
        ok: true,
        json: () => ({}),
      });
    });

    it('sets "Content-Type": "application/json"', async () => {
      await JSONrequest("/foo");

      expect(fetch).toHaveBeenCalledWith("/twirp/foo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: undefined,
      });
    });
  });
});

describe("PBrequest", () => {
  it("throws a Twirp Error when status is not ok", async () => {
    const twirpError = { code: "malformed", msg: "malformed" };
    fetch.mockReturnValue({
      ok: false,
      text: () => JSON.stringify(twirpError),
    });
    let error;
    try {
      await PBrequest("/foo");
    } catch (e) {
      error = e;
    }

    expect(error).toEqual(twirpError);
  });

  describe("headers", () => {
    beforeEach(() => {
      fetch.mockReturnValue({
        ok: true,
        arrayBuffer: () => ({}),
      });
    });

    it('sets "Content-Type": "application/protobuf"', async () => {
      await PBrequest("/foo");

      expect(fetch).toHaveBeenCalledWith("/twirp/foo", {
        method: "POST",
        headers: {
          "Content-Type": "application/protobuf",
        },
        body: undefined,
      });
    });
  });
});
