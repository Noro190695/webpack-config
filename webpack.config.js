const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const dev = 'development';
const mode = process.env.NODE_ENV;
const PORT = 3000;
const language = 'ts'
const config = {
  plugins: {
    clean: true,
    html: true,
    style: true
  }
}

const plugins = (param) => {
  const pluginsContainer = [];

  if (param.clean) {
    pluginsContainer.push(new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!assets*'
    ],
    }));
  }

  if (param.html) {
    pluginsContainer.push(new HtmlWebpackPlugin());
  }

  if (param.style) {
    pluginsContainer.push(new MiniCssExtractPlugin({
      filename: "style/[name].css",
      chunkFilename: "[style/[id].css",
    }));
  }

  return pluginsContainer;
}

const styleLoader = (isCssFile) => {
  if (isCssFile) {
    return MiniCssExtractPlugin.loader;
  }else{
    return 'style-loader';
  }
}
module.exports = {
  mode: mode,
  devtool: mode === dev ? 'eval-source-map':'',
  entry: {
    index: language === 'js'? ['@babel/polyfill', './src/script/index.js'] :  './src/script/index.ts',
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: mode === dev  ? 'js/[name].js':'js/[name].[hash].js',
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.script', '.js', '.jsx', '.json' ],
  },
  optimization: {
    minimize: mode === dev ? false: true,
    minimizer: [
      new JsonMinimizerPlugin(),
      new CssMinimizerPlugin(),
      new HtmlMinimizerPlugin(),
      new UglifyJsPlugin()
    ],
    splitChunks:{
      // chunks: "all"
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',

        }
      }
    }
    
  },
  plugins: plugins(config.plugins),
  devServer: {
    allowedHosts: 'all',
    port: PORT
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          styleLoader(config.plugins.style),
          'css-loader',
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name(resourcePath, resourceQuery) {
            if (mode === dev ) {
              return 'img/[ext]/[name].[ext]';
            }
            return 'img/[ext]/[hash].[ext]';
          },
        },
      },
    ],
  },
};