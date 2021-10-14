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
        include: [
          '@fluentui-react-native/button',
          '@fluentui-react-native/callout',
          '@fluentui-react-native/checkbox',
          '@fluentui-react-native/contextual-menu',
          '@fluentui-react-native/focus-trap-zone',
          '@fluentui-react-native/focus-zone',
          '@fluentui-react-native/link',
          '@fluentui-react-native/persona',
          '@fluentui-react-native/persona-coin',
          '@fluentui-react-native/pressable',
          '@fluentui-react-native/radio-group',
          '@fluentui-react-native/separator',
          '@fluentui-react-native/text',
          '@fluentui-react-native/interactive-hooks',
          '@fluentui-react-native/menu-button',
          '@fluentui-react-native/tabs',
        ],
        changelogPath: path.resolve('packages/libraries/core/'),
      },
    ],
  },
};
