<a href="https://github.com/twitchtv/twirp">
  <img alt="Twirp Logo" src="https://github.com/twitchtv/twirp/blob/master/logo.png?raw=true">
</a>

<blockquote>Autogenerate Twirp TypeScript Clients</blockquote>

## What is this? 🧐

A Twirp TypeScript client generator. You define your service in a `.proto` specification file, and `ts-twirp-client` will generate clients for that service.

If you're not familiar with Twirp, check out the [Twirp repo](https://github.com/twitchtv/twirp) and the [documentation site](https://twitchtv.github.io/twirp/docs/intro.html).

For more on the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Example 🚀

coming soon™️

## Installation & Usage 📦

1. Add this package to your project:
   - `yarn add ts-twirp-client`
2. Generate JSON and Protobuf (coming soon™️) clients:
   - `yarn twirp`
3. Create a client instance for your service by invoking the generated JSON or Protobuf client code with your host's URI
4. Use your configured client to make RPCs to your service

## Documentation 📖

coming soon™️

## Gotchas ⚠️

coming soon™️

## Compatibility 🛠

Your project must use [TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) or greater.

The default clients use `fetch` so your runtime must include `fetch` _or_ you need to provide your own transport implementation when constructing your service client.

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/ts-twirp-client/blob/master/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/ts-twirp-client/blob/master/LICENSE).
