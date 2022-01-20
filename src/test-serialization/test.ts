import { describe, it } from "@jest/globals";
import { Foo } from "./message.pb";

describe("Serialization/Deserialization", () => {
  describe("protobuf", () => {
    describe("deserialization", () => {
      it("empty deserialization", () => {
        expect(Foo.decode(Foo.encode({}))).toMatchInlineSnapshot(`
          Object {
            "field_five": Array [],
            "field_four": Object {
              "field_one": "",
              "field_three": Array [],
              "field_two": Object {},
            },
            "field_one": 0,
            "field_seven": Array [],
            "field_six": 0,
            "field_three": Array [],
            "field_two": Object {},
          }
        `);
      });

      it("partial deserialization", () => {
        expect(
          Foo.decode(
            Foo.encode({
              field_one: 3,
            })
          )
        ).toMatchInlineSnapshot(`
          Object {
            "field_five": Array [],
            "field_four": Object {
              "field_one": "",
              "field_three": Array [],
              "field_two": Object {},
            },
            "field_one": 3,
            "field_seven": Array [],
            "field_six": 0,
            "field_three": Array [],
            "field_two": Object {},
          }
        `);
      });

      it("default message deserialization", () => {
        expect(Foo.decode(Foo.encode(Foo.initialize()))).toMatchInlineSnapshot(`
          Object {
            "field_five": Array [],
            "field_four": Object {
              "field_one": "",
              "field_three": Array [],
              "field_two": Object {},
            },
            "field_one": 0,
            "field_seven": Array [],
            "field_six": 0,
            "field_three": Array [],
            "field_two": Object {},
          }
        `);
      });

      it("full deserialization", () => {
        expect(
          Foo.decode(
            Foo.encode({
              field_one: 3,
              field_two: {
                foo: 4,
              },

              field_three: [
                {
                  field_one: "foo",
                  field_two: {
                    foo: 3,
                    bar: 4,
                  },

                  field_three: [1, 2, 3],
                },
              ],

              field_four: {
                field_one: "foo",
                field_two: {
                  foo: 3,
                  bar: 4,
                },

                field_three: [1, 2, 3],
              },

              field_five: [1, 2],
            })
          )
        ).toMatchInlineSnapshot(`
          Object {
            "field_five": Array [
              1,
              2,
            ],
            "field_four": Object {
              "field_one": "foo",
              "field_three": Array [
                1,
                2,
                3,
              ],
              "field_two": Object {
                "bar": 4,
                "foo": 3,
              },
            },
            "field_one": 3,
            "field_seven": Array [],
            "field_six": 0,
            "field_three": Array [
              undefined,
            ],
            "field_two": Object {
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
            field_one: 3,
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
            field_one: 3,
            field_two: {
              foo: 4,
            },

            field_three: [
              {
                field_one: "foo",
                field_two: {
                  foo: 3,
                  bar: 4,
                },

                field_three: [1, 2, 3],
              },
            ],

            field_four: {
              field_one: "foo",
              field_two: {
                foo: 3,
                bar: 4,
              },

              field_three: [1, 2, 3],
            },

            field_five: [1, 2],
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
