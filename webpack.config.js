const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.[contenthash].js',
    // 기본 이미지 출력 경로 역할
    assetModuleFilename: 'assets/[name][ext]', 
  },

  module: {
    rules: [
      // SCSS
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },

      // 이미지
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          // dist/assets/로 복사 역할
          filename: 'assets/[name][ext]', 
        },
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),

    // CSS 파일 추출 플러그인 (한 번만!)
    new MiniCssExtractPlugin({
      filename: 'css/styles.[contenthash].css',
    }),

    // HTML 템플릿
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],

  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    open: true,
    port: 3000,
  },
};
