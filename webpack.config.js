const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const env = require('dotenv').config().parsed


const dev = env.MODE;
const mode = process.env.NODE_ENV;
const PORT = 3000;


const plugins = (param) => {
  const pluginsContainer = [];

  if (Boolean(param.CLEAN)) {
    pluginsContainer.push(new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        '!assets*'
    ],
    }));
  }

  if (Boolean(param.HTML)) {
    pluginsContainer.push(new HtmlWebpackPlugin());
  }

  if (Boolean(param.STYLE)) {
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
    index: env.LANGUAGE === 'js'? ['@babel/polyfill', './src/script/index.ts'] :  './src/script/index.ts',
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: mode === dev  ? 'script/[name].js':'script/[name].[hash].js',
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
  plugins: plugins(env),
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
          styleLoader(!env.STYLE),
          'css-loader',
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.m?js|\.ts$/,
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