// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
// Source: 10/multi-service.proto
import type {
  ByteSource,
  ClientConfiguration,
  ServiceHandler,
} from "twirpscript";
import {
  BinaryReader,
  BinaryWriter,
  JSONrequest,
  PBrequest,
  createMethodHandler,
} from "twirpscript";

//========================================//
//      CheckService Protobuf Client      //
//========================================//

export async function Info(
  infoRequest: InfoRequest,
  config?: ClientConfiguration
): Promise<InfoResponse> {
  const response = await PBrequest(
    "/api.v1.CheckService/Info",
    InfoRequest.encode(infoRequest),
    config
  );
  return InfoResponse.decode(response);
}

export async function DoStuff(
  doStuffRequest: DoStuffRequest,
  config?: ClientConfiguration
): Promise<DoStuffResponse> {
  const response = await PBrequest(
    "/api.v1.CheckService/DoStuff",
    DoStuffRequest.encode(doStuffRequest),
    config
  );
  return DoStuffResponse.decode(response);
}

//========================================//
//  VerificationService Protobuf Client   //
//========================================//

export async function Verify(
  verifyRequest: VerifyRequest,
  config?: ClientConfiguration
): Promise<VerifyResponse> {
  const response = await PBrequest(
    "/api.v1.VerificationService/Verify",
    VerifyRequest.encode(verifyRequest),
    config
  );
  return VerifyResponse.decode(response);
}

//========================================//
//        CheckService JSON Client        //
//========================================//

export async function InfoJSON(
  infoRequest: InfoRequest,
  config?: ClientConfiguration
): Promise<InfoResponse> {
  const response = await JSONrequest<InfoResponse>(
    "/api.v1.CheckService/Info",
    infoRequest,
    config
  );
  return response;
}

export async function DoStuffJSON(
  doStuffRequest: DoStuffRequest,
  config?: ClientConfiguration
): Promise<DoStuffResponse> {
  const response = await JSONrequest<DoStuffResponse>(
    "/api.v1.CheckService/DoStuff",
    doStuffRequest,
    config
  );
  return response;
}

//========================================//
//    VerificationService JSON Client     //
//========================================//

export async function VerifyJSON(
  verifyRequest: VerifyRequest,
  config?: ClientConfiguration
): Promise<VerifyResponse> {
  const response = await JSONrequest<VerifyResponse>(
    "/api.v1.VerificationService/Verify",
    verifyRequest,
    config
  );
  return response;
}

//========================================//
//          CheckService Service          //
//========================================//

export interface CheckServiceService<Context = unknown> {
  Info: (
    infoRequest: InfoRequest,
    context: Context
  ) => Promise<InfoResponse> | InfoResponse;
  DoStuff: (
    doStuffRequest: DoStuffRequest,
    context: Context
  ) => Promise<DoStuffResponse> | DoStuffResponse;
}

export function createCheckServiceHandler<Context>(
  service: CheckServiceService<Context>
): ServiceHandler<Context> {
  return {
    path: "api.v1.CheckService",
    methods: {
      Info: createMethodHandler({
        handler: service.Info,
        encode: InfoResponse.encode,
        decode: InfoRequest.decode,
      }),
      DoStuff: createMethodHandler({
        handler: service.DoStuff,
        encode: DoStuffResponse.encode,
        decode: DoStuffRequest.decode,
      }),
    },
  };
}

//========================================//
//      VerificationService Service       //
//========================================//

export interface VerificationServiceService<Context = unknown> {
  Verify: (
    verifyRequest: VerifyRequest,
    context: Context
  ) => Promise<VerifyResponse> | VerifyResponse;
}

export function createVerificationServiceHandler<Context>(
  service: VerificationServiceService<Context>
): ServiceHandler<Context> {
  return {
    path: "api.v1.VerificationService",
    methods: {
      Verify: createMethodHandler({
        handler: service.Verify,
        encode: VerifyResponse.encode,
        decode: VerifyRequest.decode,
      }),
    },
  };
}

//========================================//
//                 Types                  //
//========================================//

export interface InfoRequest {}

export interface DoStuffRequest {}

export interface InfoResponse {
  hostname: string;
}

export interface DoStuffResponse {
  data: string;
}

export interface VerifyRequest {
  token: string;
  nonce: string;
}

export interface VerifyResponse {
  status: boolean;
  sign: string;
}

//========================================//
//        Protobuf Encode / Decode        //
//========================================//

export const InfoRequest = {
  writeMessage: function (msg: InfoRequest, writer: BinaryWriter): void {},

  encode: function (infoRequest: InfoRequest): Uint8Array {
    const writer = new BinaryWriter();
    InfoRequest.writeMessage(infoRequest, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<InfoRequest>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        default: {
          reader.skipField();
          break;
        }
      }
    }
  },

  decode: function (bytes: ByteSource): InfoRequest {
    const reader = new BinaryReader(bytes);
    const message = {};
    InfoRequest.readMessage(message, reader);
    return message as InfoRequest;
  },

  defaultValue: function (): InfoRequest {
    return {};
  },
};

