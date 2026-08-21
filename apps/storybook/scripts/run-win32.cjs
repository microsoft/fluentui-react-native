const fs = require('node:fs');
const path = require('node:path');

const { runWin32 } = require('@office-iss/rex-win32/run-win32');

const packageRoot = path.resolve(__dirname, '..');
const artifactsDirectory = path.join(packageRoot, 'artifacts', 'win32');
const consoleOutput = path.join(artifactsDirectory, 'console.log');
const isDevelopment = process.argv.includes('--dev');
const allowRedBox = process.argv.includes('--allow-redbox');
const isCI = process.argv.includes('--ci');

fs.mkdirSync(artifactsDirectory, { recursive: true });
fs.rmSync(consoleOutput, { force: true });

runWin32({
  basePath: path.join(packageRoot, 'dist'),
  bundle: isDevelopment ? 'index' : 'index.win32',
  component: 'AgenticStorybook',
  consoleOutput,
  crashOnRedBox: !allowRedBox,
  debugBundlePath: 'index',
  jsEngine: 'v8',
  plugin: 'defaultplugin',
  useDirectDebugger: !isCI,
  useFastRefresh: isDevelopment,
  windowTitle: 'Agentic Components Storybook (Win32)',
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
