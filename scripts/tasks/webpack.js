// @ts-check

const { webpackTask, webpackDevServerTask } = require('just-scripts');

exports.webpack = webpackTask();
exports.webpackDevServer = webpackDevServerTask();
