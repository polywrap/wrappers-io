const path = require('path');

module.exports = {
  entry: './build/index.js',
  target: 'node',
  optimization: {
    minimize: false,
  },
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
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};