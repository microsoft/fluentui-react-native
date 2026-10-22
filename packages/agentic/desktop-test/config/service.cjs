#!/usr/bin/env node
import('../lib/ownedService.js')
  .then(({ runOwnedDesktopService }) => {
    if (process.argv.length !== 3) throw new Error('Expected one generated desktop service descriptor path.');
    return runOwnedDesktopService(process.argv[2]);
  })
  .catch((error) => {
    process.stderr.write(`${error.stack ?? error}\n`);
    process.exitCode = 1;
  });
