#!/usr/bin/env node
const path = require('path');
const configPath = path.join(__dirname, '../configs/just.config.js');
process.argv.push('--config', configPath);

// @ts-expect-error - declaration file is not needed to invoke the just cli
require('just-scripts/bin/just-scripts');
