import { haberdasher } from ".";

describe("Haberdasher", () => {
  describe("Haberdasher.MakeHat", () => {
    it("makes hats", () => {
      const size = { inches: 12 };
      const ctx = { currentUser: { username: "tate" } };

      expect(haberdasher.MakeHat(size, ctx)).toEqual(
        expect.objectContaining({
          inches: size.inches,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          name: expect.stringMatching("tate"),
        }),
      );
    });
  });
});
