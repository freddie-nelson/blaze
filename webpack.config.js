const path = require("path");

module.exports = {
  target: "web",
  mode: "production",
  entry: {
    blaze: "./src/blaze.ts",
    "blaze.min": "./src/blaze.ts",
  },
  output: {
    path: path.resolve(__dirname, "_bundles"),
    filename: "[name].js",
    library: "Blaze",
    libraryTarget: "umd",
    umdNamedDefine: true,
  },
  devtool: "source-map",
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
        loader: "raw-loader",
      },
    ],
  },
};
