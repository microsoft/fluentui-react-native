const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

module.exports = {
  disallowedChangeTypes: ['major'],
  hooks: {
    postbump: (packagePath, name) => {
      if (name === '@fluentui-react-native/dependency-profiles') {
        console.log(`Updating ${name} to use latest published versions`);
        execSync(`yarn update-profile`, { cwd: packagePath });
        // This logic is run after all bumps have happened,
        // so it's ok that it's only run once
        console.log('Updating lockfile');
        execSync(`yarn install --mode update-lockfile`);
      }
    },
  },
  changelog: {
    groups: [
      {
        masterPackageName: '@fluentui/react-native',
        include: getPackagesToInclude(),
        changelogPath: path.resolve('packages/libraries/core/'),
      },
    ],
  },
};

function getPackagesToInclude() {
  const content = fs.readFileSync(path.resolve('packages/libraries/core/src/index.ts'), 'utf8');
  const matches = Array.from(content.matchAll(new RegExp("'(@.*)'", 'g')), (m) => m[1]);
  return matches;
}
