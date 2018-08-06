'use strict';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack.config');

const start = () => {
  new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules/
    }
  })
    .listen(3000, '0.0.0.0', function (err, result) {
      if (err) {
        console.log(err);
      }

      console.log('Client running at http://0.0.0.0:3000');
    });
};

module.exports = { start };
