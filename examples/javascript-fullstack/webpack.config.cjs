const { resolve } = require("path");

// eslint-disable-next-line no-undef
module.exports = {
  entry: {
    "index.production": "./src/client/index.jsx",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: { configFile: resolve("babel.config.cjs") },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  mode: "production",
  output: {
    // eslint-disable-next-line no-undef
    path: resolve("dist"),
    filename: "[name].js",
  },
};
