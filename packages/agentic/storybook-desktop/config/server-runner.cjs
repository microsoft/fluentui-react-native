#!/usr/bin/env node

const path = require('node:path');

const { startDesktopStorybookServer } = require('./server.cjs');

startDesktopStorybookServer({
  configPath: path.resolve(process.env.STORYBOOK_CONFIG_PATH || '.rnstorybook'),
  projectRoot: path.resolve(process.env.STORYBOOK_PROJECT_ROOT || '.'),
}).catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
