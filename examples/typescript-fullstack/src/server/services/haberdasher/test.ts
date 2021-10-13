import { describe, it, expect } from "@jest/globals";
import { Haberdasher } from ".";

describe("Haberdasher", () => {
  describe("Haberdasher.MakeHat", () => {
    it("makes hats", () => {
      const size = { inches: 12 };

      expect(Haberdasher.MakeHat(size, {})).toEqual(
        expect.objectContaining({
          inches: size.inches,
        })
      );
    });
  });
});
