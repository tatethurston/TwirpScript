import { describe, it, expect } from "@jest/globals";
import { Haberdasher } from ".";

describe("Haberdasher", () => {
  describe("Haberdasher.MakeHat", () => {
    it("makes hats", () => {
      const size = { inches: 12 };
      const ctx = { currentUser: { username: "tate" } };

      expect(Haberdasher.MakeHat(size, ctx)).toEqual(
        expect.objectContaining({
          inches: size.inches,
          name: expect.stringMatching("tate"),
        })
      );
    });
  });
});
