import { withRequestLogging, timingField } from "./index.js";
import { describe, it } from "@jest/globals";
import { createEventEmitter } from "../../eventEmitter/index.js";
import { ServerHooks } from "../index.js";
import { TwirpError } from "../../index.js";

console.info = jest.fn();
console.error = jest.fn();

describe("withRequestLogging", () => {
  const ee = createEventEmitter<ServerHooks<any, any>>();
  withRequestLogging(ee as any);

  it("requestReceived", () => {
    ee.emit("requestReceived", {}, { method: "POST", url: "/foo" });
    expect((console.info as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "[TwirpScript] Started POST \\"/foo\\"",
        ],
      ]
    `);
  });

  it("requestRouted", () => {
    ee.emit(
      "requestRouted",
      {
        service: { name: "foo" },
        method: { name: "bar" },
        contentType: "JSON",
      },
      {}
    );
    expect((console.info as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "[TwirpScript] Processing by foo#bar as JSON",
        ],
      ]
    `);
  });

  it("responseSent", () => {
    ee.emit("responseSent", { [timingField]: Date.now() - 10 }, {
      statusCode: 200,
    } as any);
    expect(console.info as jest.Mock).toBeCalledWith(
      expect.stringContaining("[TwirpScript] Completed 200 in")
    );
  });

  it("error", () => {
    ee.emit(
      "error",
      {},
      new TwirpError({ code: "internal", msg: "Internal Error" })
    );
    expect((console.error as jest.Mock).mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "[TwirpScript] Error:",
        ],
        Array [
          TwirpError {
            "code": "internal",
            "meta": undefined,
            "msg": "Internal Error",
          },
        ],
      ]
    `);
  });
});
