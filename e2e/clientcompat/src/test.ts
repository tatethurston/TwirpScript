import { spawnSync } from "child_process";
import { join } from "path";

describe("Twirp Client Compatabilitiy Test", () => {
  it("passes", () => {
    const child = spawnSync("./clientcompat -client=./test", {
      encoding: "utf8",
      shell: true,
      cwd: join(__dirname, ".."),
    });

    expect(child.stdout).toMatchInlineSnapshot(`
      "Testing noop without error... PASS
      Testing "canceled" error parsing... PASS
      Testing "unknown" error parsing... PASS
      Testing "invalid_argument" error parsing... PASS
      Testing "deadline_exceeded" error parsing... PASS
      Testing "not_found" error parsing... PASS
      Testing "bad_route" error parsing... PASS
      Testing "already_exists" error parsing... PASS
      Testing "permission_denied" error parsing... PASS
      Testing "unauthenticated" error parsing... PASS
      Testing "resource_exhausted" error parsing... PASS
      Testing "failed_precondition" error parsing... PASS
      Testing "aborted" error parsing... PASS
      Testing "out_of_range" error parsing... PASS
      Testing "unimplemented" error parsing... PASS
      Testing "internal" error parsing... PASS
      Testing "unavailable" error parsing... PASS
      Testing "data_loss" error parsing... PASS
      Testing empty value... PASS
      Testing request value formatting... PASS
      Testing handling invalid error formatting from server... PASS
      PASSED with 0 failures, 21 successes
      "
    `);
  });
});
