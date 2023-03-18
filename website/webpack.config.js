const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // or 'production'
  entry: './js/code.js', // The path to your existing index.js file
  output: {
    filename: 'bundle.js', // The name of the output file
    path: path.resolve(__dirname, '/dist'), // The path to the output directory
  },
  devServer: {
    static: {
      directory: __dirname, // The path to the public directory
    },
    port: 8081, // The port to use for the development server
  },
  module: {
    rules: [
      {
        test: /\.mp3$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(glb|gltf)$/,
        use: {
          loader: 'file-loader',
        },
      },
    ],
},
  plugins: [
    // Generate an HTML file with a script tag to load the output bundle
    new HtmlWebpackPlugin({
      template: 'index.html', // The path to your existing index.html file
      filename: 'index.html', // The name of the output HTML file
    })
  ],
  target: 'web',
  node: false,
};
