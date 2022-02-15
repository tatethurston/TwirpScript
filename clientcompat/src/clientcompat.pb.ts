// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/clientcompat.proto

import type { ByteSource, ClientConfiguration } from "twirpscript";
import {
  BinaryReader,
  BinaryWriter,
  JSONrequest,
  PBrequest,
} from "twirpscript";
// This is the minimum version supported by the current runtime.
// If this line fails typechecking, breaking changes have been introduced and this
// file needs to be regenerated by running `yarn twirpscript`.
export { MIN_SUPPORTED_VERSION_0_0_44 } from "twirpscript";

//========================================//
//     CompatService Protobuf Client      //
//========================================//

export async function Method(
  req: Req,
  config?: ClientConfiguration
): Promise<Resp> {
  const response = await PBrequest(
    "/twirp.clientcompat.CompatService/Method",
    Req.encode(req),
    config
  );
  return Resp.decode(response);
}

export async function NoopMethod(
  empty: Empty,
  config?: ClientConfiguration
): Promise<Empty> {
  const response = await PBrequest(
    "/twirp.clientcompat.CompatService/NoopMethod",
    Empty.encode(empty),
    config
  );
  return Empty.decode(response);
}

//========================================//
//       CompatService JSON Client        //
//========================================//

export async function MethodJSON(
  req: Req,
  config?: ClientConfiguration
): Promise<Resp> {
  const response = await JSONrequest<Resp>(
    "/twirp.clientcompat.CompatService/Method",
    req,
    config
  );
  return response;
}

export async function NoopMethodJSON(
  empty: Empty,
  config?: ClientConfiguration
): Promise<Empty> {
  const response = await JSONrequest<Empty>(
    "/twirp.clientcompat.CompatService/NoopMethod",
    empty,
    config
  );
  return response;
}

//========================================//
//             CompatService              //
//========================================//

export interface CompatService<Context = unknown> {
  Method: (req: Req, context: Context) => Promise<Resp> | Resp;
  NoopMethod: (empty: Empty, context: Context) => Promise<Empty> | Empty;
}

export function createCompatService<Context>(service: CompatService<Context>) {
  return {
    name: "twirp.clientcompat.CompatService",
    methods: {
      Method: {
        name: "Method",
        handler: service.Method,
        input: Req,
        output: Resp,
      },
      NoopMethod: {
        name: "NoopMethod",
        handler: service.NoopMethod,
        input: Empty,
        output: Empty,
      },
    },
  } as const;
}

//========================================//
//                 Types                  //
//========================================//

export interface Empty {}

export interface Req {
  v: string;
}

export interface Resp {
  v: number;
}

export interface ClientCompatMessage {
  serviceAddress: string;
  method: ClientCompatMessage.CompatServiceMethod;
  request: Uint8Array;
}

