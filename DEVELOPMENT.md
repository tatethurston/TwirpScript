# Local Development

### First time setup

1. Install the following dependencies:

```sh
brew install protobuf
brew install buf
```

2. From the project directory root:

```sh
nvm use
pnpm install
pnpm package:build
# second time to link twirpscript bin commands now available after package:build in packages
pnpm install
pnpm examples:regen
pnpm test
```

The source code for the package is in `src/`.

There are examples that use the locally built package in `examples/`.

### Testing

Tests are run with jest.

From the project directory root:

`pnpm test`

### Linting

As part of installation, husky pre-commit hooks are installed to run linters against the repo.

### Publishing

There are CI and publishing GitHub workflows in `./github/workflows`. These are named `ci.yml` and `publish.yml`.
