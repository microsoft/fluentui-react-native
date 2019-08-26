// @ts-check

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const generateOnly = process.argv.indexOf('-g') > -1;
const beachballBin = require.resolve('beachball/bin/beachball.js');
const bumpCmd = [process.execPath, beachballBin];
const findGitRoot = require('../monorepo/findGitRoot');
const gitRoot = findGitRoot();

function run(args) {
  const [cmd, ...restArgs] = args;
  const runResult = spawnSync(cmd, restArgs, { cwd: gitRoot });
  if (runResult.status === 0) {
    return runResult.stdout.toString().trim();
  }

  return null;
}

module.exports = function generateVersionFiles() {
  let modified = [];
  let untracked = [];

  const gitRoot = findGitRoot();

  if (!generateOnly) {
    // Check that no uncommitted changes exist
    let status = run(['git', 'status', '-s']);
    if (status) {
      console.log('Repository needs to contain no changes for version generation to proceed.');
      process.exit();
    }

    // Do a dry-run on all packages
    run(bumpCmd);
    status = run(['git', 'status', '--porcelain=1']);
    status.split(/\n/g).forEach(line => {
      if (line) {
        const parts = line.trim().split(/\s/);

        if (parts[0] === '??') {
          // untracked files at this point would be things like CHANGELOG files for a brand new project
          untracked.push(parts[1]);
        } else {
          // modified files include package.json, generated CHANGELOG files from beachball
          modified.push('"' + parts[1] + '"');
        }
      }
    });
  }

  const packageJsons = glob.sync('+(packages|apps)/*/package.json', { cwd: gitRoot });
  packageJsons.forEach(packageJsonPath => {
    const versionFile = path.join(gitRoot, path.dirname(packageJsonPath), 'src/version.ts');
    const packageJson = JSON.parse(fs.readFileSync(path.join(gitRoot, packageJsonPath), 'utf-8'));
    const dependencies = packageJson.dependencies || {};

    if (
      !fs.existsSync(path.dirname(versionFile)) ||
      packageJsonPath.indexOf('set-version') > -1 ||
      !dependencies['@uifabric/set-version']
    ) {
      return;
    }

    let shouldGenerate = true;
    if (fs.existsSync(versionFile) && process.argv.indexOf('-f') < 0) {
      const originVersionFileContent = fs.readFileSync(versionFile).toString();
      shouldGenerate = originVersionFileContent.indexOf(`${packageJson.name}@${packageJson.version}`) < 0;
    }

    if (shouldGenerate) {
      console.log(`generating ${versionFile}`);

      fs.writeFileSync(
        versionFile,
        `// ${packageJson.name}@${packageJson.version}
// Do not modify this file, the file is generated as part of publish. The checked in version is a placeholder only.
import { setVersion } from '@uifabric/set-version';
setVersion('${packageJson.name}', '${packageJson.version}');`
      );
    }
  });

  if (!generateOnly) {
    // Undo the dry-run changes, preserve the version file changes
    console.log(`remove untracked ${untracked.join(' ')}`);
    untracked.forEach(f => fs.unlinkSync(f));

    console.log(`reset ${modified.join(' ')}`);
    run(['git', 'checkout', ...modified]);
  }
};
