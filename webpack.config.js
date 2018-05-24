const webpack = require('webpack');

module.exports = {
//  mode: (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
  entry: [
    'react-hot-loader/patch',
    './src/index.js'
  ],

  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './dist',
    hot: true,
    port: 3000
  }

};
