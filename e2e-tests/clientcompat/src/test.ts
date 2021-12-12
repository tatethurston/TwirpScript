import { describe, it } from "@jest/globals";
import { spawnSync } from "child_process";

describe("Twirp Client Compatabilitiy Test", () => {
  it("passes", () => {
    const child = spawnSync(`./clientcompat -client=./test`, {
      encoding: "utf8",
      shell: true,
    });

    expect(child.stdout).toMatchSnapshot();
  });
});
