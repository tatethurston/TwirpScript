import { describe, it, expect } from "@jest/globals";
import { HaberdasherService } from ".";

describe("HaberdasherService", () => {
  describe("HaberdasherService.MakeHat", () => {
    it("makes hats", () => {
      const size = { inches: 12 };
      expect(HaberdasherService.MakeHat(size)).toEqual({
        inches: 12,
        color: "purple",
        name: "my first hat",
      });
    });
  });
});
