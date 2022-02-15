import { describe, it, expect } from "@jest/globals";
import { haberdasher } from ".";

describe("Haberdasher", () => {
  describe("Haberdasher.MakeHat", () => {
    it("makes hats", () => {
      const size = { inches: 12 };
      const ctx = { currentUser: { username: "tate" } };

      expect(haberdasher.MakeHat(size, ctx)).toEqual(
        expect.objectContaining({
          inches: size.inches,
          name: expect.stringMatching("tate"),
        })
      );
    });
  });
});
