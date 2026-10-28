import type { ShadowTokens, ShadowLayer } from './design-token.types';
const { GeneratedFile, Ramp } = require('@fluentui-react-native/scripts');
import type { GeneratedFile as GeneratedFileType, Ramp as RampType } from '@fluentui-react-native/scripts';
const path = require('node:path');

type PlatformData = {
  paths: Record<string, string>;
  filename: string;
};

const platformPaths: Record<string, PlatformData> = {
  win32: {
    paths: {
      dark: '@fluentui-react-native/design-tokens-win32/black/',
      light: '@fluentui-react-native/design-tokens-win32/colorful/',
      hc: '@fluentui-react-native/design-tokens-win32/hc/',
      darkGray: '@fluentui-react-native/design-tokens-win32/darkgray/',
    },
    filename: 'fluentTokens.generated.ts',
  },
  macos: {
    paths: {
      dark: '@fluentui-react-native/design-tokens-macos/dark/',
      light: '@fluentui-react-native/design-tokens-macos/light/',
      hcLight: '@fluentui-react-native/design-tokens-macos/hclight/',
      hcDark: '@fluentui-react-native/design-tokens-macos/hcdark/',
    },
    filename: 'fluentTokens.generated.macos.ts',
  },
  android: {
    paths: {
      dark: '@fluentui-react-native/design-tokens-android/dark/',
      light: '@fluentui-react-native/design-tokens-android/light/',
    },
    filename: 'fluentTokens.generated.android.ts',
  },
  ios: {
    paths: {
      dark: '@fluentui-react-native/design-tokens-ios/dark/',
      light: '@fluentui-react-native/design-tokens-ios/light/',
      hcLight: '@fluentui-react-native/design-tokens-ios/hclight/',
      hcDark: '@fluentui-react-native/design-tokens-ios/hcdark/',
      darkElevated: '@fluentui-react-native/design-tokens-ios/elevateddark/',
    },
    filename: 'fluentTokens.generated.ios.ts',
  },
};

function addShadowLayer(file: GeneratedFileType, ramp: RampType, layer: ShadowLayer) {
  const { x, y, color, blur } = layer;
  file.add(ramp.add('shadowLayer', [`{ x: ${x}, y: ${y}, blur: ${blur}, color: `, ramp.add('color', `'${color}'`), ' }']));
}

function adjustShadowName(name: string) {
  if (name.includes('Brand')) {
    // shadowBrand16 needs to become shadow16brand
    return name.replace('Brand', '') + 'brand';
  }
  return name;
}

function processShadowTokens(prefix: string, platformPath: string, file: GeneratedFileType, ramp: RampType) {
  const shadowTokens: ShadowTokens = require(`${platformPath}tokens-shadow.json`);
  const layerNames = ['ambient', 'key'];
  file.add(`export const ${prefix}Shadows: BaseShadowAliasTokens = {\n`);
  for (const [name, layers] of Object.entries(shadowTokens)) {
    file.add(`  ${adjustShadowName(name)}: { `);
    for (const [index, layer] of layerNames.entries()) {
      file.add(`${layer}: `);
      addShadowLayer(file, ramp, layers[index]);
      if (index < layerNames.length - 1) {
        file.add(', ');
      }
    }
    file.add(' },\n');
  }
  file.add('};\n');
}

function generatePlatformFluentTokens(platformData: PlatformData) {
  const target = path.join(__dirname, '../src/fluent/defaults', platformData.filename);
  const generatedFile = new GeneratedFile(target);
  generatedFile.add(`import type { BaseShadowAliasTokens } from '../types/Shadow.types';\n\n`);
  const ramp = new Ramp();
  generatedFile.add(ramp);
  for (const [prefix, platformPath] of Object.entries(platformData.paths)) {
    processShadowTokens(prefix, platformPath, generatedFile, ramp);
  }
  ramp.resolveEntries();
  generatedFile.commit();
}

function codegenFluentTokens() {
  generatePlatformFluentTokens(platformPaths.win32);
}

module.exports = { codegenFluentTokens };
