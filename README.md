<a href="https://github.com/twitchtv/twirp">
  <img alt="Twirp Logo" src="https://github.com/twitchtv/twirp/blob/master/logo.png?raw=true">
</a>

<blockquote>Autogenerate Twirp TypeScript Clients and Servers</blockquote>

## What is this? 🧐

A Twirp TypeScript Client and Server generator. You define your service in a `.proto` specification file, and `TwirpScript` will generate serialization, JSON and protobuf clients, and service definitions for that service.

If you're not familiar with Twirp, check out the [Twirp repo](https://github.com/twitchtv/twirp) and the [documentation site](https://twitchtv.github.io/twirp/docs/intro.html).

For more on the motivation behind Twirp (and a comparison to REST APIs and gRPC), check out the [announcement blog](https://blog.twitch.tv/en/2018/01/16/twirp-a-sweet-new-rpc-framework-for-go-5f2febbf35f/).

## Examples 🚀

Check out the [Haberdasher example](https://github.com/tatethurston/TwirpScript/blob/main/examples/haberdasher).

## Installation & Usage 📦

1. Install the protobuf compiler:
   - `brew install protobuf`
1. Add this package to your project:
   - `yarn add twirpscript`
1. Autogenerate client and server code via:
   - `yarn twirpscript`

## Documentation 📖

coming soon™️

## Gotchas ⚠️

coming soon™️

## Compatibility 🛠

The default clients use `fetch` so your runtime must include `fetch`.

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/TwirpScript/blob/main/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/TwirpScript/blob/main/LICENSE).
