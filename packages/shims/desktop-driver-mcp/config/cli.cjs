#!/usr/bin/env node

const { name, engines, version } = require('../package.json');
const node = process.versions.node;
const [major, minor] = node.split('.').map(Number);
if (node.includes('-') || !((major === 22 && minor >= 19) || major === 24 || major >= 26)) {
  process.stderr.write(`${name} requires Node.js ${engines.node}; found ${node}.\n`);
  process.exit(1);
}

import('../lib/cli.js')
  .then(({ runDesktopDriverMcpCli }) => runDesktopDriverMcpCli({ version }))
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
