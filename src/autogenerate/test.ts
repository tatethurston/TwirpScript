import { describe, it } from "@jest/globals";
import { printHeading } from ".";

describe("printHeading", () => {
  it("short names", () => {
    expect(printHeading("Types")).toMatchInlineSnapshot(`
      "  //========================================//
        //                 Types                  //
        //========================================//
        
        "
    `);
  });

  it("long names", () => {
    expect(printHeading("VeryLongNameThatCausesAnErrorService"))
      .toMatchInlineSnapshot(`
      "  //========================================//
        //  VeryLongNameThatCausesAnErrorService  //
        //========================================//
        
        "
    `);
  });
});
