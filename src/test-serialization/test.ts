import { describe, it } from "@jest/globals";
import { Baz, Foo } from "./message.pb";

const nestedMessage: Foo.FooBar = {
  fieldOne: "foo",
  fieldTwo: {
    foo: 3n,
    bar: 4n,
  },

  fieldThree: [1, 2, 3],
};

const fullMessage: Foo = {
  fieldOne: 3,
  fieldTwo: {
    foo: {
      fieldOne: "foo",
      fieldTwo: {
        foo: 3n,
        bar: 4n,
      },

      fieldThree: [1, 2, 3],
    },
  },

  fieldThree: [
    {
      fieldOne: "foo",
      fieldTwo: {
        foo: 3n,
        bar: 4n,
      },

      fieldThree: [1, 2, 3],
    },
  ],

  fieldFour: nestedMessage,

  fieldFive: [1n, 2n],
  fieldSix: Baz.BAR,
  fieldSeven: [Baz.BAR, Baz.FOO],
  fieldEight: 223372036854775807n,
  fieldNine: new Uint8Array([8, 7]),
  fieldTen: [new Uint8Array([4])],
};

const partialMessage: Partial<Foo> = {
  fieldOne: 3,
};

describe("Serialization/Deserialization", () => {
  describe("protobuf", () => {
    describe("deserialization", () => {
      it("empty deserialization", () => {
        expect(Foo.decode(Foo.encode({}))).toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("partial deserialization", () => {
        expect(Foo.decode(Foo.encode(partialMessage))).toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldOne": 3,
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("default message deserialization", () => {
        expect(Foo.decode(Foo.encode(Foo.initialize()))).toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("full deserialization", () => {
        expect(Foo.decode(Foo.encode(fullMessage))).toMatchInlineSnapshot(`
          Object {
            "fieldEight": 223372036854775807n,
            "fieldFive": Array [
              1n,
              2n,
            ],
            "fieldFour": Object {
              "fieldOne": "foo",
              "fieldThree": Array [
                1,
                2,
                3,
              ],
              "fieldTwo": Object {
                "bar": 4n,
                "foo": 3n,
              },
            },
            "fieldNine": Uint8Array [
              8,
              7,
            ],
            "fieldOne": 3,
            "fieldSeven": Array [
              "BAR",
              "FOO",
            ],
            "fieldSix": "BAR",
            "fieldTen": Array [
              Uint8Array [
                4,
              ],
            ],
            "fieldThree": Array [
              Object {
                "fieldOne": "foo",
                "fieldThree": Array [
                  1,
                  2,
                  3,
                ],
                "fieldTwo": Object {
                  "bar": 4n,
                  "foo": 3n,
                },
              },
            ],
            "fieldTwo": Object {
              "foo": undefined,
            },
          }
        `);
      });
    });

    describe("serialization", () => {
      it("empty serialization", () => {
        expect(Foo.encode({})).toMatchInlineSnapshot(`Uint8Array []`);
      });

      it("partial serialization", () => {
        expect(Foo.encode(partialMessage)).toMatchInlineSnapshot(`
                  Uint8Array [
                    8,
                    3,
                  ]
              `);
      });

      it("default message serialization", () => {
        expect(Foo.encode(Foo.initialize())).toMatchInlineSnapshot(`
          Uint8Array [
            34,
            0,
          ]
        `);
      });

      it("full serialization", () => {
        expect(Foo.encode(fullMessage)).toMatchInlineSnapshot(`
          Uint8Array [
            8,
            3,
            18,
            36,
            10,
            3,
            102,
            111,
            111,
            18,
            29,
            10,
            3,
            102,
            111,
            111,
            18,
            7,
            10,
            3,
            102,
            111,
            111,
            16,
            3,
            18,
            7,
            10,
            3,
            98,
            97,
            114,
            16,
            4,
            24,
            1,
            24,
            2,
            24,
            3,
            26,
            29,
            10,
            3,
            102,
            111,
            111,
            18,
            7,
            10,
            3,
            102,
            111,
            111,
            16,
            3,
            18,
            7,
            10,
            3,
            98,
            97,
            114,
            16,
            4,
            24,
            1,
            24,
            2,
            24,
            3,
            34,
            29,
            10,
            3,
            102,
            111,
            111,
            18,
            7,
            10,
            3,
            102,
            111,
            111,
            16,
            3,
            18,
            7,
            10,
            3,
            98,
            97,
            114,
            16,
            4,
            24,
            1,
            24,
            2,
            24,
            3,
            40,
            1,
            40,
            2,
            48,
            1,
            56,
            1,
            56,
            0,
            64,
            255,
            255,
            239,
            235,
            241,
            245,
            228,
            140,
            3,
            74,
            2,
            8,
            7,
            82,
            1,
            4,
          ]
        `);
      });
    });
  });

  describe("json", () => {
    describe("deserialization", () => {
      it("empty deserialization", () => {
        expect(Foo.decodeJSON(Foo.encodeJSON({}))).toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("partial deserialization", () => {
        expect(Foo.decodeJSON(Foo.encodeJSON(partialMessage)))
          .toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldOne": 3,
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("default message deserialization", () => {
        expect(Foo.decodeJSON(Foo.encodeJSON(Foo.initialize())))
          .toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("full deserialization", () => {
        expect(Foo.decodeJSON(Foo.encodeJSON(fullMessage)))
          .toMatchInlineSnapshot(`
          Object {
            "fieldEight": 223372036854775807n,
            "fieldFive": Array [
              1n,
              2n,
            ],
            "fieldFour": Object {
              "fieldOne": "foo",
              "fieldThree": Array [
                1,
                2,
                3,
              ],
              "fieldTwo": Object {
                "bar": "4",
                "foo": "3",
              },
            },
            "fieldNine": Uint8Array [
              8,
              7,
            ],
            "fieldOne": 3,
            "fieldSeven": Array [
              "BAR",
              "FOO",
            ],
            "fieldSix": "BAR",
            "fieldTen": Array [
              Uint8Array [
                4,
              ],
            ],
            "fieldThree": Array [
              Object {
                "fieldOne": "foo",
                "fieldThree": Array [
                  1,
                  2,
                  3,
                ],
                "fieldTwo": Object {
                  "bar": "4",
                  "foo": "3",
                },
              },
            ],
            "fieldTwo": Object {
              "foo": Object {
                "fieldOne": "foo",
                "fieldThree": Array [
                  1,
                  2,
                  3,
                ],
                "fieldTwo": Object {
                  "bar": "4",
                  "foo": "3",
                },
              },
            },
          }
        `);
      });

      it("original proto field name", () => {
        expect(Foo.decodeJSON('{ "field_one": 3 }')).toMatchInlineSnapshot(`
          Object {
            "fieldEight": 0n,
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldNine": Uint8Array [],
            "fieldOne": 3,
            "fieldSeven": Array [],
            "fieldSix": "FOO",
            "fieldTen": Array [],
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });
    });

    describe("serialization", () => {
      it("empty serialization", () => {
        expect(Foo.encodeJSON({})).toMatchInlineSnapshot(`"{}"`);
      });

      it("partial serialization", () => {
        expect(Foo.encodeJSON(partialMessage)).toMatchInlineSnapshot(
          `"{\\"fieldOne\\":3}"`
        );
      });

      it("default message serialization", () => {
        expect(Foo.encodeJSON(Foo.initialize())).toMatchInlineSnapshot(`"{}"`);
      });

      it("full serialization", () => {
        expect(Foo.encodeJSON(fullMessage)).toMatchInlineSnapshot(
          `"{\\"fieldOne\\":3,\\"fieldTwo\\":{\\"foo\\":{\\"fieldOne\\":\\"foo\\",\\"fieldTwo\\":{\\"foo\\":\\"3\\",\\"bar\\":\\"4\\"},\\"fieldThree\\":[1,2,3]}},\\"fieldThree\\":[{\\"fieldOne\\":\\"foo\\",\\"fieldTwo\\":{\\"foo\\":\\"3\\",\\"bar\\":\\"4\\"},\\"fieldThree\\":[1,2,3]}],\\"fieldFour\\":{\\"fieldOne\\":\\"foo\\",\\"fieldTwo\\":{\\"foo\\":\\"3\\",\\"bar\\":\\"4\\"},\\"fieldThree\\":[1,2,3]},\\"fieldFive\\":[\\"1\\",\\"2\\"],\\"fieldSix\\":\\"BAR\\",\\"luckySeven\\":[\\"BAR\\",\\"FOO\\"],\\"fieldEight\\":\\"223372036854775807\\",\\"fieldNine\\":\\"CAc=\\",\\"fieldTen\\":[\\"BA==\\"]}"`
        );
      });
    });
  });
});
