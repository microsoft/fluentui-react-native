const { processPlatformJsonFiles, outputCodegenFile } = require('@fluentui-react-native/scripts');
const path = require('node:path');

const globalHeader = `WARNING: This file is auto-generated. Do not edit it manually.

This file contains generated global tokens for all platforms. It allows references to direct constants
which can be minified and statically analyzed and removed if unused.`;

function processGlobals() {
  const files = processPlatformJsonFiles({
    jsonFiles: {
      android: require('@fluentui-react-native/design-tokens-android/light/tokens-global.json'),
      ios: require('@fluentui-react-native/design-tokens-ios/light/tokens-global.json'),
      macos: require('@fluentui-react-native/design-tokens-macos/light/tokens-global.json'),
      win32: require('@fluentui-react-native/design-tokens-win32/colorful/tokens-global.json'),
      windows: require('@fluentui-react-native/design-tokens-windows/light/tokens-global.json'),
    },
    entry: path.join(__dirname, '../src/tokens/global.generated.ts'),
    genbase: path.join(__dirname, '../src/tokens/generated/global'),
    description: globalHeader,
  });
  for (const file of files) {
    outputCodegenFile(file, { alwaysBlockComments: true });
  }
}

function main() {
  processGlobals();
}

main();
