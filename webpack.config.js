const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


const mode = process.env.NODE_ENV;
const PORT = 3000;

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
  entry: {
    index: './src/script/index.js',
    'index-ts': './src/script/index.ts'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: mode === 'development' ? 'script/[name].js':'script/[name].[hash].js',
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.jsx', '.json' ],
  },
  optimization: {
    minimize: mode === 'development'? false: true,
    minimizer: [
      new JsonMinimizerPlugin(),
      new CssMinimizerPlugin(),
      new HtmlMinimizerPlugin(),
      new UglifyJsPlugin()
    ],
  },
  plugins: plugins(config.plugins),
  devServer: {
    allowedHosts: 'all',
    port: PORT
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
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
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name(resourcePath, resourceQuery) {
            if (mode === 'development') {
              return 'img/[ext]/[name].[ext]';
            }
            return 'img/[ext]/[hash].[ext]';
          },
        },
      },
    ],
  },
};