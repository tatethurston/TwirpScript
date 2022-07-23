import { describe, it } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";
import { compile } from "../../compile.js";

// mock console.error to silence group errors
console.error = jest.fn();

describe("TwirpScript Compiler", () => {
  it("generates TypeScript", () => {
    const input = readFileSync(join(__dirname, "./test-input-typescript.txt"));
    const res = compile(input);
    expect(res).toMatchSnapshot();
  });

  it("generates JavaScript", () => {
    const input = readFileSync(join(__dirname, "./test-input-javascript.txt"));
    const res = compile(input);
    expect(res).toMatchSnapshot();
  });
});
