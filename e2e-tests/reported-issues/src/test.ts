import { describe, it } from "@jest/globals";
import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { findFiles, getProtobufTSFileName } from "../../../src/utils";

function runCmd(cmd: string) {
  return spawnSync(cmd, {
    encoding: "utf8",
    shell: true,
  });
}

describe("TwirpScript Compiler", () => {
  describe("generates", () => {
    runCmd(`yarn clean`);

    const twirpscript = runCmd(`yarn twirpscript`);
    expect(twirpscript.stdout).toMatchSnapshot();

    const expected = findFiles(".", ".proto").map(getProtobufTSFileName);

    it.each(expected)(`%s`, (file) => {
      expect(readFileSync(file, "utf8")).toMatchSnapshot();
    });

    const tsc = runCmd(`yarn tsc --noEmit`);
    expect(tsc.stdout).toMatchSnapshot();
  });
});
