// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  // https://github.com/facebook/jest/issues/9021
  modulePathIgnorePatterns: ["<rootDir>/dist"],
};