export const DoStuffRequest = {
  writeMessage: function (msg: DoStuffRequest, writer: BinaryWriter): void {},

  encode: function (doStuffRequest: DoStuffRequest): Uint8Array {
    const writer = new BinaryWriter();
    DoStuffRequest.writeMessage(doStuffRequest, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<DoStuffRequest>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        default: {
          reader.skipField();
          break;
        }
      }
    }
  },

  decode: function (bytes: ByteSource): DoStuffRequest {
    const reader = new BinaryReader(bytes);
    const message = {};
    DoStuffRequest.readMessage(message, reader);
    return message as DoStuffRequest;
  },

  defaultValue: function (): DoStuffRequest {
    return {};
  },
};

export const InfoResponse = {
  writeMessage: function (msg: InfoResponse, writer: BinaryWriter): void {
    if (msg.hostname) {
      writer.writeString(1, msg.hostname);
    }
  },

  encode: function (infoResponse: InfoResponse): Uint8Array {
    const writer = new BinaryWriter();
    InfoResponse.writeMessage(infoResponse, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<InfoResponse>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.hostname = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    if (!msg.hostname) {
      msg.hostname = "";
    }
  },

  decode: function (bytes: ByteSource): InfoResponse {
    const reader = new BinaryReader(bytes);
    const message = {};
    InfoResponse.readMessage(message, reader);
    return message as InfoResponse;
  },

  defaultValue: function (): InfoResponse {
    return {
      hostname: "",
    };
  },
};

export const DoStuffResponse = {
  writeMessage: function (msg: DoStuffResponse, writer: BinaryWriter): void {
    if (msg.data) {
      writer.writeString(1, msg.data);
    }
  },

  encode: function (doStuffResponse: DoStuffResponse): Uint8Array {
    const writer = new BinaryWriter();
    DoStuffResponse.writeMessage(doStuffResponse, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<DoStuffResponse>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.data = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    if (!msg.data) {
      msg.data = "";
    }
  },

  decode: function (bytes: ByteSource): DoStuffResponse {
    const reader = new BinaryReader(bytes);
    const message = {};
    DoStuffResponse.readMessage(message, reader);
    return message as DoStuffResponse;
  },

  defaultValue: function (): DoStuffResponse {
    return {
      data: "",
    };
  },
};

export const VerifyRequest = {
  writeMessage: function (msg: VerifyRequest, writer: BinaryWriter): void {
    if (msg.token) {
      writer.writeString(1, msg.token);
    }
    if (msg.nonce) {
      writer.writeInt64String(2, msg.nonce);
    }
  },

  encode: function (verifyRequest: VerifyRequest): Uint8Array {
    const writer = new BinaryWriter();
    VerifyRequest.writeMessage(verifyRequest, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<VerifyRequest>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.token = reader.readString();
          break;
        }
        case 2: {
          msg.nonce = reader.readInt64String();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    if (!msg.token) {
      msg.token = "";
    }
    if (!msg.nonce) {
      msg.nonce = "";
    }
  },

  decode: function (bytes: ByteSource): VerifyRequest {
    const reader = new BinaryReader(bytes);
    const message = {};
    VerifyRequest.readMessage(message, reader);
    return message as VerifyRequest;
  },

  defaultValue: function (): VerifyRequest {
    return {
      token: "",
      nonce: "",
    };
  },
};

export const VerifyResponse = {
  writeMessage: function (msg: VerifyResponse, writer: BinaryWriter): void {
    if (msg.status) {
      writer.writeBool(1, msg.status);
    }
    if (msg.sign) {
      writer.writeString(2, msg.sign);
    }
  },

  encode: function (verifyResponse: VerifyResponse): Uint8Array {
    const writer = new BinaryWriter();
    VerifyResponse.writeMessage(verifyResponse, writer);
    return writer.getResultBuffer();
  },

  readMessage: function (
    msg: Partial<VerifyResponse>,
    reader: BinaryReader
  ): void {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      const field = reader.getFieldNumber();
      switch (field) {
        case 1: {
          msg.status = reader.readBool();
          break;
        }
        case 2: {
          msg.sign = reader.readString();
          break;
        }
        default: {
          reader.skipField();
          break;
        }
      }
    }
    if (!msg.status) {
      msg.status = false;
    }
    if (!msg.sign) {
      msg.sign = "";
    }
  },

  decode: function (bytes: ByteSource): VerifyResponse {
    const reader = new BinaryReader(bytes);
    const message = {};
    VerifyResponse.readMessage(message, reader);
    return message as VerifyResponse;
  },

  defaultValue: function (): VerifyResponse {
    return {
      status: false,
      sign: "",
    };
  },
};