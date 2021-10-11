const path = require("path");

module.exports = {
  target: "web",
  mode: "development",
  entry: {
    main: "./dev/main.ts",
  },
  output: {
    path: __dirname,
    filename: "main.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["../node_modules"],
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
};
