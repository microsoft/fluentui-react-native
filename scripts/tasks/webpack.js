// @ts-check

const { webpackTask, argv } = require('just-scripts');
const path = require('path');
const fs = require('fs');

exports.webpack = webpackTask();
exports.webpackDevServer = async function() {
  const fp = require('find-free-port');
  const webpackConfigFilePath = argv().webpackConfig || 'webpack.serve.config.js';
  const configPath = path.resolve(process.cwd(), webpackConfigFilePath);
  const port = await fp(4322, 4400);

  if (fs.existsSync(configPath)) {
    const webpackDevServerPath = require.resolve('webpack-dev-server/bin/webpack-dev-server.js');
    const execSync = require('../exec-sync');

    execSync(`node ${webpackDevServerPath} --config ${configPath} --port ${port} --open`);
  }
};

let server;
exports.webpackDevServerWithCompileResolution = async function() {
  return new Promise((resolve, reject) => {
    const webpack = require('webpack');
    const webpackDevServer = require('webpack-dev-server');
    const webpackConfig = require(path.resolve(process.cwd(), 'webpack.serve.config.js'));

    const compiler = webpack(webpackConfig);
    compiler.plugin('done', () => {
      resolve();
    });

    const devServerOptions = Object.assign({}, webpackConfig.devServer, {
      stats: 'minimal'
    });
    server = new webpackDevServer(compiler, devServerOptions);
    const port = webpackConfig.devServer.port;
    server.listen(port, '127.0.0.1', () => {
      console.log(`started server on http://localhost:${port}`);
    });
  });
};

exports.webpackDevServerWithCompileResolution.done = async function() {
  return new Promise((resolve, reject) => {
    server.close(() => {
      resolve();
    });
  });
};
