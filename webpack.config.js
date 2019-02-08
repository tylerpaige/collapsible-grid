const routes = require('./routes.js');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entry = routes.reduce((acc, { name, js }) => {
  acc[name] = path.resolve(__dirname, js);
  return acc;
}, {});

const htmls = routes.map(route => {
  const data = route.data
    ? JSON.parse(fs.readFileSync(path.resolve(__dirname, route.data), 'utf8'))
    : {};
  return new HtmlWebpackPlugin({
    filename : route.path,
    template : route.template,
    chunks : [route.name],
    data
  });
});
htmls.push(new HtmlWebpackPlugin({
  filename : 'index.html',
  template : path.resolve(__dirname, './src/components/index.hbs'),
  inject : false,
  routes
}));

module.exports = {
  entry : entry,
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  mode : 'development',
  devtool: 'inline-source-map',
  module : {
    rules : [
      {
        test: /\.jsx?/i,
        exclude: /node_modules/,
        use: [
          {
            loader :'babel-loader',
            options : {
              presets : [
                ['@babel/preset-env']
              ]
            }
          }
        ]
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        query : {
          helperDirs : [
            __dirname + '/src/components/helpers'
          ]
        }
      },
      {
        test: /\.s?css$/,
        use : [
          {
            loader : 'style-loader',
            options : {
              singleton : true
            }
          },
          {
            loader : 'css-loader',
            options : {
              modules : false
            }
          },
          {
            loader : 'sass-loader'
          },
          {
            loader : 'postcss-loader'
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            query: {
              name: '[name].[ext]',
              publicPath: '',
              emitFile: true
            }
          }
        ]
      }
    ]
  },
  devtool : 'source-map',
  plugins : [
    ...htmls
  ],
  devServer : {
    contentBase : path.join(__dirname, 'dist'),
    compress : true,
    historyApiFallback : true
  }
};
