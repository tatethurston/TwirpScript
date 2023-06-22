// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/protos/hat.proto
/* eslint-disable */

import type { ByteSource, PartialDeep } from "protoscript";
import { BinaryReader, BinaryWriter } from "protoscript";

//========================================//
//                 Types                  //
//========================================//

/**
 * Size of a Hat, in inches.
 */
export interface Size {
  /**
   * must be > 0
   */
  inches: number;
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const Size = {
  /**
   * Serializes Size to protobuf.
   */
  encode: function (msg: PartialDeep<Size>): Uint8Array {
    return Size._writeMessage(msg, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes Size from protobuf.
   */
  decode: function (bytes: ByteSource): Size {
    return Size._readMessage(Size.initialize(), new BinaryReader(bytes));
  },

  /**
   * Initializes Size with all fields set to their default value.
   */
  initialize: function (): Size {
    return {
      inches: 0,
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: PartialDeep<Size>,
    writer: BinaryWriter,
  ): BinaryWriter {
    if (msg.inches) {
      writer.writeInt32(1, msg.inches);
    }
    return writer;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Size, reader: BinaryReader): Size {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.inches = reader.readInt32();
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
};

//========================================//
//          JSON Encode / Decode          //
//========================================//

export const SizeJSON = {
  /**
   * Serializes Size to JSON.
   */
  encode: function (msg: PartialDeep<Size>): string {
    return JSON.stringify(SizeJSON._writeMessage(msg));
  },

  /**
   * Deserializes Size from JSON.
   */
  decode: function (json: string): Size {
    return SizeJSON._readMessage(SizeJSON.initialize(), JSON.parse(json));
  },

  /**
   * Initializes Size with all fields set to their default value.
   */
  initialize: function (): Size {
    return {
      inches: 0,
    };
  },

  /**
   * @private
   */
  _writeMessage: function (msg: PartialDeep<Size>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.inches) {
      json["inches"] = msg.inches;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Size, json: any): Size {
    const _inches_ = json["inches"];
    if (_inches_) {
      msg.inches = _inches_;
    }
    return msg;
  },
};
