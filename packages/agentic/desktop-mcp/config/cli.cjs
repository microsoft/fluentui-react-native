#!/usr/bin/env node

const { version } = require('../package.json');

import('../lib/cli.js')
  .then(({ runDesktopMcpCli }) => runDesktopMcpCli({ version }))
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
