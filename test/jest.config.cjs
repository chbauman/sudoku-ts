module.exports = {
  rootDir: "..",
  preset: "ts-jest",
  testEnvironment: "node",
  // the sources import each other as "./x.js" (for the browser)
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: { module: "commonjs", target: "es2015", strict: true, skipLibCheck: true } }],
  },
};
