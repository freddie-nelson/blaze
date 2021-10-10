module.exports = {
  mode: "development",
  entry: {
    blaze: "./src/blaze.ts",
  },
  output: {
    filename: "build/[name].js",
    path: __dirname,
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
    ],
  },
};
