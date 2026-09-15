const { inspect } = require('node:util');

function formatDesktopStorybookError(error) {
  return typeof error === 'string'
    ? error
    : inspect(error, { colors: false, customInspect: false, depth: null, maxArrayLength: null, maxStringLength: null });
}

function writeDesktopStorybookFailure(context, error, output = process.stderr) {
  output.write(`[storybook] FAIL ${context}\n${formatDesktopStorybookError(error)}\n`);
}

module.exports = { formatDesktopStorybookError, writeDesktopStorybookFailure };
