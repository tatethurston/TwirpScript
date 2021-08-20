# TwirpScript

<blockquote>Autogenerate Twirp Clients and Servers in TypeScript</blockquote>

<br />

<a href="https://www.npmjs.com/package/twirpscript">
  <img src="https://img.shields.io/npm/v/twirpscript.svg">
</a>
<a href="https://github.com/tatethurston/twirpscript/blob/master/LICENSE">
  <img src="https://img.shields.io/npm/l/twirpscript.svg">
</a>
<a href="https://www.npmjs.com/package/twirpscript">
  <img src="https://img.shields.io/npm/dy/twirpscript.svg">
</a>
<a href="https://github.com/tatethurston/twirpscript/actions/workflows/ci.yml">
  <img src="https://github.com/tatethurston/twirpscript/actions/workflows/ci.yml/badge.svg">
</a>

## What is this? 🧐

TwirpScript is an implementation of the [Twirp wire protocol](https://github.com/twitchtv/twirp/blob/main/PROTOCOL.md) for TypeScript. It generates idiomatic TypeScript clients and servers from `.proto` service specifications. The generated clients can be used in the browser. This enables type safe communication between the client and server for web applications, as well as reduced payload sizes when using `protobuf` as the serialization format.

Twirp is a simple RPC framework built on [protocol buffers](https://developers.google.com/protocol-buffers/). You define a service in a `.proto` specification file, and Twirp will generate servers and clients for that service. You fill in the business logic that powers the server, and Twirp handles the boilerplate. In addition to abstracting away boilerplate, this provides type safe interactions between the client and the server.

To learn more about the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Installation 📦

1. Install the [protocol buffers compiler](https://developers.google.com/protocol-buffers):
   - `brew install protobuf`
1. Add this package to your project:
   - `yarn add twirpscript`

## Getting Started

### Overview 📖

To make a Twirp service:

1. Define your service in a `.proto` file.
2. Run `yarn twirpscript` to generate TypeScript code from your `.proto` file. This will generate a service interface, client, and server utilities.
3. Implement the generated service interface to build your service.
4. Attach your implemented service to your application server.

#### 1. Define your service

Create a `proto` specification file:

`src/server/haberdasher/service.proto`

```protobuf
syntax = "proto3";

package twirp.example.haberdasher;
option go_package = "github.com/example/rpc/haberdasher";

// Haberdasher service makes hats for clients.
service Haberdasher {
  // MakeHat produces a hat of mysterious, randomly-selected color!
  rpc MakeHat(Size) returns (Hat);
}

// Size of a Hat, in inches.
message Size {
  int32 inches = 1; // must be > 0
}

// A Hat is a piece of headwear made by a Haberdasher.
message Hat {
  int32 inches = 1;
  string color = 2; // anything but "invisible"
  string name = 3; // i.e. "bowler"
}
```

#### 2. Run `yarn twirpscript`

This will generate `service.pb.ts` in the same directory as as `service.proto`.

#### 3. Implement the generated service interface to build your service.

`src/haberdasher/index.ts`

```ts
import { Haberdasher, HaberdasherHandler } from "./service.pb";

export const HaberdasherService: Haberdasher = {
  MakeHat: (size) => {
    return {
      inches: size.inches,
      color: "red",
      name: "fedora",
    };
  },
};

export const HaberdasherServiceHandler = HaberdasherHandler(HaberdasherService);
```

#### 4. Attach your implemented service to your application server.

`src/server/index.ts`

```ts
import { createServer } from "http";
import { createServerHandler } from "twirpscript";
import { HaberdasherServiceHandler } from "./haberdasher";

const PORT = 8080;

const twirpHandler = createServerHandler([HaberdasherServiceHandler]);
const server = createServer(twirpHandler);

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
```

#### 5. Client

That's it for the server! Now you can use the generated clients to make `json` or `protobuf` requests to your server:

`src/client.ts`

```

import { MakeHat } from "./server/haberdasher/service.pb";

const size = { inches: 12 };
const hat = await MakeHat("http://localhost:8080", size);
console.log(hat);
```

## Examples 🚀

Checkout out a [minimal example](https://github.com/tatethurston/twirpscript/blob/main/examples/basic) of a browser client and server implementation.

## FAQ

> What about middleware? Does this work with Express?

Yes, the server implementation can be plugged into any [connect framework](https://www.npmjs.com/package/connect). See the [connect example](https://github.com/tatethurston/twirpscript/blob/main/examples/connect) for an example implementation.

## Compatibility 🛠

The default clients use `fetch` so your runtime must include `fetch`.

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/twirpscript/blob/main/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/twirpscript/blob/main/LICENSE).
