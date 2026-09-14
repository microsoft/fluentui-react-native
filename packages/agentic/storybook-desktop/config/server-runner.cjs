#!/usr/bin/env node

const path = require('node:path');

const { startDesktopStorybookServer } = require('./server.cjs');
const { writeDesktopStorybookFailure } = require('./diagnostics.cjs');

startDesktopStorybookServer({
  configPath: path.resolve(process.env.STORYBOOK_CONFIG_PATH || '.rnstorybook'),
  projectRoot: path.resolve(process.env.STORYBOOK_PROJECT_ROOT || '.'),
}).catch((error) => {
  writeDesktopStorybookFailure('server', error);
  process.exitCode = 1;
});
