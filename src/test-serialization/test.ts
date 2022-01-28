import { describe, it } from "@jest/globals";
import { Foo } from "./message.pb";

describe("Serialization/Deserialization", () => {
  describe("protobuf", () => {
    describe("deserialization", () => {
      it("empty deserialization", () => {
        expect(Foo.decode(Foo.encode({}))).toMatchInlineSnapshot(`
          Object {
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldOne": 0,
            "fieldSeven": Array [],
            "fieldSix": 0,
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("partial deserialization", () => {
        expect(
          Foo.decode(
            Foo.encode({
              fieldOne: 3,
            })
          )
        ).toMatchInlineSnapshot(`
          Object {
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldOne": 3,
            "fieldSeven": Array [],
            "fieldSix": 0,
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("default message deserialization", () => {
        expect(Foo.decode(Foo.encode(Foo.initialize()))).toMatchInlineSnapshot(`
          Object {
            "fieldFive": Array [],
            "fieldFour": Object {
              "fieldOne": "",
              "fieldThree": Array [],
              "fieldTwo": Object {},
            },
            "fieldOne": 0,
            "fieldSeven": Array [],
            "fieldSix": 0,
            "fieldThree": Array [],
            "fieldTwo": Object {},
          }
        `);
      });

      it("full deserialization", () => {
        expect(
          Foo.decode(
            Foo.encode({
              fieldOne: 3,
              fieldTwo: {
                foo: 4,
              },

              fieldThree: [
                {
                  fieldOne: "foo",
                  fieldTwo: {
                    foo: 3,
                    bar: 4,
                  },

                  fieldThree: [1, 2, 3],
                },
              ],

              fieldFour: {
                fieldOne: "foo",
                fieldTwo: {
                  foo: 3,
                  bar: 4,
                },

                fieldThree: [1, 2, 3],
              },

              fieldFive: [1, 2],
            })
          )
        ).toMatchInlineSnapshot(`
          Object {
            "fieldFive": Array [
              1,
              2,
            ],
            "fieldFour": Object {
              "fieldOne": "foo",
              "fieldThree": Array [
                1,
                2,
                3,
              ],
              "fieldTwo": Object {
                "bar": 4,
                "foo": 3,
              },
            },
            "fieldOne": 3,
            "fieldSeven": Array [],
            "fieldSix": 0,
            "fieldThree": Array [
              undefined,
            ],
            "fieldTwo": Object {
              "foo": 4,
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
        expect(
          Foo.encode({
            fieldOne: 3,
          })
        ).toMatchInlineSnapshot(`
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
        expect(
          Foo.encode({
            fieldOne: 3,
            fieldTwo: {
              foo: 4,
            },

            fieldThree: [
              {
                fieldOne: "foo",
                fieldTwo: {
                  foo: 3,
                  bar: 4,
                },

                fieldThree: [1, 2, 3],
              },
            ],

            fieldFour: {
              fieldOne: "foo",
              fieldTwo: {
                foo: 3,
                bar: 4,
              },

              fieldThree: [1, 2, 3],
            },

            fieldFive: [1, 2],
          })
        ).toMatchInlineSnapshot(`
          Uint8Array [
            8,
            3,
            18,
            7,
            10,
            3,
            102,
            111,
            111,
            16,
            4,
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
          ]
        `);
      });
    });
  });
});
