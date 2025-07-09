// @ts-check

const { runScript } = require('../utils/runScript.js');

const TSC_COMMAND = 'tsc';

module.exports.ts = {
  commonjs: () => {
    return runScript(TSC_COMMAND, '--outDir', 'lib-commonjs');
  },
  esm: () => {
    return runScript(TSC_COMMAND, '--outDir', 'lib', '--module', 'esnext');
  },
  commonjsOnly: () => {
    return runScript(TSC_COMMAND, '--outDir', 'lib');
  },
};
