const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testRoot = __dirname;

const entries = fs.readdirSync(__dirname, { withFileTypes: true });
for (const dirent of entries) {
  if (dirent.isDirectory()) {
    const testProj = path.join(testRoot, dirent.name);
    console.log(testProj);
    buildAndRunTestProject(testProj);
  }
}

function buildAndRunTestProject(testPath) {
  const packager = fs.existsSync(path.join(testPath, 'yarn.lock'))
    ? 'yarn'
    : fs.existsSync(path.join(testPath, 'pnpm-lock.yaml'))
    ? 'pnpm'
    : 'npm';
  console.log(packager);
  const processOptions = { cwd: testPath, stdio: 'inherit' };
  console.log(`Starting dependency install for ${testPath}`);
  const installResult = spawnSync(packager, ['install'], processOptions);
  if (installResult.error) {
    console.log(installResult.error);
    throw installResult.error;
  }
  console.log(`Starting bundle for ${testPath}`);
  const buildResult = spawnSync('lerna', ['run', 'bundle'], processOptions);
  if (buildResult.error) {
    console.log(buildResult.error);
    throw buildResult.error;
  }
}
