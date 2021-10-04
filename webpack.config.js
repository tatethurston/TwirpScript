// eslint-disable-next-line
const { resolve } = require("path");

// eslint-disable-next-line no-undef
module.exports = {
  entry: {
    cli: "./src/cli.ts",
    compiler: "./src/compiler.ts",
    runtime: "./src/runtime.ts",
  },
  mode: "production",
  output: {
    // eslint-disable-next-line no-undef
    path: resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  target: "node",
};
