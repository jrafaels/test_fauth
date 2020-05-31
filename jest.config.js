require("mysql2/node_modules/iconv-lite").encodingExists("foo");

module.exports = {
    "roots": [
      "<rootDir>/src"
    ],
    "verbose": true,
        "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
        "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
}