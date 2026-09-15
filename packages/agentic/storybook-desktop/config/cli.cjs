#!/usr/bin/env node

const { writeDesktopStorybookFailure } = require('./diagnostics.cjs');

import('../lib/cli/index.js')
  .then(({ runDesktopStorybookCli }) => runDesktopStorybookCli())
  .catch((error) => {
    writeDesktopStorybookFailure('CLI', error);
    process.exitCode = 1;
  });
