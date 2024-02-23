# TwirpScript

<blockquote> A protobuf RPC framework for JavaScript and TypeScript</blockquote>

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
<a href="https://codecov.io/gh/tatethurston/twirpscript">
  <img src="https://img.shields.io/codecov/c/github/tatethurston/twirpscript/main.svg?style=flat-square">
</a>

## What is this? 🧐

TwirpScript is an implementation of [Twirp](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f). TwirpScript autogenerates Javascript or TypeScript clients and servers from [protocol buffers](https://developers.google.com/protocol-buffers/). The generated clients can be used in browser or Node.js runtimes, enabling type safe communication between web applications and a server or server-to-server.
TwirpScript implements the latest [Twirp Wire Protocol (v7)](https://twitchtv.github.io/twirp/docs/spec_v7.html).

| Language       | Clients | Servers |
| -------------- | ------- | ------- |
| **JavaScript** | ✅      | ✅      |
| **Typescript** | ✅      | ✅      |

## Table of Contents

- [Overview](#overview)
- [Highlights 🛠](#highlights-)
- [Installation 📦](#installation-)
- [Getting Started](#getting-started)
- [Requirements ⚠️](#requirements-%EF%B8%8F)
  - [Overview 📖](#overview-)
  - [Configuring your Twirp Runtime](#configuring-your-twirp-runtime)
    - [Client](#client)
    - [Server](#server)
  - [Context](#context)
    - [Client](#client-1)
    - [Server](#server-1)
  - [Middleware / Interceptors](#middleware--interceptors)
    - [Client](#client-2)
    - [Server](#server-2)
  - [Hooks](#hooks)
    - [Client](#client-3)
    - [Server](#server-3)
- [Configuration 🛠](#configuration-)
- [JSON](#JSON)
- [Examples 🚀](#examples-)
- [Working with other tools](#working-with-other-tools)
- [Caveats, Warnings and Issues ⚠️](#caveats-warnings-and-issues-%EF%B8%8F)
- [FAQ](#faq)
- [Contributing 👫](#contributing-)
- [Licensing 📃](#licensing-)

## Overview

Twirp is a simple RPC framework built on [protocol buffers](https://developers.google.com/protocol-buffers/). TwirpScript generates JavaScript or TypeScript clients and servers from `.proto` service specifications. The generated clients can be used in the browser or in Node.js runtimes. This enables type safe communication between the client and server, as well as reduced payload sizes when using `protobuf` as the serialization format.

You define your service in a `.proto` specification file, and TwirpScript will generate client and service handlers for that service. You fill in the business logic that powers the server, and TwirpScript handles the boilerplate.

To learn more about the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Highlights 🛠

1. Isomorphic. TwirpScript's generated serializers/deserializers can be consumed in the browser or Node.js runtimes.

2. Small. TwirpScript's runtime and generated code are built with [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) to minimize bundle sizes. This results in a significantly smaller bundle size than [google-protobuf](https://www.npmjs.com/package/google-protobuf). TwirpScript's runtime is 2KB (1.2 gzipped). The serialization runtime, [ProtoScript](https://github.com/tatethurston/ProtoScript), is 37KB (7.2 gzipped). ProtoScript will be eliminated from bundles when only using the generated JSON clients.

3. In-editor API documentation. Comments in your `.proto` files become [TSDoc](https://github.com/microsoft/tsdoc) comments in the generated code and will show inline documentation in supported editors.

4. Idiomatic JavaScript / TypeScript code. None of the Java idioms that `protoc --js_out` generates such as the `List` suffix naming for repeated fields, `Map` suffix for maps, or the various getter and setter methods. TwirpScript generates and consumes plain JavaScript objects over classes.

## Installation 📦

1. Install the [protocol buffers compiler](https://developers.google.com/protocol-buffers):

   MacOS:
   `brew install protobuf`

   Linux:
   `apt install -y protobuf-compiler`

   Windows:
   `choco install protoc`

   Or install from a [precompiled binary](https://github.com/protocolbuffers/protobuf/releases).

1. Add this package to your project:
   `npm install twirpscript` or `yarn add twirpscript`

## Requirements ⚠️

- Node.js v16 or greater
- TypeScript v4.7 or greater when using TypeScript

## Getting Started

### Overview 📖

1. Define your service in a `.proto` file.
2. Run `npx twirpscript` to generate JavaScript or TypeScript code from your `.proto` file. This will generate JSON and Protobuf clients, a service interface, and service utilities.
3. If you only need a client, you're done! Use the generated client to make requests to your server.
4. Implement the generated service interface.
5. Add your implemented service to your application server's routes.

#### 1. Define your service

Create a `proto` specification file:

`src/protos/haberdasher.proto`

```protobuf
syntax = "proto3";

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

#### 2. Run `npx twirpscript`

This will generate `haberdasher.pb.ts` (or `haberdasher.pb.js` for JavaScript users) in the same directory as as `haberdasher.proto`. Any comments will become [TSDoc](https://github.com/microsoft/tsdoc) comments and will show inline in supported editors.

`npx twirpscript` will compile all`.proto` files in your project.

#### 3. Use the client

Use the generated clients to make `json` or `protobuf` requests to your server:

`src/client.ts`

```ts
import { client } from "twirpscript";
import { MakeHat } from "../protos/haberdasher.pb";

client.baseURL = "http://localhost:8080";

const hat = await MakeHat({ inches: 12 });
console.log(hat);
```

The above client code may be used in browser or node.js runtimes. See a [Node.js client example](https://github.com/tatethurston/TwirpScript/blob/main/twirp-clientcompat/src/client-harness.ts#L11-L12).

If you have an existing Twirp server you're connecting to and only need a client, that's it! You're done. If you're implementing a service as well, keep reading.

#### 4. Implement the generated service interface

`src/server/haberdasher/index.ts`

```ts
import { Haberdasher, createHaberdasher } from "../../protos/haberdasher.pb";

const haberdasher: Haberdasher = {
  MakeHat: (size) => {
    return {
      inches: size.inches,
      color: "red",
      name: "fedora",
    };
  },
};

export const haberdasherHandler = createHaberdasher(haberdasher);
```

#### 5. Connect your service to your application server

`src/server/index.ts`

```ts
import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { haberdasherHandler } from "./haberdasher";

const PORT = 8080;

const app = createTwirpServer([haberdasherHandler]);

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`),
);
```

If you're deploying to a serverless environment such as AWS Lambda, replace `createTwirpServer` above with `createTwirpServerless`. See the [aws lambda example](https://github.com/tatethurston/twirpscript/blob/main/examples/aws-lambda) for a full project!

### Configuring your Twirp Runtime

#### Client

Clients can be configured globally, at the RPC callsite, or with [middleware](https://github.com/tatethurston/TwirpScript/blob/main/README.md#client). The order of precedence is _middleware_ > _call site configuration_ > _global configuration_. Middleware overrides call site configuration, and call site configuration overrides global configuration.

##### Configuration Options

| Name         | Description                                                                                                                                                                                                    | Type                   | Example                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------- |
| baseURL      | The base URL for the RPC. The service path will be appended to this string.                                                                                                                                    | string                 | "https://my.server.com/"     |
| headers      | HTTP headers to include in the RPC.                                                                                                                                                                            | Record<string, string> | { "idempotency-key": "foo" } |
| prefix       | A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "".                                                                                                                         | string                 | "/my/custom/prefix"          |
| rpcTransport | The transport to use for the RPC. Defaults to `fetch`, but will use `nodeHttpTransport` in Node.js environments. Overrides must conform to a subset of the fetch interface defined by the `RpcTransport` type. | `RpcTransport`         | `fetch`                      |

##### Example

`src/client.ts`

```ts
import { MakeHat } from "./protos/haberdasher.pb";

const hat = await MakeHat({ inches: 12 }, { baseURL: "http://localhost:8080" });
console.log(hat);
```

`baseURL` can be _globally configured_, instead of providing it for every RPC call site:

```ts
import { client } from "twirpscript";

// http://localhost:8080 is now the default `baseURL` for _all_ TwirpScript RPCs
client.baseURL = "http://localhost:8080";

const hat = await MakeHat({ inches: 12 }); // We can omit `baseURL` because it has already been set
console.log(hat);
```

You can override a globally configured `baseURL` at the RPC call site:

```ts
import { client } from "twirpscript";
client.baseURL = "http://localhost:8080";

// This RPC will make a request to https://api.example.com instead of http://localhost:8080
const hat = await MakeHat(
  { inches: 12 },
  { baseURL: "https://api.example.com" },
);
console.log(hat);

// This RPC will make a request to http://localhost:8080
const otherHat = await MakeHat({ inches: 12 });
console.log(otherHat);
```

In addition to `baseUrl`, `headers` can also be set at via _global configuration_ or _call site configuration_. `headers` defines key value pairs that become HTTP headers for the RPC:

```ts
import { client } from "twirpscript";

client.baseURL = "http://localhost:8080";

// setting a (non standard) HTTP "device-id" header via global configuration. This header will be sent for every RPC.
client.headers = { "device-id": getOrGenerateDeviceId() };

// setting a (non standard) HTTP "idempotency-key" header for this RPC call. This header will only be sent for this RPC.
const hat = await MakeHat(
  { inches: 12 },
  { headers: { "idempotency-key": "foo" } },
);
console.log(hat);
```

##### rpcTransport

Twirp abstracts many network details from clients. Sometimes you will want more control over the underlying network request. For these cases, TwirpScript exposes `rpcTransport`.

`rpcTransport` can be used to customize the network request made. `rpcTransport` can swap out the default implementation to use an [https agent](https://nodejs.org/api/https.html#https_class_https_agent), or a library like `axios`. The transport only needs to implement the `RpcTransport` interface. It can also be used to "bake" in certain options, for example, setting `fetch`'s [credentials](https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials) option to `include` (which will include cookies in cross origin requests).

`rpcTransport` can be set via _global configuration_ or _call site configuration_:

```ts
import { client } from "twirpscript";

// sets a custom rpcTransport for all RPC calls, globally.
client.rpcTransport = (url, opts) =>
  fetch(url, { ...opts, credentials: "include" });

// sets a custom rpcTransport for this RPC call. This transport will only be used for this RPC.
const hat = await MakeHat(
  { inches: 12 },
  {
    rpcTransport: (url, opts) =>
      fetch(url, { ...opts, credentials: "include" }),
  },
);
```

In Node.js environments, TwirpScript automatically uses Node's `http` or `https` client instead of fetch. You can override this behavior and use `fetch` in Node.js environments by using the global example above.

#### Server

Servers can be configured by passing a configuration object to `createTwirpServer`.

##### Configuration Options

| Name   | Description                                                                                                     | Type    | Example             |
| ------ | --------------------------------------------------------------------------------------------------------------- | ------- | ------------------- |
| prefix | A path prefix such as "/my/custom/prefix". Defaults to "/twirp", but can be set to "".                          | string  | "/my/custom/prefix" |
| debug  | Puts the Twirp server runtime into debug mode when set to true. This enables request logging. Defaults to true. | boolean | false               |

##### Example

```ts
import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { haberdasherHandler } from "./haberdasher";

const PORT = 8080;

// This removes the "/twirp" prefix in the RPC path
const app = createTwirpServer([haberdasherHandler], { prefix: "" });

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`),
);
```

### Context

#### Client

| Name    | Description                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------- |
| url     | The URL for the RPC. This is the full URL for the request: the baseURL + prefix + the service path. |
| headers | HTTP headers to include in the RPC.                                                                 |

#### Server

| Name        | Description                                 |
| ----------- | ------------------------------------------- |
| service     | The requested RPC service.                  |
| method      | The requested RPC service method.           |
| contentType | The requested content-type for the request. |

Your service handlers are invoked with `context` as their second argument. The base fields are documented above, but you may extend this object with arbitrary fields. This means you can use `context` to provide information to your handler that doesn't come from the RPC request itself, such as http headers or server-side API invocations.

Custom fields can be added to the context object via [middleware](#middleware--interceptors).

##### Example

If you setup middleware similiar to the [authentication middleware example](https://github.com/tatethurston/TwirpScript#example-3), you could read the `currentUser` `username` property in your service handler. See the [authentication example](https://github.com/tatethurston/twirpscript/tree/main/examples/authentication) for a full application.

```ts
import { Haberdasher, createHaberdasher } from "../../protos/haberdasher.pb";
import { Context } from "../some-path-to-your-definition";

const haberdasher: Haberdasher<Context> = {
  MakeHat: (size, ctx) => {
    return {
      inches: size.inches,
      color: "red",
      name: `${ctx.currentUser.username}'s fedora`,
    };
  },
};

export const haberdasherHandler = createHaberdasher(haberdasher);
```

### Middleware / Interceptors

TwirpScript's client and server request response lifecycle can be programmed via middleware.

Middleware is called in order of registration, with the Twirp RPC invoked last.

Because each middleware is responsible for invoking the next handler, middleware can do things like short circuit and return a response before the RPC is made, or inspect the returned response, enabling powerful patterns such as caching.

#### Client

Clients can be configured via the `client` export's `use` method. `use` registers middleware to manipulate the client request / response lifecycle. The middleware handler will receive [context](#client-1) and `next` parameters. You can set the headers and url for the RPC via `context`. `next` invokes the next handler in the chain -- either the next registered middleware, or the Twirp RPC.

##### Example

```ts
import { client } from "twirpscript";

client.use((context, next) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    context.headers["authorization"] = `bearer ${auth}`;
  }
  return next(context);
});
```

Client middleware can override both _global configuration_ and _call site configuration_.

```ts
import { client } from "twirpscript";

client.baseURL = "http://localhost:8080";

client.use((context, next) => {
  const url = new URL(context.url);
  url.host = "www.foo.com";

  return next({ ...context, url: url.toString() });
});

// This will make a request to https://www.foo.com instead of http://localhost:8080 or https://api.example.com"
const hat = await MakeHat(
  { inches: 12 },
  { baseURL: "https://api.example.com" },
);
console.log(hat);
```

#### Server

Servers can be configured via your `server`'s `use` method. `use` registers middleware to manipulate the server request / response lifecycle.

The middleware handler will receive `req`, `context` and `next` parameters. `req` is the incoming request. `context` is the [context](#server-1) which will be passed to each middleware handler and finally the Twirp service handler you implemented. You may extend `context` to pass extra parameters to your service handlers that are not available via your service's defined request parameters. This can be used to implement things such as authentication or rate limiting. `next` invokes the next handler in the chain -- either the next registered middleware, or if there is no middleware remaining, the Twirp service handler you implemented.

##### Example

```ts
import { createServer } from "http";
import { createTwirpServer, TwirpError } from "twirpscript";
import { authenticationHandler } from "./authentication";

export interface Context {
  currentUser: { username: string };
}

const services = [authenticationHandler]
const app = createTwirpServer<Context, typeof services>(services);

app.use(async (req, ctx, next) => {
  // exception so unauthenticated users can authenticate
  if (ctx.service.name === authenticationHandler.name) {
    return next();
  }

  // extract token from authorization header
  const token = req.headers["authorization"]?.split("bearer")?.[1]?.trim();

  // a fictional helper function that retrieves a user from a token
  const currentUser = getCurrentUser(token);

  if (!currentUser) {
    return TwirpErrorResponse({
      code: "unauthenticated",
      msg: "Access denied",
    });
  } else {
    ctx.currentUser = currentUser;
    return next();
  }
};

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);
```

See the [authentication example](https://github.com/tatethurston/twirpscript/tree/main/examples/authentication) for a full application.

### Errors

Twirp defines a [list of error codes](https://twitchtv.github.io/twirp/docs/spec_v7.html#error-codes). You can throw an error from your service handler by using `TwirpError`:

```ts
import { TwirpError } from "twirpscript";

if (!currentUser) {
  throw new TwirpError({
    code: "unauthenticated",
    msg: "Access denied",
  });
}
```

Note: You must use `TwirpError`. Any unhandled errors will otherwise be caught and the TwirpScript server will respond with the following JSON response: `{ code: "internal", msg: "server error" }` and set the appropriate headers and status code.

If you want to respond with a Twirp Error from `middleware`, use `TwirpErrorResponse`. This will create a Twirp Error response while still running any remaining `middleware` in the chain. You may explictly define `try / catch` clauses in your middleware, but any unhandled errors will otherwise be caught and the TwirpScript server will respond with the error described above.

### Hooks

TwirpScript clients and servers can be instrumented by listening to events at key moments during the request / response life cycle. These hooks are ideal placements for instrumentation such as metrics reporting and logging. Event handlers for both clients and servers are passed a `context` object as the first argument. As a best practice, this `context` object should be treated as readonly / immutable.

While hooks and [middleware](https://github.com/tatethurston/TwirpScript/blob/main/README.md#middleware--interceptors) can be used to accomplish similar goals, as a best practice use _hooks_ for instrumentation and _middleware_ for mutation.

#### Client

Every client event handler is invoked with the request [context](#client-1).

##### Events

`requestPrepared` is called as soon as a request has been created and before
it has been sent to the Twirp server.

`responseReceived` is called after a request has finished sending.

`error` is called when an error occurs during the sending or receiving of a
request. In addition to the `context`, the error that occurred is passed as the second argument.

##### Example

```ts
import { client } from "twirpscript";

client.on("responseReceived", (context) => {
  // log or report
});
```

#### Server

Every server event handler is invoked with the request [context](#server-1).

##### Events

`requestReceived` is called as soon as a request enters the Twirp
server at the earliest available moment. Called with the current `context` and the request.

`requestRouted` is called when a request has been routed to a
service method. Called with the current `context` and the input to the service method.

`responsePrepared` is called when a request has been handled by a service method. Called with the current `context` and the response generated by the service method.

`responseSent` is called when all bytes of a response (including an error
response) have been written. Called with the current `context` and the response.

`error` is called when an error occurs while handling a request. Called with the current `context` and the error that occurred.

##### Example

```ts
import { createServer } from "http";
import { createTwirpServer } from "twirpscript";
import { habderdasherHandler } from "./haberdasher";

const PORT = 8080;

const app = createTwirpServer([habderdasherHandler]);

app.on("responseSent", (ctx) => {
  // log or report
});

createServer(app).listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`),
);
```

## Configuration 🛠

TwirpScript aims to be zero config, but can be configured via the cli interface, or when using the `npx twirpscript` command, by creating a `proto.config.mjs` (or `.js` or `.cjs`) file in your project root.

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
  <td>root</td>
<td>
  The root directory. `.proto` files will be searched under this directory, and `proto` import paths will be resolved relative to this directory. TwirpScript will recursively search all subdirectories for `.proto` files.
 
  Defaults to the project root.
 
  Example:
 
  If we have the following project structure:
 
  ```
  /src
    A.proto
    B.proto
  ```
 
  Default:
 
  A.proto would `import` B.proto as follows:
 
  ```protobuf
  import "src/B.proto";
  ```
 
  Setting `root` to `src`:

// proto.config.mjs

```js
/** @type {import('twirpscript').Config} */
export default {
  root: "src",
};
```

A.proto would `import` B.proto as follows:

```protobuf
import "B.proto";
```

TypeScript projects will generally want to set this value to match their `rootDir`.

</td>
<td>string (filepath)</td>
</tr>
<tr>
  <td>exclude</td>
<td>
   An array of patterns that should be skipped when searching for `.proto` files.
  
   Example:
  
   If we have the following project structure:
   /src
     /foo
       A.proto
     /bar
       B.proto
  
   Setting `exclude` to `["/bar/"]`:
  
   // proto.config.mjs
   ```js
   /** @type {import('twirpscript').Config} */
   export default {
     exclude: ["/bar/"]
   }
   ```
  
   Will only process A.proto (B.proto) will be excluded from TwirpScript's code generation.
</td>
  <td>string[] (RegExp pattern)</td>
</tr>
<tr>
  <td>dest</td>
<td>
  The destination folder for generated files.
   
  Defaults to colocating generated files with the corresponding `proto` definition.
   
  If we have the following project structure:
 
  ```
  /src
    A.proto
    B.proto
  ```
 
  TwirpScript will generate the following:
 
  ```
  /src
    A.proto
    A.pb.ts
    B.proto
    B.pb.ts
  ```
 
  Setting `dest` to `out` will generate the following:
 
  // proto.config.mjs
  ```js
  /** @type {import('twirpscript').Config} */
  export default {
    dest: "out",
  }
  ```
 
  ```
  /src
    A.proto
    B.proto
  /out
    /src
      A.pb.ts
      B.pb.ts
  ```
  
  Note that the generated directory structure will mirror the `proto` paths exactly as is, only nested under the `dest` directory. If you want to change this, for instance, to omit `src` from the `out` directory above, you can set the `root`.
  
  Setting `root` to `src` (in addition to setting `dest` to `out`) will generate the following:
 
  // proto.config.mjs
  ```js
  /** @type {import('twirpscript').Config} */
  export default {
    root: "src",
    dest: "out",
  }
  ```
  
  ```
  /src
    A.proto
    B.proto
  /out
    A.pb.ts
    B.pb.ts
  ```
</td>
  <td>string (filepath)</td>
</tr>
<tr>
  <td>language</td>
<td>
  Whether to generate JavaScript or TypeScript.
  
  If omitted, TwirpScript will attempt to autodetect the language by looking for a `tsconfig.json` in the project root. If found, TwirpScript will generate TypeScript, otherwise JavaScript.
</td>
  <td>javascript | typescript</td>
</tr>
<tr>
  <td>json</td>
<td>
  JSON serializer options.
   
  `emitFieldsWithDefaultValues` - Fields with default values are omitted by default in proto3 JSON. Setting this to true will serialize fields with their default values.
      
  `useProtoFieldName` - Field names are converted to lowerCamelCase by default in proto3 JSON. Setting this to true will use the proto field name as the JSON key when serializing JSON. Either way, Proto3 JSON parsers are required to accept both the converted lowerCamelCase name and the proto field name.
  
  
  See https://developers.google.com/protocol-buffers/docs/proto3#json for more context.
</td>
  <td>{ emitFieldsWithDefaultValues?: boolean, useProtoFieldName?: boolean }</td>
</tr>
<tr>
  <td>typecript</td>
<td>
  TypeScript options.
  
  `emitDeclarationOnly` - Only emit TypeScript type definitions.
</td>
  <td>{ emitDeclarationOnly?: boolean }</td>
</tr>
</tbody>
</table>

## JSON

TwirpScript's JSON serialization/deserialization is migrating to the [proto3 specification](https://developers.google.com/protocol-buffers/docs/proto3#json). This is nearly complete, but still in progress.

TwirpScript will serialize JSON keys as `lowerCamelCase` versions of the proto field. Per the proto3 spec, the runtime will accept both `lowerCamelCase` and the original proto field name when deserializing. You can provide the `json_name` field option to specify an alternate key name. When doing so, the runtime will encode JSON messages using the the `json_name` as the key, and will decode JSON messages using the `json_name` if present, otherwise falling back to the `lowerCamelCase` name and finally to the original proto field name.

### Example

```protobuf
syntax = "proto3";

message Hat {
  // this key will serialize as 'userID' instead of 'userId'
  int64 user_id = 1; [json_name="userID"];
  int64 wardrobe_id = 2;
}
```

The above `Hat` message would serialize to the following JSON:

```json
{ "userID": "some 64bit number", "wardrobeId": "some 64bit number" }
```

## Examples 🚀

The documentation is a work in progress. Checkout the examples in the examples directory:

- The [JavaScript fullstack](https://github.com/tatethurston/twirpscript/blob/main/examples/typescript-fullstack) shows a minimal browser client and server implementation in JavaScript.
- The [TypeScript fullstack](https://github.com/tatethurston/twirpscript/blob/main/examples/javascript-fullstack) shows a minimal browser client and server implementation in TypeScript.
- The [authentication example](https://github.com/tatethurston/twirpscript/blob/main/examples/authentication) extends the fullstack example to demonstrate authentication using tokens.
- The [aws lambda example](https://github.com/tatethurston/twirpscript/blob/main/examples/aws-lambda) shows TwirpScript running on AWS Lambda, complete with the necessary CDK to deploy a full stack (API Gateway + Lambda).
- The [Next.js example](https://github.com/tatethurston/twirpscript/blob/main/examples/nextjs) shows using TwirpScript in Next.js.

The examples also demonstrate testing using [jest](https://jestjs.io/).

## Working with other tools

### TypeScript

As a design goal, TwirpScript should always work with the strictest TypeScript compiler settings. If your generated TwirpScript files are failing type checking, please open an issue.

TwirpScript could opt generated files out from type checking, but it leverages the TypeScript compiler to flag version mismatches between the TwirpScript runtime and generated code.

### Linters

TwirpScript does not make any guarantees for tools like linters and formatters such as [prettier](https://prettier.io/) or [eslint](https://eslint.org/). It generally does not make sense to run these tools against code generation artifacts, like the `.pb.ts` or `.pb.js` files generated by TwirpScript. This is because:

1. The permutations of preferences and plugins for these tools quickly explode beyond what is feasible for a single tool to target. There are always new tools that could be added as well.
2. The code is generated automatically, and not all rules are autofixable. This means there are cases that would always require manual intervention by the user.
3. Autogenerated code is readonly, and expected to be correct. Autogenerated code has a much difference maintenance cycle than code written by hand, and should generally be treated as a binary or a dependency. You don't lint your node_modules!

Here are some example snipits to opt TwirpScript generated code out of these tools:

`.eslintrc.js`

```js
module.exports = {
  ignorePatterns: ["*.pb.[t|j]s"],
};
```

### Buf

TwirpScript can be used with [Buf](https://docs.buf.build/introduction). This will bypass TwirpScript's cli runner, so all options must be passed to `buf` via it's configuration yaml. `proto.config.mjs` is bypassed, as is automatic `typescript` inference.

`buf.gen.yaml`

```
version: v1
plugins:
  - name: protoc-gen-twirpscript
    path: ./node_modules/twirpscript/dist/compiler.js
    out: .
    opt:
      - language=typescript
    strategy: all
```

See the [buf example](https://github.com/tatethurston/twirpscript/blob/main/examples/buf) for a full example.

## Caveats, Warnings and Issues ⚠️

### Protobuf2

This library supports Protobuf3. Protobuf2 should generally work, with the notable exception of [Groups](https://developers.google.com/protocol-buffers/docs/proto#groups) which are deprecated and will not be implemented.

At this time, there are no plans to support Proto2 directly. I'd like any community that grows around TwirpScript to not be concerned with alternate patterns to support `proto2`. TwirpScript's release came quite some time after the release of `proto3`,and I'm not aware of any compelling reasons to use `proto2` over `proto3` for new applications. The protobuf compiler supports references between `proto2` and `proto3` files, so existing applications can port messages incrementally to `proto3` that want to leverage TwirpScript.

If there is sufficient demand for `proto2` support, I will reconsider this stance. Please open an issue and add the `Protobuf 2` label if you have a `proto2` support request.

## FAQ

> Why use Twirp instead of GraphQL, gRPC or REST?

For multiple clients with distinct views, I would pull in GraphQL. For a single UI client I prefer the simpler architecture (and well defined optimization paths) found with a more traditional API server approach.

A REST or JSON API lacks type safety and the developer experience that comes from static typing. This can be mitigated to an extent with tools like JSON Schema, but that route requires stitching together (and maintaining) a suite of tools to achieve a similar developer experience.

gRPC is great, but has a large runtime (and corresponding complexity) that is unnecessary for some applications. Twirp offers many of the benefits of gRPC with a significantly reduced runtime. TwirpScript's developer experience is designed to be idiomatic for the JS/TS community, and TwirpScript's autogenerated clients are optimized for use in the browser.

To learn more about the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/twirpscript/blob/main/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/twirpscript/blob/main/LICENSE).
