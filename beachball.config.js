const fs = require('fs');
const path = require('path');

module.exports = {
  disallowedChangeTypes: ['major'],
  hooks: {
    prepublish: (packagePath) => {
      const packageJsonPath = path.join(packagePath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (packageJson.onPublish) {
        Object.assign(packageJson, packageJson.onPublish);
        delete packageJson.onPublish;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
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
