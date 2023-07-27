import { createEventEmitter } from "./index.js";

describe("EventEmitter", () => {
  it("#on", () => {
    const ee = createEventEmitter();
    const handler = jest.fn();

    ee.on("foo", handler);
    ee.emit("foo");

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("#off", () => {
    const ee = createEventEmitter();
    const handler = jest.fn();

    ee.on("foo", handler);
    ee.off("foo", handler);
    ee.emit("foo");

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it("#emit", () => {
    const ee = createEventEmitter<{ foo: (x: number, y: string) => void }>();
    const handler = jest.fn();

    ee.on("foo", handler);
    ee.emit("foo", 1, "bar");

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1, "bar");
  });
});
