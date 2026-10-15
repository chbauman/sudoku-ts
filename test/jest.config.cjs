module.exports = {
  rootDir: "..",
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: { module: "commonjs", target: "es2015", strict: true, skipLibCheck: true } }],
  },
};
