const paths = require('./paths');
const Dotenv = require('dotenv-webpack');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
var ZipPlugin = require('zip-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,

  output: {
    path: paths.build,
    publicPath: '/dist/',
    filename: 'js/[name].[contenthash].bundle.js',
  },

  plugins: [

    new Dotenv({
      path: './.env.production',
    }),

    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: '[id].css',
    }),

    new CopyPlugin({
      patterns: [
        {from: path.resolve(paths.src, 'webClientVersion.json'), to: paths.build},
      ],
    }),

    new ZipPlugin({
      filename: 'nina-web-client.zip',
    }),
  ],

  module: {
    rules: [],
  },

  optimization: {
    minimize: true,
    minimizer: [
      `...`,
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },

  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },

});
