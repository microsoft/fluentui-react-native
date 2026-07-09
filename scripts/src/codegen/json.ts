import { extractCommonFromPlatforms, extractConstsUpstream } from './constants.ts';
import { initTargetFile } from './helpers.ts';
import type { Constants, CodegenTargetFile } from './types.ts';
import path from 'node:path';

/**
 * Form a new key by either:
 * - returning the key as-is if no prefix is provided
 * - returning the prefix + key with the first letter of the key capitalized if a prefix is provided
 * @param prefix optional prefix to prepend to the key
 * @param key the key to be modified
 * @returns the new key
 */
export function formValueKey(prefix: string | undefined, key: string): string {
  if (!prefix) {
    return key;
  }
  return `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

/**
 * Flatten a JSON object into a single-level object, with keys optionally prefixed. This function is recursive and will traverse nested objects.
 * @param obj the JSON object to flatten
 * @param prefix an optional prefix to prepend to each key
 * @param collection the collection to store the flattened constants
 * @param variant the variant name for the constants
 * @returns void
 */
export function flattenJson(obj: Record<string, unknown>, prefix: string | undefined, collection: Constants) {
  if (Array.isArray(obj)) {
    console.warn(`encountered an array at ${prefix} while flattening, not supported right now`);
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    const newKey = formValueKey(prefix, key);
    if (typeof value === 'object' && value !== null) {
      flattenJson(value as Record<string, unknown>, newKey, collection);
    } else {
      collection[newKey] = value as string | number | boolean;
    }
  }
}

export function jsonToCodegenTargetFile(
  obj: Record<string, unknown>,
  prefix: string | undefined,
  targetPath: string,
  description?: string,
): CodegenTargetFile {
  const target = initTargetFile(targetPath, description);
  const constants: Constants = (target.constants ??= {});
  flattenJson(obj, prefix, constants);
  return target;
}

const platforms = ['win32', 'windows', 'macos', 'android', 'ios'] as const;
export type Platform = (typeof platforms)[number];

export type LoadedJsonFiles = {
  win32: Record<string, unknown>;
  windows: Record<string, unknown>;
  macos: Record<string, unknown>;
  android?: Record<string, unknown>;
  ios?: Record<string, unknown>;
};

type PlatformCodegenFiles = {
  win32: CodegenTargetFile;
  windows: CodegenTargetFile;
  macos: CodegenTargetFile;
  android?: CodegenTargetFile;
  ios?: CodegenTargetFile;
};

export type PlatformJsonFiles = {
  jsonFiles: LoadedJsonFiles;
  defaultPlatform?: Platform;
  entry: string;
  genbase: string;
  prefix?: string;
  description?: string;
};

function toTargetFiles(inputs: PlatformJsonFiles): PlatformCodegenFiles {
  const { jsonFiles, defaultPlatform = 'win32', entry, genbase, prefix } = inputs;
  const extname = path.extname(entry);
  const result = {} as PlatformCodegenFiles;
  const platformBase = `${genbase}.platform`;
  for (const platform of Object.keys(jsonFiles) as Platform[]) {
    const loadedJson = jsonFiles[platform];
    if (loadedJson != null) {
      const targetPath = (platform === defaultPlatform ? platformBase : `${platformBase}.${platform}`) + extname;
      const description = `Generated ${platform} specific constants.`;
      result[platform] = jsonToCodegenTargetFile(loadedJson, prefix, targetPath, description);
    }
  }
  return result;
}

export function processPlatformJsonFiles(inputs: PlatformJsonFiles): CodegenTargetFile[] {
  const platformFiles = toTargetFiles(inputs);
  const commonEntry = initTargetFile(inputs.entry, inputs.description);
  // pull all common values to the root file, removing them from the platform specific files
  const required = [platformFiles.windows, platformFiles.macos];
  const optional = [platformFiles.android, platformFiles.ios].filter((f): f is CodegenTargetFile => f != null);
  extractCommonFromPlatforms(commonEntry, platformFiles.win32, required, optional);
  const allFiles = [commonEntry, ...Object.values(platformFiles)];
  const subsetBase = `${inputs.genbase}.subset`;
  const ext = path.extname(inputs.entry);
  extractConstsUpstream(`${subsetBase}.desktop${ext}`, `Generated subset of constants for desktop platforms.`, required, allFiles);
  extractConstsUpstream(`${subsetBase}.mobile${ext}`, `Generated subset of constants for mobile platforms.`, optional, allFiles);
  extractConstsUpstream(
    `${subsetBase}.win${ext}`,
    `Generated subset of constants for Windows platforms.`,
    [platformFiles.win32, platformFiles.windows],
    allFiles,
  );
  extractConstsUpstream(
    `${subsetBase}.apple${ext}`,
    `Generated subset of constants for Apple platforms.`,
    [platformFiles.macos, platformFiles.ios],
    allFiles,
  );
  return allFiles;
}
