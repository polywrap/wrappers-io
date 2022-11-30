const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: './build/index.js',
  target: 'node',
  optimization: {
    minimize: false,
  },
  plugins: [
		new NodePolyfillPlugin({
		}),
    new webpack.ProvidePlugin({
      window: 'global/window',
    }),
	],
  // module: {
  //   rules: [
  //     {
  //       test: /\.ts?$/,
  //       use: 'ts-loader',
  //       exclude: /node_modules/,
  //     },
  //   ],
  // },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    globalObject: "this",
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};