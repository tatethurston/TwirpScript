// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: message.proto

import type { ByteSource } from "../../src";
import {
  BinaryReader,
  BinaryWriter,
  encodeBase64Bytes,
  decodeBase64Bytes,
} from "../../src";

//========================================//
//                 Types                  //
//========================================//

export type Baz = "FOO" | "BAR";

export interface Foo {
  fieldOne?: number | null | undefined;
  fieldTwo: Record<string, Foo.FieldTwo["value"] | undefined>;
  fieldThree: Bar[];
  fieldFour: Foo.FooBar;
  fieldFive: bigint[];
  fieldSix: Baz;
  fieldSeven: Baz[];
  fieldEight: bigint;
  fieldNine: Uint8Array;
  fieldTen: Uint8Array[];
}

declare namespace Foo {
  export interface FooBar {
    fieldOne: string;
    fieldTwo: Record<string, Foo.FooBar.FieldTwo["value"] | undefined>;
    fieldThree: number[];
  }

  namespace FooBar {
    interface FieldTwo {
      key: string;
      value: bigint;
    }
  }

  interface FieldTwo {
    key: string;
    value: Bar;
  }
}

export interface Bar {
  fieldOne: string;
  fieldTwo: Record<string, Bar.FieldTwo["value"] | undefined>;
  fieldThree: number[];
}

