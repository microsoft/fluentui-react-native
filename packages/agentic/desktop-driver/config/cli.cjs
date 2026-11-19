#!/usr/bin/env node

const { name, engines } = require('../package.json');
const node = process.versions.node;
const [major, minor] = node.split('.').map(Number);
if (node.includes('-') || !((major === 22 && minor >= 19) || major === 24 || major >= 26)) {
  process.stderr.write(`${name} requires Node.js ${engines.node}; found ${node}.\n`);
  process.exit(1);
}

import('../lib/cli/index.js')
  .then(({ runDesktopDriverCli }) => runDesktopDriverCli())
  .catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
