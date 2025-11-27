const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// HTML 페이지 자동 탐색 함수
function findHtmlFiles(dir, basePath = '') {
  const pages = [];
  
  if (!fs.existsSync(dir)) return pages;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      pages.push(...findHtmlFiles(fullPath, path.join(basePath, file)));
    } else if (file.endsWith('.html')) {
      pages.push({
        name: path.join(basePath, file.replace('.html', '')),
        path: fullPath,
        filename: file
      });
    }
  });
  
  return pages;
}

const pagesDir = path.resolve(__dirname, 'src/pages');
const htmlPages = findHtmlFiles(pagesDir);

module.exports = {
  mode: 'development',
  
  // 단일 엔트리 - 모든 CSS/JS를 하나로 번들링
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.[contenthash].js',
    assetModuleFilename: 'assets/[name][ext]',
    clean: true,
    publicPath: '/'
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@scss': path.resolve(__dirname, 'src/scss'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
    extensions: ['.js', '.jsx', '.scss', '.css']
  },

  module: {
    rules: [
      // SCSS/CSS 처리
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      // 이미지 처리
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      // 폰트 처리
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]'
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    
    new MiniCssExtractPlugin({
      filename: 'css/styles.[contenthash].css',
    }),
    
    // 정적 assets 복사
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'src/assets', 
          to: 'assets',
          noErrorOnMissing: true 
        }
      ]
    }),
    
    // 모든 HTML 페이지에 대해 HtmlWebpackPlugin 생성
    ...htmlPages.map(page => {
      // 출력 경로 결정
      let outputPath;
      if (page.name === 'home/index' || page.name === 'home\\index') {
        outputPath = 'index.html';
      } else {
        // home 폴더 외의 페이지는 pages/ 하위에 배치
        outputPath = page.name.replace('home/', '').replace('home\\', '') + '.html';
      }
      
      return new HtmlWebpackPlugin({
        template: page.path,
        filename: outputPath,
        inject: 'body',
        minify: false
      });
    })
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true,
    }
  },

  devtool: 'source-map'
};