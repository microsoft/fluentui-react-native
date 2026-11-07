const path = require('node:path');
const { pathToFileURL } = require('node:url');

exports.processLifelineUrl = pathToFileURL(path.join(__dirname, 'process-lifeline.mjs')).href;
