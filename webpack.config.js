const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    site: "./assets/site.js", // required for bulma sass/css styles
    app: "./assets/javascript/app.js",
    teams: "./assets/javascript/teams.js",
    "react-object-lifecycle": "./assets/javascript/src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "./static"),
    filename: "js/[name]-bundle.js",
    library: ["SiteJS", "[name]"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: { presets: ["@babel/env", "@babel/preset-react"] },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "raw-loader", "css-loader"],
      },
      {
        test: /.(png|jpg|woff|woff2|eot|ttf|svg|gif)$/,
        use: [MiniCssExtractPlugin.loader, "url-loader", "file-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new Dotenv({
      path: process.env.NODE_ENV === "production" ? path.resolve(__dirname, './assets/.env.prod') : path.resolve(__dirname, './assets/.env.dev')
    }),
  ],
  devServer: {
    writeToDisk: true,
  },
};
