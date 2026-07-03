const { FileGenerator } = require('@fluentui-react-native/scripts');
const path = require('node:path');

const PLATFORMS = ['android', 'ios', 'macos', 'win32', 'windows'] as const;
type Platform = (typeof PLATFORMS)[number];

type Constants = Record<string, string | number | boolean>;
type ExtractResults = { common: Constants; oneOff: Constants } & Record<string, Constants>;

type PlatformJsonFiles = Partial<Record<Platform, string>>;

/**
 * Form a new key by either:
 * - returning the key as-is if no prefix is provided
 * - returning the prefix + key with the first letter of the key capitalized if a prefix is provided
 * @param prefix optional prefix to prepend to the key
 * @param key the key to be modified
 * @returns the new key
 */
function formValueKey(prefix: string | undefined, key: string): string {
  if (!prefix) {
    return key;
  }
  return `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

function flatten(obj: Record<string, unknown>, prefix: string | undefined, result: Constants) {
  if (Array.isArray(obj)) {
    console.warn(`encountered an array at ${prefix} while flattening, not supported right now`);
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    const newKey = formValueKey(prefix, key);
    if (typeof value === 'object' && value !== null) {
      flatten(value as Record<string, unknown>, newKey, result);
    } else {
      result[newKey] = value as string | number | boolean;
    }
  }
}

/**
 * Read a JSON file and flatten its contents into a single-level object.
 * @param filePath the path to the JSON file
 * @param prefix optional prefix to prepend to each key
 * @returns the flattened object
 */
function readAndFlattenJson(filePath: string, prefix?: string): Constants {
  const json = require(filePath);
  const result: Constants = {};
  flatten(json, prefix, result);
  return result;
}

type CodegenConstantsOptions = PlatformJsonFiles & {
  // entry point for the generated file, relative to the working directory
  targetEntry: string;
  // which platform should be considered default, win32 is default if not specified
  defaultPlatform?: Platform;
  // optional entry point for the platform-specific files, relative to the working directory
  platformEntry?: string;
  // optional prefix to prepend to each key in the generated file
  prefix?: string;
};

function codegenConstantsFromJsonFiles({
  targetEntry,
  defaultPlatform = 'win32',
  platformEntry,
  prefix,
  ...jsonFiles
}: CodegenConstantsOptions) {
  const results = processJsonFiles(jsonFiles, prefix);
  const targetExt = path.extname(targetEntry);
  const generator = new FileGenerator(targetEntry);
  const dirName = path.dirname(targetEntry);
  platformEntry ??= path.parse(targetEntry).name + '.platform';
  for (const platform of Object.keys(jsonFiles)) {
    const suffix = platform === defaultPlatform ? '' : `.${platform}`;
    const platTarget = path.join(dirName, `${platformEntry}${suffix}${targetExt}`);
    codegenConstantsFile(platTarget, results[platform]);
  }
  codegenConstantsFile(targetEntry, results.common, results[defaultPlatform], `./${platformEntry}`, results.oneOff);
}

function codegenConstantsFile(target: string, exports: Constants, imports?: Constants, from?: string, oneOffs?: Constants) {
  const generator = new FileGenerator(target);
  exportConstants(generator, exports);
  if (imports && from) {
    generator.addEmptyLine();
    generator.addLine(`// exported values that differ per-platform, but exist on all platforms`);
    generator.addExportFrom(Object.keys(imports).sort(), from);
  }
  if (oneOffs && Object.keys(oneOffs).length > 0) {
    exportConstants(generator, oneOffs, 'exported values that exist on some platforms but not all');
  }
  generator.finish();
}

function exportConstants(generator: typeof FileGenerator, constants: Constants, msg?: string) {
  generator.addEmptyLine();
  if (msg) {
    generator.addLine(`// ${msg}`);
  }
  const keys = Object.keys(constants).sort();
  for (const key of keys) {
    generator.addExportConstant(key, constants[key]);
  }
}

function filesToFlattened(files: PlatformJsonFiles, prefix?: string): Partial<Record<Platform, Constants>> {
  const result: Partial<Record<Platform, Constants>> = {};
  for (const platform of PLATFORMS) {
    if (files[platform]) {
      result[platform] = readAndFlattenJson(files[platform]!, prefix);
    }
  }
  return result;
}

/**
 * Return the values that are common across all platforms in common, and the values that exist on all platforms but
 * vary across platforms under their own keys.
 *
 * Will mutate the flattened list to only contain the values that are unique to each platform.
 */
function extractCommonValues(flattened: Record<string, Constants>): ExtractResults {
  const platforms = Object.keys(flattened);
  const results: ExtractResults = { common: {}, oneOff: {} };
  const firstPlatform = platforms[0];
  for (const platform of platforms) {
    results[platform] = {};
  }
  for (const key of Object.keys(flattened[firstPlatform])) {
    const value = flattened[firstPlatform][key];
    let existsInAll = true;
    let matching = true;
    for (const platform of platforms) {
      if (matching && flattened[platform][key] !== value) {
        matching = false;
      }
      if (existsInAll && !(key in flattened[platform])) {
        existsInAll = false;
      }
    }
    if (matching) {
      results.common[key] = value;
    }
    if (existsInAll || matching) {
      for (const platform of platforms) {
        if (!matching) {
          results[platform][key] = flattened[platform][key];
        }
        delete flattened[platform][key];
      }
    }
  }
  return results;
}

function extractMatches(target: Constants, prefix: string | undefined, ...sources: Constants[]) {
  if (sources.length === 0) {
    return;
  }
  const keys = Object.keys(sources[0]);
  for (const key of keys) {
    const value = sources[0][key];
    for (let i = 1; i < sources.length; i++) {
      if (sources[i][key] !== value) {
        continue;
      }
    }
    target[formValueKey(prefix, key)] = value;
    for (const source of sources) {
      delete source[key];
    }
  }
}

function processJsonFiles(files: Record<string, string>, prefix?: string) {
  const flattened: Record<string, Constants> = {};
  for (const [key, filePath] of Object.entries(files)) {
    flattened[key] = readAndFlattenJson(filePath, prefix);
  }
  const results = extractCommonValues(flattened);
  // try to pull out other matches and combinations for prefixing
  extractMatches(results.oneOff, 'desktop', flattened.windows, flattened.win32, flattened.macos);
  extractMatches(results.oneOff, 'mobile', flattened.android, flattened.ios);
  extractMatches(results.oneOff, 'win', flattened.windows, flattened.win32);
  extractMatches(results.oneOff, 'apple', flattened.ios, flattened.macos);
  // finally just prefix with the platforms themselves to extract the last of the keys
  for (const platform of Object.keys(flattened)) {
    extractMatches(results.oneOff, platform, flattened[platform]);
  }
  return results;
}

function main() {
  codegenConstantsFromJsonFiles({
    targetEntry: path.join(__dirname, '../src/tokens/global/index.generated.ts'),
    platformEntry: 'variants.generated',
    prefix: 'global',
    defaultPlatform: 'win32',
    android: '@fluentui-react-native/design-tokens-android/light/tokens-global.json',
    ios: '@fluentui-react-native/design-tokens-ios/light/tokens-global.json',
    macos: '@fluentui-react-native/design-tokens-macos/light/tokens-global.json',
    win32: '@fluentui-react-native/design-tokens-win32/colorful/tokens-global.json',
    windows: '@fluentui-react-native/design-tokens-windows/light/tokens-global.json',
  });
}

main();
