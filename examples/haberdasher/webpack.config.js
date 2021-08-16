// eslint-disable-next-line
const { resolve } = require("path");

// eslint-disable-next-line no-undef
module.exports = {
  entry: "./src/client/index.tsx",
  mode: "production",
  output: {
    // eslint-disable-next-line no-undef
    path: resolve(__dirname, "dist"),
    filename: "index.production.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
};
