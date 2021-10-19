const path = require("path");
const WorkerPlugin = require("worker-plugin");

module.exports = {
  target: "web",
  mode: "development",
  stats: "none",
  entry: {
    main: "./dev/main.ts",
  },
  output: {
    path: __dirname,
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["../node_modules"],
  },
  plugins: [new WorkerPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          silent: true,
        },
      },
      {
        test: /\.glsl$/,
        loader: "raw-loader",
      },
    ],
  },
};
