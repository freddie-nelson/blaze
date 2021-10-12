const path = require("path");

module.exports = {
  target: "web",
  mode: "production",
  entry: {
    blaze: "./src/blaze.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "blaze.js",
    library: "Blaze",
    libraryTarget: "umd",
    globalObject: "this",
    umdNamedDefine: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl",
      },
    ],
  },
};
