const { resolve } = require("path");

const shared = {
  mode: "production",
  output: {
    // eslint-disable-next-line no-undef
    path: resolve("dist"),
    filename: "[name].js",
  },
};

module.exports = [
  {
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
              options: { configFile: resolve("babel.config.js") },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    ...shared,
  },
  {
    entry: {
      server: "./src/server/index.js",
    },
    target: "node",
    ...shared,
  },
];
