#!/usr/bin/env node
const path = require('path');
const configPath = path.join(__dirname, './configs/just.config.js');
process.argv.push('--config', configPath);
require('just-scripts/bin/just-scripts');
