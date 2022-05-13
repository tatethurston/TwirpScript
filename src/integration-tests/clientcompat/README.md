# Client Compatibility Test

Twirp offers a [client compatability testing tool](https://github.com/twitchtv/twirp/tree/main/clientcompat).

The Twirp `clientcompat` testing tool has been vendored into the repo so it does not need to be installed.

```sh
  go install github.com/twitchtv/twirp/clientcompat@latest
```

### First time setup

Then build and link your local TwirpScript

```
yarn clientcompat:setup
```

### Running

```
yarn clientcompat
```