declare namespace Bar {
  interface FieldTwo {
    key: string;
    value: bigint;
  }
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const Baz = {
  FOO: "FOO",
  BAR: "BAR",
  /**
   * @private
   */
  _fromInt: function (i: number): Baz {
    switch (i) {
      case 0: {
        return "FOO";
      }
      case 1: {
        return "BAR";
      }
      // unknown values are preserved as numbers. this occurs when new enum values are introduced and the generated code is out of date.
      default: {
        return i as unknown as Baz;
      }
    }
  },
  /**
   * @private
   */
  _toInt: function (i: Baz): number {
    switch (i) {
      case "FOO": {
        return 0;
      }
      case "BAR": {
        return 1;
      }
      // unknown values are preserved as numbers. this occurs when new enum values are introduced and the generated code is out of date.
      default: {
        return i as unknown as number;
      }
    }
  },
} as const;

export const Foo = {
  /**
   * Serializes Foo to protobuf.
   */
  encode: function (msg: Partial<Foo>): Uint8Array {
    return Foo._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes Foo from protobuf.
   */
  decode: function (bytes: ByteSource): Foo {
    return Foo._readMessage(Foo.initialize(), new BinaryReader(bytes));
  },

  /**
   * Serializes Foo to JSON.
   */
  encodeJSON: function (msg: Partial<Foo>): string {
    return JSON.stringify(Foo._writeMessageJSON(msg));
  },

  /**
   * Deserializes Foo from JSON.
   */
  decodeJSON: function (json: string): Foo {
    return Foo._readMessageJSON(Foo.initialize(), JSON.parse(json));
  },

  /**
   * Initializes Foo with all fields set to their default value.
   */
  initialize: function (): Foo {
    return {
      fieldTwo: {},
      fieldThree: [],
      fieldFour: Foo.FooBar.initialize(),
      fieldFive: [],
      fieldSix: Baz._fromInt(0),
      fieldSeven: [],
      fieldEight: 0n,
      fieldNine: new Uint8Array(),
      fieldTen: [],
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Foo>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.fieldOne != undefined) {
      writer.writeInt32(1, msg.fieldOne);
    }
    if (msg.fieldTwo) {
      writer.writeRepeatedMessage(
        2,
        Object.entries(msg.fieldTwo).map(([key, value]) => ({
          key: key as any,
          value: value as any,
        })) as any,
        Foo.FieldTwo._writeMessage
      );
    }
    if (msg.fieldThree?.length) {
      writer.writeRepeatedMessage(3, msg.fieldThree as any, Bar._writeMessage);
    }
    if (msg.fieldFour) {
      writer.writeMessage(4, msg.fieldFour, Foo.FooBar._writeMessage);
    }
    if (msg.fieldFive?.length) {
      writer.writeRepeatedInt64String(
        5,
        msg.fieldFive.map((x) => x.toString() as any)
      );
    }
    if (msg.fieldSix && Baz._toInt(msg.fieldSix)) {
      writer.writeEnum(6, Baz._toInt(msg.fieldSix));
    }
    if (msg.fieldSeven?.length) {
      writer.writeRepeatedEnum(7, msg.fieldSeven.map(Baz._toInt));
    }
    if (msg.fieldEight) {
      writer.writeInt64String(8, msg.fieldEight.toString() as any);
    }
    if (msg.fieldNine?.length) {
      writer.writeBytes(9, msg.fieldNine);
    }
    if (msg.fieldTen?.length) {
      writer.writeRepeatedBytes(10, msg.fieldTen);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (msg: Partial<Foo>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.fieldOne != undefined) {
      json.fieldOne = msg.fieldOne;
    }
    if (msg.fieldTwo) {
      const fieldTwo = Object.fromEntries(
        Object.entries(msg.fieldTwo)
          .map(([key, value]) => ({ key: key as any, value: value as any }))
          .map(Foo.FieldTwo._writeMessageJSON)
          .map(({ key, value }) => [key, value])
      );
      if (Object.keys(fieldTwo).length > 0) {
        json.fieldTwo = fieldTwo;
      }
    }
    if (msg.fieldThree?.length) {
      json.fieldThree = msg.fieldThree.map(Bar._writeMessageJSON);
    }
    if (msg.fieldFour) {
      const fieldFour = Foo.FooBar._writeMessageJSON(msg.fieldFour);
      if (Object.keys(fieldFour).length > 0) {
        json.fieldFour = fieldFour;
      }
    }
    if (msg.fieldFive?.length) {
      json.fieldFive = msg.fieldFive.map((x) => x.toString());
    }
    if (msg.fieldSix && Baz._toInt(msg.fieldSix)) {
      json.fieldSix = msg.fieldSix;
    }
    if (msg.fieldSeven?.length) {
      json["luckySeven"] = msg.fieldSeven;
    }
    if (msg.fieldEight) {
      json.fieldEight = msg.fieldEight.toString();
    }
    if (msg.fieldNine?.length) {
      json.fieldNine = encodeBase64Bytes(msg.fieldNine);
    }
    if (msg.fieldTen?.length) {
      json.fieldTen = msg.fieldTen.map(encodeBase64Bytes);
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Foo, reader: BinaryReader): Foo {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.fieldOne = reader.readInt32();
          break;
        }
        case 2: {
          const map = {} as Foo.FieldTwo;
          reader.readMessage(map, Foo.FieldTwo._readMessage);
          msg.fieldTwo[map.key.toString()] = map.value;
          break;
        }
        case 3: {
          const m = Bar.initialize();
          reader.readMessage(m, Bar._readMessage);
          msg.fieldThree.push(m);
          break;
        }
        case 4: {
          reader.readMessage(msg.fieldFour, Foo.FooBar._readMessage);
          break;
        }
        case 5: {
          msg.fieldFive.push(BigInt(reader.readInt64String()));
          break;
        }
        case 6: {
          msg.fieldSix = Baz._fromInt(reader.readEnum());
          break;
        }
        case 7: {
          msg.fieldSeven.push(Baz._fromInt(reader.readEnum()));
          break;
        }
        case 8: {
          msg.fieldEight = BigInt(reader.readInt64String());
          break;
        }
        case 9: {
          msg.fieldNine = reader.readBytes();
          break;
        }
        case 10: {
          msg.fieldTen.push(reader.readBytes());
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  },

  /**
   * @private
   */
  _readMessageJSON: function (msg: Foo, json: any): Foo {
    const _fieldOne = json.fieldOne ?? json.field_one;
    if (_fieldOne) {
      msg.fieldOne = _fieldOne;
    }
    const _fieldTwo = json.fieldTwo ?? json.field_two;
    if (_fieldTwo) {
      msg.fieldTwo = Object.fromEntries(
        Object.entries(_fieldTwo)
          .map(([key, value]) => ({ key: key as any, value: value as any }))
          .map(Foo.FieldTwo._readMessageJSON)
          .map(({ key, value }) => [key, value])
      );
    }
    const _fieldThree = json.fieldThree ?? json.field_three;
    if (_fieldThree) {
      for (const item of _fieldThree) {
        const m = Bar.initialize();
        Bar._readMessageJSON(m, item);
        msg.fieldThree.push(m);
      }
    }
    const _fieldFour = json.fieldFour ?? json.field_four;
    if (_fieldFour) {
      const m = Foo.FooBar.initialize();
      Foo.FooBar._readMessageJSON(m, _fieldFour);
      msg.fieldFour = m;
    }
    const _fieldFive = json.fieldFive ?? json.field_five;
    if (_fieldFive) {
      msg.fieldFive = _fieldFive.map(BigInt);
    }
    const _fieldSix = json.fieldSix ?? json.field_six;
    if (_fieldSix) {
      msg.fieldSix = _fieldSix;
    }
    const _fieldSeven = json["luckySeven"] ?? json.field_seven;
    if (_fieldSeven) {
      msg.fieldSeven = _fieldSeven;
    }
    const _fieldEight = json.fieldEight ?? json.field_eight;
    if (_fieldEight) {
      msg.fieldEight = BigInt(_fieldEight);
    }
    const _fieldNine = json.fieldNine ?? json.field_nine;
    if (_fieldNine) {
      msg.fieldNine = decodeBase64Bytes(_fieldNine);
    }
    const _fieldTen = json.fieldTen ?? json.field_ten;
    if (_fieldTen) {
      msg.fieldTen = _fieldTen.map(decodeBase64Bytes);
    }
    return msg;
  },

  FooBar: {
    /**
     * Serializes Foo.FooBar to protobuf.
     */
    encode: function (msg: Partial<Foo.FooBar>): Uint8Array {
      return Foo.FooBar._writeMessage(
        msg,
        new BinaryWriter()
      ).getResultBuffer();
    },

    /**
     * Deserializes Foo.FooBar from protobuf.
     */
    decode: function (bytes: ByteSource): Foo.FooBar {
      return Foo.FooBar._readMessage(
        Foo.FooBar.initialize(),
        new BinaryReader(bytes)
      );
    },

    /**
     * Serializes Foo.FooBar to JSON.
     */
    encodeJSON: function (msg: Partial<Foo.FooBar>): string {
      return JSON.stringify(Foo.FooBar._writeMessageJSON(msg));
    },

    /**
     * Deserializes Foo.FooBar from JSON.
     */
    decodeJSON: function (json: string): Foo.FooBar {
      return Foo.FooBar._readMessageJSON(
        Foo.FooBar.initialize(),
        JSON.parse(json)
      );
    },

    /**
     * Initializes Foo.FooBar with all fields set to their default value.
     */
    initialize: function (): Foo.FooBar {
      return {
        fieldOne: "",
        fieldTwo: {},
        fieldThree: [],
      };
    },

    /**
     * @private
     */
    _writeMessage: function (
      msg: Partial<Foo.FooBar>,
      writer: BinaryWriter
    ): BinaryWriter {
      if (msg.fieldOne) {
        writer.writeString(1, msg.fieldOne);
      }
      if (msg.fieldTwo) {
        writer.writeRepeatedMessage(
          2,
          Object.entries(msg.fieldTwo).map(([key, value]) => ({
            key: key as any,
            value: value as any,
          })) as any,
          Foo.FooBar.FieldTwo._writeMessage
        );
      }
      if (msg.fieldThree?.length) {
        writer.writeRepeatedInt32(3, msg.fieldThree);
      }
      return writer;
    },

    /**
     * @private
     */
    _writeMessageJSON: function (
      msg: Partial<Foo.FooBar>
    ): Record<string, unknown> {
      const json: Record<string, unknown> = {};
      if (msg.fieldOne) {
        json.fieldOne = msg.fieldOne;
      }
      if (msg.fieldTwo) {
        const fieldTwo = Object.fromEntries(
          Object.entries(msg.fieldTwo)
            .map(([key, value]) => ({ key: key as any, value: value as any }))
            .map(Foo.FooBar.FieldTwo._writeMessageJSON)
            .map(({ key, value }) => [key, value])
        );
        if (Object.keys(fieldTwo).length > 0) {
          json.fieldTwo = fieldTwo;
        }
      }
      if (msg.fieldThree?.length) {
        json.fieldThree = msg.fieldThree;
      }
      return json;
    },

    /**
     * @private
     */
    _readMessage: function (msg: Foo.FooBar, reader: BinaryReader): Foo.FooBar {
      while (reader.nextField()) {
        const field = reader.getFieldNumber();
        switch (field) {
          case 1: {
            msg.fieldOne = reader.readString();
            break;
          }
          case 2: {
            const map = {} as Foo.FooBar.FieldTwo;
            reader.readMessage(map, Foo.FooBar.FieldTwo._readMessage);
            msg.fieldTwo[map.key.toString()] = map.value;
            break;
          }
          case 3: {
            msg.fieldThree.push(reader.readInt32());
            break;
          }
          default: {
            reader.skipField();
            break;
          }
        }
      }
      return msg;
    },

    /**
     * @private
     */
    _readMessageJSON: function (msg: Foo.FooBar, json: any): Foo.FooBar {
      const _fieldOne = json.fieldOne ?? json.field_one;
      if (_fieldOne) {
        msg.fieldOne = _fieldOne;
      }
      const _fieldTwo = json.fieldTwo ?? json.field_two;
      if (_fieldTwo) {
        msg.fieldTwo = Object.fromEntries(
          Object.entries(_fieldTwo)
            .map(([key, value]) => ({ key: key as any, value: value as any }))
            .map(Foo.FooBar.FieldTwo._readMessageJSON)
            .map(({ key, value }) => [key, value])
        );
      }
      const _fieldThree = json.fieldThree ?? json.field_three;
      if (_fieldThree) {
        msg.fieldThree = _fieldThree;
      }
      return msg;
    },

    FieldTwo: {
      /**
       * @private
       */
      _writeMessage: function (
        msg: Partial<Foo.FooBar.FieldTwo>,
        writer: BinaryWriter
      ): BinaryWriter {
        if (msg.key) {
          writer.writeString(1, msg.key);
        }
        if (msg.value) {
          writer.writeInt64String(2, msg.value.toString() as any);
        }
        return writer;
      },

      /**
       * @private
       */
      _writeMessageJSON: function (
        msg: Partial<Foo.FooBar.FieldTwo>
      ): Record<string, unknown> {
        const json: Record<string, unknown> = {};
        if (msg.key) {
          json.key = msg.key;
        }
        if (msg.value) {
          json.value = msg.value.toString();
        }
        return json;
      },

      /**
       * @private
       */
      _readMessage: function (
        msg: Foo.FooBar.FieldTwo,
        reader: BinaryReader
      ): Foo.FooBar.FieldTwo {
        while (reader.nextField()) {
          const field = reader.getFieldNumber();
          switch (field) {
            case 1: {
              msg.key = reader.readString();
              break;
            }
            case 2: {
              msg.value = BigInt(reader.readInt64String());
              break;
            }
            default: {
              reader.skipField();
              break;
            }
          }
        }
        return msg;
      },

      /**
       * @private
       */
      _readMessageJSON: function (
        msg: Foo.FooBar.FieldTwo,
        json: any
      ): Foo.FooBar.FieldTwo {
        const _key = json.key;
        if (_key) {
          msg.key = _key;
        }
        const _value = json.value;
        if (_value) {
          msg.value = BigInt(_value);
        }
        return msg;
      },
    },
  },

  FieldTwo: {
    /**
     * @private
     */
    _writeMessage: function (
      msg: Partial<Foo.FieldTwo>,
      writer: BinaryWriter
    ): BinaryWriter {
      if (msg.key) {
        writer.writeString(1, msg.key);
      }
      if (msg.value) {
        writer.writeMessage(2, msg.value, Bar._writeMessage);
      }
      return writer;
    },

    /**
     * @private
     */
    _writeMessageJSON: function (
      msg: Partial<Foo.FieldTwo>
    ): Record<string, unknown> {
      const json: Record<string, unknown> = {};
      if (msg.key) {
        json.key = msg.key;
      }
      if (msg.value) {
        const value = Bar._writeMessageJSON(msg.value);
        if (Object.keys(value).length > 0) {
          json.value = value;
        }
      }
      return json;
    },

    /**
     * @private
     */
    _readMessage: function (
      msg: Foo.FieldTwo,
      reader: BinaryReader
    ): Foo.FieldTwo {
      while (reader.nextField()) {
        const field = reader.getFieldNumber();
        switch (field) {
          case 1: {
            msg.key = reader.readString();
            break;
          }
          case 2: {
            reader.readMessage(Bar.initialize(), Bar._readMessage);
            break;
          }
          default: {
            reader.skipField();
            break;
          }
        }
      }
      return msg;
    },

    /**
     * @private
     */
    _readMessageJSON: function (msg: Foo.FieldTwo, json: any): Foo.FieldTwo {
      const _key = json.key;
      if (_key) {
        msg.key = _key;
      }
      const _value = json.value;
      if (_value) {
        const m = Bar.initialize();
        Bar._readMessageJSON(m, _value);
        msg.value = m;
      }
      return msg;
    },
  },
};

export const Bar = {
  /**
   * Serializes Bar to protobuf.
   */
  encode: function (msg: Partial<Bar>): Uint8Array {
    return Bar._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes Bar from protobuf.
   */
  decode: function (bytes: ByteSource): Bar {
    return Bar._readMessage(Bar.initialize(), new BinaryReader(bytes));
  },

  /**
   * Serializes Bar to JSON.
   */
  encodeJSON: function (msg: Partial<Bar>): string {
    return JSON.stringify(Bar._writeMessageJSON(msg));
  },

  /**
   * Deserializes Bar from JSON.
   */
  decodeJSON: function (json: string): Bar {
    return Bar._readMessageJSON(Bar.initialize(), JSON.parse(json));
  },

  /**
   * Initializes Bar with all fields set to their default value.
   */
  initialize: function (): Bar {
    return {
      fieldOne: "",
      fieldTwo: {},
      fieldThree: [],
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Bar>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.fieldOne) {
      writer.writeString(1, msg.fieldOne);
    }
    if (msg.fieldTwo) {
      writer.writeRepeatedMessage(
        2,
        Object.entries(msg.fieldTwo).map(([key, value]) => ({
          key: key as any,
          value: value as any,
        })) as any,
        Bar.FieldTwo._writeMessage
      );
    }
    if (msg.fieldThree?.length) {
      writer.writeRepeatedInt32(3, msg.fieldThree);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (msg: Partial<Bar>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.fieldOne) {
      json.fieldOne = msg.fieldOne;
    }
    if (msg.fieldTwo) {
      const fieldTwo = Object.fromEntries(
        Object.entries(msg.fieldTwo)
          .map(([key, value]) => ({ key: key as any, value: value as any }))
          .map(Bar.FieldTwo._writeMessageJSON)
          .map(({ key, value }) => [key, value])
      );
      if (Object.keys(fieldTwo).length > 0) {
        json.fieldTwo = fieldTwo;
      }
    }
    if (msg.fieldThree?.length) {
      json.fieldThree = msg.fieldThree;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Bar, reader: BinaryReader): Bar {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.fieldOne = reader.readString();
          break;
        }
        case 2: {
          const map = {} as Bar.FieldTwo;
          reader.readMessage(map, Bar.FieldTwo._readMessage);
          msg.fieldTwo[map.key.toString()] = map.value;
          break;
        }
        case 3: {
          msg.fieldThree.push(reader.readInt32());
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    return msg;
  },

  /**
   * @private
   */
  _readMessageJSON: function (msg: Bar, json: any): Bar {
    const _fieldOne = json.fieldOne ?? json.field_one;
    if (_fieldOne) {
      msg.fieldOne = _fieldOne;
    }
    const _fieldTwo = json.fieldTwo ?? json.field_two;
    if (_fieldTwo) {
      msg.fieldTwo = Object.fromEntries(
        Object.entries(_fieldTwo)
          .map(([key, value]) => ({ key: key as any, value: value as any }))
          .map(Bar.FieldTwo._readMessageJSON)
          .map(({ key, value }) => [key, value])
      );
    }
    const _fieldThree = json.fieldThree ?? json.field_three;
    if (_fieldThree) {
      msg.fieldThree = _fieldThree;
    }
    return msg;
  },

  FieldTwo: {
    /**
     * @private
     */
    _writeMessage: function (
      msg: Partial<Bar.FieldTwo>,
      writer: BinaryWriter
    ): BinaryWriter {
      if (msg.key) {
        writer.writeString(1, msg.key);
      }
      if (msg.value) {
        writer.writeInt64String(2, msg.value.toString() as any);
      }
      return writer;
    },

    /**
     * @private
     */
    _writeMessageJSON: function (
      msg: Partial<Bar.FieldTwo>
    ): Record<string, unknown> {
      const json: Record<string, unknown> = {};
      if (msg.key) {
        json.key = msg.key;
      }
      if (msg.value) {
        json.value = msg.value.toString();
      }
      return json;
    },

    /**
     * @private
     */
    _readMessage: function (
      msg: Bar.FieldTwo,
      reader: BinaryReader
    ): Bar.FieldTwo {
      while (reader.nextField()) {
        const field = reader.getFieldNumber();
        switch (field) {
          case 1: {
            msg.key = reader.readString();
            break;
          }
          case 2: {
            msg.value = BigInt(reader.readInt64String());
            break;
          }
          default: {
            reader.skipField();
            break;
          }
        }
      }
      return msg;
    },

    /**
     * @private
     */
    _readMessageJSON: function (msg: Bar.FieldTwo, json: any): Bar.FieldTwo {
      const _key = json.key;
      if (_key) {
        msg.key = _key;
      }
      const _value = json.value;
      if (_value) {
        msg.value = BigInt(_value);
      }
      return msg;
    },
  },
};
