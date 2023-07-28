/* eslint-disable no-undef */
import { haberdasher } from ".";

describe("Haberdasher", () => {
  describe("Haberdasher.MakeHat", () => {
    it("makes hats", () => {
      const size = { inches: 12 };

      expect(haberdasher.MakeHat(size, {})).toEqual(
        expect.objectContaining({
          inches: size.inches,
        }),
      );
    });
  });
});
