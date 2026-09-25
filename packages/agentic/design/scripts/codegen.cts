const { processPlatformJsonFiles, outputCodegenFile } = require('@fluentui-react-native/scripts');
const path = require('node:path');
const { codegenAliases } = require('./aliases.cts');
const { assertMappingsConsistent, writeMappingProjections } = require('./token-mappings/check-mappings.cjs');
const { codegenShadows } = require('./shadows.cts');

const globalHeader = `WARNING: This file is auto-generated. Do not edit it manually.

This file contains generated global tokens for all platforms. It allows references to direct constants
which can be minified and statically analyzed and removed if unused.`;

function normalizeFontFamilies(tokens) {
  const normalized = structuredClone(tokens);
  const family = normalized.font.family;
  family.base ??= family.default;
  family.monospace ??= family.base;
  family.numeric ??= family.base;
  return normalized;
}

/**
 * Recursively add keys present in `source` but missing from `target`, without overwriting any value `target`
 * already defines. Used to backfill platform token JSON that omits values (e.g. mobile platforms don't define
 * the desktop-only brand primary/shade/tint ramp) with the closest desktop equivalent, so every platform ends up
 * with the same set of generated constants.
 */
function fillMissing(target, source) {
  const filled = structuredClone(target);
  for (const [key, value] of Object.entries(source)) {
    if (!(key in filled)) {
      filled[key] = structuredClone(value);
    } else if (typeof value === 'object' && value !== null && typeof filled[key] === 'object' && filled[key] !== null) {
      filled[key] = fillMissing(filled[key], value);
    }
  }
  return filled;
}

/**
 * Backfill only the `color` tokens missing from `tokens` using `source`. Non-color tokens (e.g. `font.family`) have
 * their own platform-appropriate fallback handled by {@link normalizeFontFamilies} and should not be backfilled
 * from a different platform's fonts.
 */
function fillMissingColors(tokens, source) {
  return { ...tokens, color: fillMissing(tokens.color, source.color) };
}

function processGlobals() {
  const win32Tokens = require('@fluentui-react-native/design-tokens-win32/colorful/tokens-global.json');
  const macosTokens = require('@fluentui-react-native/design-tokens-macos/light/tokens-global.json');
  // ios and android omit some desktop-only color values (e.g. the brand primary/shade/tint ramp); backfill those
  // from the platform they're most visually aligned with (macos for ios, win32 for android) so every platform
  // generates the same set of color constants.
  const iosTokens = fillMissingColors(require('@fluentui-react-native/design-tokens-ios/light/tokens-global.json'), macosTokens);
  const androidTokens = fillMissingColors(require('@fluentui-react-native/design-tokens-android/light/tokens-global.json'), win32Tokens);

  const files = processPlatformJsonFiles({
    jsonFiles: {
      android: normalizeFontFamilies(androidTokens),
      ios: normalizeFontFamilies(iosTokens),
      macos: normalizeFontFamilies(macosTokens),
      win32: normalizeFontFamilies(win32Tokens),
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
  writeMappingProjections();
  assertMappingsConsistent();
  processGlobals();
  codegenAliases();
  codegenShadows();
}

main();
