#!/usr/bin/env node

import('../lib/cli/index.js')
  .then(({ runDesktopStorybookCli }) => runDesktopStorybookCli([process.argv[0], process.argv[1], 'server', ...process.argv.slice(2)]))
  .catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
