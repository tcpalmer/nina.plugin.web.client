const paths = require('./paths');

const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {

  entry: [paths.src + '/index.js'],

  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  plugins: [

    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
      chunkFilename: '[id].css',
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.src + '/assets', to: 'assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
        },
      ],
    }),

    new HtmlWebpackPlugin({
      title: 'NINA Web Client',
      favicon: paths.src + '/assets/icons/favicon.png',
      template: paths.public + '/index.html',
      filename: 'index.html',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },

      {
        test: /\.css$/i,
        include: paths.src,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 0,
            },
          },
        ],
      },

      {
        test: /\.less$/i,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },

      {test: /\.svg$/, use: ['@svgr/webpack']},

      {test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource'},

      {test: /\.(woff(2)?|eot|ttf|otf|)$/, type: 'asset/inline'},
    ],
  },
};
