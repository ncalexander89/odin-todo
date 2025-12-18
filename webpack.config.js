const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
      publicPath: "auto",

  },
  devServer: {
    static: "./dist",
    open: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
    }),
  ],
};

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    mode: isProd ? "production" : "development",
    entry: "./src/index.js",
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
      publicPath: isProd ? "/REPO_NAME/" : "auto",
    },
    devServer: {
      static: "./dist",
      open: true,
      port: 8080,
    },
    module: {
      rules: [{ test: /\.css$/i, use: ["style-loader", "css-loader"] }],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: "./src/template.html" }),
    ],
  };
};
