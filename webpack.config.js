const path = require("path");

module.exports = {
  target: "web",
  mode: "production",
  entry: {
    blaze: "./src/blaze.ts",
  },
  output: {
    path: path.resolve(__dirname, "lib/bundle"),
    filename: "[name].js",
    library: {
      name: "Blaze",
      type: "umd",
      export: "default",
    },
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
        loader: "raw-loader",
      },
    ],
  },
};
