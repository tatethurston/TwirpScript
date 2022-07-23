// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  // ESM
  transformIgnorePatterns: ["/node_modules/(?!(protoscript)/)"],
  // TS ESM imports are referenced with .js extensions, but jest will fail to find
  // the uncompiled file because it ends with .ts and is looking for .js.
  moduleNameMapper: {
    "(.+)\\.jsx?": "$1",
  },
  // https://github.com/facebook/jest/issues/9021
  modulePathIgnorePatterns: ["<rootDir>/dist"],
};
