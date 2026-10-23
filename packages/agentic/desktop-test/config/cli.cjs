#!/usr/bin/env node

import('../lib/cli.js')
  .then(({ runDesktopTestCli }) => runDesktopTestCli())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
