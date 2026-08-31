#!/usr/bin/env node

import('../lib/cli/index.js')
  .then(({ runDesktopDriverCli }) => runDesktopDriverCli())
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
