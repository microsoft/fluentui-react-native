#!/usr/bin/env node

import('../lib/cli/index.js')
  .then(({ runDesktopStorybookCli }) => runDesktopStorybookCli())
  .catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
