const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');

const projectRoot = path.resolve(process.env.STORYBOOK_PROJECT_ROOT || process.cwd());
const component = process.env.STORYBOOK_WIN32_COMPONENT;
const windowTitle = process.env.STORYBOOK_WIN32_WINDOW_TITLE;
const isDevelopment = process.argv.includes('--dev');
const allowRedBox = process.argv.includes('--allow-redbox');
const isCI = process.argv.includes('--ci');

if (!component || !windowTitle) {
  throw new Error('run-win32 requires STORYBOOK_WIN32_COMPONENT and STORYBOOK_WIN32_WINDOW_TITLE.');
}

const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
const { runWin32 } = requireFromProject('@office-iss/rex-win32/run-win32');
const artifactsDirectory = path.join(projectRoot, 'artifacts', 'win32');
const consoleOutput = path.join(artifactsDirectory, 'console.log');

fs.mkdirSync(artifactsDirectory, { recursive: true });
fs.rmSync(consoleOutput, { force: true });

runWin32({
  basePath: path.join(projectRoot, 'dist'),
  bundle: isDevelopment ? 'index' : 'index.win32',
  component,
  consoleOutput,
  crashOnRedBox: !allowRedBox,
  debugBundlePath: 'index',
  jsEngine: 'v8',
  plugin: 'defaultplugin',
  useDirectDebugger: !isCI,
  useFastRefresh: isDevelopment,
  windowTitle,
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
