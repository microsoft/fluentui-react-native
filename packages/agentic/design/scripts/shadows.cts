const path = require('node:path');
const { CodegenFile } = require('@fluentui-react-native/scripts');

const shadowJson = {
  win32: {
    light: require('@fluentui-react-native/design-tokens-win32/colorful/tokens-shadow.json'),
    dark: require('@fluentui-react-native/design-tokens-win32/black/tokens-shadow.json'),
    darkGray: require('@fluentui-react-native/design-tokens-win32/darkgray/tokens-shadow.json'),
    hc: require('@fluentui-react-native/design-tokens-win32/hc/tokens-shadow.json'),
  },
  windows: {
    light: require('@fluentui-react-native/design-tokens-windows/light/tokens-shadow.json'),
    dark: require('@fluentui-react-native/design-tokens-windows/dark/tokens-shadow.json'),
  },
  macos: {
    light: require('@fluentui-react-native/design-tokens-macos/light/tokens-shadow.json'),
    dark: require('@fluentui-react-native/design-tokens-macos/dark/tokens-shadow.json'),
    hclight: require('@fluentui-react-native/design-tokens-macos/hclight/tokens-shadow.json'),
    hcdark: require('@fluentui-react-native/design-tokens-macos/hcdark/tokens-shadow.json'),
  },
  ios: {
    light: require('@fluentui-react-native/design-tokens-ios/light/tokens-shadow.json'),
    dark: require('@fluentui-react-native/design-tokens-ios/dark/tokens-shadow.json'),
    hclight: require('@fluentui-react-native/design-tokens-ios/hclight/tokens-shadow.json'),
    hcdark: require('@fluentui-react-native/design-tokens-ios/hcdark/tokens-shadow.json'),
    elevateddark: require('@fluentui-react-native/design-tokens-ios/elevateddark/tokens-shadow.json'),
  },
  android: {
    light: require('@fluentui-react-native/design-tokens-android/light/tokens-shadow.json'),
    dark: require('@fluentui-react-native/design-tokens-android/dark/tokens-shadow.json'),
  },
};

const HELPER_OUTPUT = `
type ShadowRect = {
  x: number;
  y: number;
  blur: number;
};

function makeShadow(color1: string, rc1: ShadowRect, color2: string, rc2: ShadowRect) {
  return {
    ambient: { color: color1, ...rc1 },
    key: { color: color2, ...rc2 }
  };
}`;

const SHADOW_NUMBERS = [2, 4, 8, 16, 28, 64];
const BRAND_ITER = [false, true];
const SHADOW_INDEX = [0, 1];

const asJsonKey = (num: number, brand?: boolean) => (brand ? `shadowBrand${num}` : `shadow${num}`);
const asTypeKey = (num: number, brand?: boolean) => (brand ? `shadow${num}brand` : `shadow${num}`);

function codegenShadows() {
  for (const platformKey of Object.keys(shadowJson)) {
    const platform = platformKey as keyof typeof shadowJson;
    const filename = platform === 'win32' ? 'shadows.ts' : `shadows.${platform}.ts`;
    const filePath = path.join(__dirname, '../src/tokens/generated', filename);
    const codegenFile = new CodegenFile(filePath);
    codegenFile.header += '\n' + HELPER_OUTPUT;
    for (const theme of Object.keys(shadowJson[platform])) {
      const shadows = (shadowJson[platform] as Record<string, any>)[theme];
      if (shadows) {
        let value = '{\n';
        for (const num of SHADOW_NUMBERS) {
          for (const brand of BRAND_ITER) {
            const jsonKey = asJsonKey(num, brand);
            const typeKey = asTypeKey(num, brand);
            const shadow = shadows[jsonKey];
            if (shadow) {
              const s0 = shadow[0];
              const s1 = shadow[1];
              const color1 = codegenFile.rampString('color', s0.color);
              const rc1 = codegenFile.rampConstant('dims', `{ x: ${s0.x}, y: ${s0.y}, blur: ${s0.blur} }`);
              const color2 = codegenFile.rampString('color', s1.color);
              const rc2 = codegenFile.rampConstant('dims', `{ x: ${s1.x}, y: ${s1.y}, blur: ${s1.blur} }`);
              const shadowRamp = codegenFile.rampConstant('shadow', `makeShadow(${color1}, ${rc1}, ${color2}, ${rc2})`);
              value += `  ${typeKey}: ${shadowRamp},\n`;
              for (const index of SHADOW_INDEX) {
                const shadowPart = shadow[index];
                if (shadowPart) {
                  codegenFile.body += `export const ${typeKey}${index}: ShadowRect = ${JSON.stringify(shadowPart)};\n`;
                }
              }
            }
          }
        }
        value += '}';
        const themeShadows = codegenFile.rampConstant('themeShadows', value);
        codegenFile.addExportConst(`${theme}Shadows`, themeShadows);
      }
    }
    codegenFile.finish();
  }
}

module.exports = {
  codegenShadows,
};
