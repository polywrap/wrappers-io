module.exports = {
  collectCoverage: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "moduleFileExtensions": [
    "ts",
    "js",
    "json",
    "node"
  ]
};
