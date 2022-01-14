// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: src/clientcompat.proto

import type { ByteSource, ClientConfiguration } from "twirpscript";
import {
  BinaryReader,
  BinaryWriter,
  JSONrequest,
  PBrequest,
  // This is the minimum version supported by the current runtime.
  // If this line fails typechecking, breaking changes have been introduced and this
  // file needs to be regenerated by running `yarn twirpscript`.
  MIN_SUPPORTED_VERSION_0_0_34,
} from "twirpscript";

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
//         CompatService Service          //
//========================================//

export interface CompatServiceService<Context = unknown> {
  Method: (req: Req, context: Context) => Promise<Resp> | Resp;
  NoopMethod: (empty: Empty, context: Context) => Promise<Empty> | Empty;
}

export function createCompatServiceHandler<Context>(
  service: CompatServiceService<Context>
) {
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
  service_address: string;
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
  writeMessage: function (msg: Partial<Empty>, writer: BinaryWriter): void {},

  encode: function (empty: Partial<Empty>): Uint8Array {
    const writer = new BinaryWriter();
    Empty.writeMessage(empty, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (msg: Partial<Empty>, reader: BinaryReader): void {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        default: {
          reader.skipField();
          break;
        }
      }
    }
  },

  decode: function (bytes: ByteSource): Empty {
    const reader = new BinaryReader(bytes);
    const message = {};
    Empty.readMessage(message, reader);
    return message as Empty;
  },

  defaultValue: function (): Empty {
    return {};
  },
};

export const Req = {
  writeMessage: function (msg: Partial<Req>, writer: BinaryWriter): void {
    if (msg.v) {
      writer.writeString(1, msg.v);
    }
  },

  encode: function (req: Partial<Req>): Uint8Array {
    const writer = new BinaryWriter();
    Req.writeMessage(req, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (msg: Partial<Req>, reader: BinaryReader): void {
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
    if (!msg.v) {
      msg.v = "";
    }
  },

  decode: function (bytes: ByteSource): Req {
    const reader = new BinaryReader(bytes);
    const message = {};
    Req.readMessage(message, reader);
    return message as Req;
  },

  defaultValue: function (): Req {
    return {
      v: "",
    };
  },
};

export const Resp = {
  writeMessage: function (msg: Partial<Resp>, writer: BinaryWriter): void {
    if (msg.v) {
      writer.writeInt32(1, msg.v);
    }
  },

  encode: function (resp: Partial<Resp>): Uint8Array {
    const writer = new BinaryWriter();
    Resp.writeMessage(resp, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (msg: Partial<Resp>, reader: BinaryReader): void {
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
    if (!msg.v) {
      msg.v = 0;
    }
  },

  decode: function (bytes: ByteSource): Resp {
    const reader = new BinaryReader(bytes);
    const message = {};
    Resp.readMessage(message, reader);
    return message as Resp;
  },

  defaultValue: function (): Resp {
    return {
      v: 0,
    };
  },
};

export const ClientCompatMessage = {
  writeMessage: function (
    msg: Partial<ClientCompatMessage>,
    writer: BinaryWriter
  ): void {
    if (msg.service_address) {
      writer.writeString(1, msg.service_address);
    }
    if (msg.method) {
      writer.writeEnum(2, msg.method);
    }
    if (msg.request) {
      writer.writeBytes(3, msg.request);
    }
  },

  encode: function (
    clientCompatMessage: Partial<ClientCompatMessage>
  ): Uint8Array {
    const writer = new BinaryWriter();
    ClientCompatMessage.writeMessage(clientCompatMessage, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<ClientCompatMessage>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.service_address = reader.readString();
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
    if (!msg.service_address) {
      msg.service_address = "";
    }
    if (!msg.method) {
      msg.method = 0;
    }
    if (!msg.request) {
      msg.request = new Uint8Array();
    }
  },

  decode: function (bytes: ByteSource): ClientCompatMessage {
    const reader = new BinaryReader(bytes);
    const message = {};
    ClientCompatMessage.readMessage(message, reader);
    return message as ClientCompatMessage;
  },

  defaultValue: function (): ClientCompatMessage {
    return {
      service_address: "",
      method: 0,
      request: new Uint8Array(),
    };
  },

  CompatServiceMethod: { NOOP: 0, METHOD: 1 } as const,
};
