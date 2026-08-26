#!/usr/bin/env node

const path = require('node:path');

const { startDesktopStorybookServer } = require('./server.cjs');

startDesktopStorybookServer({
  configPath: path.resolve(process.env.STORYBOOK_CONFIG_PATH || '.rnstorybook'),
});