export namespace ClientCompatMessage {
  export type CompatServiceMethod =
    typeof ClientCompatMessage.CompatServiceMethod[keyof typeof ClientCompatMessage.CompatServiceMethod];
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const Empty = {
  /**
   * Serializes a Empty to protobuf.
   */

  encode: function (_empty?: Partial<Empty>): Uint8Array {
    return new Uint8Array();
  },

  /**
   * Deserializes a Empty from protobuf.
   */

  decode: function (_bytes?: ByteSource): Empty {
    return {};
  },

  /**
   * Serializes a Empty to JSON.
   */

  encodeJSON: function (_empty?: Partial<Empty>): string {
    return "{}";
  },

  /**
   * Deserializes a Empty from JSON.
   */

  decodeJSON: function (_json?: string): Empty {
    return {};
  },

  /**
   * Initializes a Empty with all fields set to their default value.
   */
  initialize: function (): Empty {
    return {};
  },
};

export const Req = {
  /**
   * Serializes a Req to protobuf.
   */
  encode: function (req: Partial<Req>): Uint8Array {
    return Req._writeMessage(req, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Req from protobuf.
   */
  decode: function (bytes: ByteSource): Req {
    return Req._readMessage(Req.initialize(), new BinaryReader(bytes));
  },

  /**
   * Serializes a Req to JSON.
   */
  encodeJSON: function (req: Partial<Req>): string {
    return JSON.stringify(Req._writeMessageJSON(req));
  },

  /**
   * Deserializes a Req from JSON.
   */
  decodeJSON: function (json: string): Req {
    return Req._readMessageJSON(Req.initialize(), JSON.parse(json));
  },

  /**
   * Initializes a Req with all fields set to their default value.
   */
  initialize: function (): Req {
    return {
      v: "",
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Req>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.v) {
      writer.writeString(1, msg.v);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (msg: Partial<Req>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.v) {
      json.v = msg.v;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Req, reader: BinaryReader): Req {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.v = reader.readString();
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
  _readMessageJSON: function (msg: Req, json: any): Req {
    const v = json.v ?? json.v;
    if (v) {
      msg.v = v;
    }
    return msg;
  },
};

export const Resp = {
  /**
   * Serializes a Resp to protobuf.
   */
  encode: function (resp: Partial<Resp>): Uint8Array {
    return Resp._writeMessage(resp, new BinaryWriter()).getResultBuffer();
  },

  /**
   * Deserializes a Resp from protobuf.
   */
  decode: function (bytes: ByteSource): Resp {
    return Resp._readMessage(Resp.initialize(), new BinaryReader(bytes));
  },

  /**
   * Serializes a Resp to JSON.
   */
  encodeJSON: function (resp: Partial<Resp>): string {
    return JSON.stringify(Resp._writeMessageJSON(resp));
  },

  /**
   * Deserializes a Resp from JSON.
   */
  decodeJSON: function (json: string): Resp {
    return Resp._readMessageJSON(Resp.initialize(), JSON.parse(json));
  },

  /**
   * Initializes a Resp with all fields set to their default value.
   */
  initialize: function (): Resp {
    return {
      v: 0,
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<Resp>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.v) {
      writer.writeInt32(1, msg.v);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (msg: Partial<Resp>): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.v) {
      json.v = msg.v;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (msg: Resp, reader: BinaryReader): Resp {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.v = reader.readInt32();
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
  _readMessageJSON: function (msg: Resp, json: any): Resp {
    const v = json.v ?? json.v;
    if (v) {
      msg.v = v;
    }
    return msg;
  },
};

export const ClientCompatMessage = {
  /**
   * Serializes a ClientCompatMessage to protobuf.
   */
  encode: function (
    clientCompatMessage: Partial<ClientCompatMessage>
  ): Uint8Array {
    return ClientCompatMessage._writeMessage(
      clientCompatMessage,
      new BinaryWriter()
    ).getResultBuffer();
  },

  /**
   * Deserializes a ClientCompatMessage from protobuf.
   */
  decode: function (bytes: ByteSource): ClientCompatMessage {
    return ClientCompatMessage._readMessage(
      ClientCompatMessage.initialize(),
      new BinaryReader(bytes)
    );
  },

  /**
   * Serializes a ClientCompatMessage to JSON.
   */
  encodeJSON: function (
    clientCompatMessage: Partial<ClientCompatMessage>
  ): string {
    return JSON.stringify(
      ClientCompatMessage._writeMessageJSON(clientCompatMessage)
    );
  },

  /**
   * Deserializes a ClientCompatMessage from JSON.
   */
  decodeJSON: function (json: string): ClientCompatMessage {
    return ClientCompatMessage._readMessageJSON(
      ClientCompatMessage.initialize(),
      JSON.parse(json)
    );
  },

  /**
   * Initializes a ClientCompatMessage with all fields set to their default value.
   */
  initialize: function (): ClientCompatMessage {
    return {
      serviceAddress: "",
      method: 0,
      request: new Uint8Array(),
    };
  },

  /**
   * @private
   */
  _writeMessage: function (
    msg: Partial<ClientCompatMessage>,
    writer: BinaryWriter
  ): BinaryWriter {
    if (msg.serviceAddress) {
      writer.writeString(1, msg.serviceAddress);
    }
    if (msg.method) {
      writer.writeEnum(2, msg.method);
    }
    if (msg.request) {
      writer.writeBytes(3, msg.request);
    }
    return writer;
  },

  /**
   * @private
   */
  _writeMessageJSON: function (
    msg: Partial<ClientCompatMessage>
  ): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    if (msg.serviceAddress) {
      json.serviceAddress = msg.serviceAddress;
    }
    if (msg.method) {
      json.method = msg.method;
    }
    if (msg.request) {
      json.request = msg.request;
    }
    return json;
  },

  /**
   * @private
   */
  _readMessage: function (
    msg: ClientCompatMessage,
    reader: BinaryReader
  ): ClientCompatMessage {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.serviceAddress = reader.readString();
          break;
        }
        case 2: {
          msg.method =
            reader.readEnum() as ClientCompatMessage.CompatServiceMethod;
          break;
        }
        case 3: {
          msg.request = reader.readBytes();
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
    msg: ClientCompatMessage,
    json: any
  ): ClientCompatMessage {
    const serviceAddress = json.serviceAddress ?? json.service_address;
    if (serviceAddress) {
      msg.serviceAddress = serviceAddress;
    }
    const method = json.method ?? json.method;
    if (method) {
      msg.method = method;
    }
    const request = json.request ?? json.request;
    if (request) {
      msg.request = request;
    }
    return msg;
  },

  CompatServiceMethod: { NOOP: 0, METHOD: 1 } as const,
};
