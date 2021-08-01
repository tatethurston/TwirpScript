# Client Compatibility Test

Twirp offers a [client compatability testing tool](https://github.com/twitchtv/twirp/tree/main/clientcompat).

The Twirp `clientcompat` testing tool must first be installed:

```sh
  go install github.com/twitchtv/twirp/clientcompat@latest
```

Then the tests can be run:

```sh
  node ./dist/clientcompat/test.js
```
