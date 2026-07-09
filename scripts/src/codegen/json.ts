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

/**
 * Load a JSON object into a {@link CodegenTargetFile}, flattening nested objects into prefixed constant names.
 * @param obj The JSON object to convert.
 * @param prefix Optional prefix applied to every generated constant name.
 * @param targetPath Path of the file the constants will be generated into.
 * @param description Optional header comment for the file.
 * @returns A target file populated with the flattened constants.
 */
export function jsonToCodegenTargetFile(
  obj: Record<string, unknown>,
  prefix: string | undefined,
  targetPath: string,
  description?: string,
): CodegenTargetFile {
  const target = initTargetFile(targetPath, description);
  flattenJson(obj, prefix, target.constants);
  return target;
}

/** The platforms supported by the token codegen, in priority order. */
const platforms = ['win32', 'windows', 'macos', 'android', 'ios'] as const;
export type Platform = (typeof platforms)[number];

/**
 * The platform treated as the default. Its generated file is the un-suffixed base file (`<genbase>.platform`) and its
 * values are used as the shared defaults whenever platforms disagree on a constant's value.
 */
const defaultPlatform: Platform = 'win32';

/** A set of values keyed by platform. The desktop platforms are always present; mobile platforms are optional. */
type PlatformMap<T> = {
  win32: T;
  windows: T;
  macos: T;
  android?: T;
  ios?: T;
};

/** The raw JSON token objects loaded for each platform. */
export type LoadedJsonFiles = PlatformMap<Record<string, unknown>>;

/** The in-memory {@link CodegenTargetFile} generated for each platform. */
type PlatformCodegenFiles = PlatformMap<CodegenTargetFile>;

/** Inputs describing a set of per-platform token JSON files to generate constant modules from. */
export type PlatformJsonFiles = {
  /** The raw JSON token objects, keyed by platform. win32 is treated as the default platform. */
  jsonFiles: LoadedJsonFiles;
  /** Path of the common/root entry file that receives constants shared by all platforms. */
  entry: string;
  /** Base path (without extension) used to derive the per-platform and per-subset generated file names. */
  genbase: string;
  /** Optional prefix applied to every generated constant name. */
  prefix?: string;
  /** Optional header comment for the common entry file. */
  description?: string;
};

/**
 * Convert each platform's loaded JSON into a {@link CodegenTargetFile}. The default platform (win32) is written to the
 * un-suffixed base path; every other platform gets a `.<platform>` suffix.
 * @param inputs The per-platform JSON inputs.
 * @returns The generated target file for each platform present in the inputs.
 */
function toTargetFiles(inputs: PlatformJsonFiles): PlatformCodegenFiles {
  const { jsonFiles, entry, genbase, prefix } = inputs;
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

/**
 * Generate the full set of token constant files from per-platform JSON.
 *
 * Constants common to all platforms are pulled into the common entry file, and constants shared by platform groups
 * (desktop, mobile, Windows, Apple) are factored into subset files and re-exported, so each value is declared once.
 * @param inputs The per-platform JSON inputs.
 * @returns Every {@link CodegenTargetFile} produced, ready to be written with `outputCodegenFile`.
 */
export function processPlatformJsonFiles(inputs: PlatformJsonFiles): CodegenTargetFile[] {
  const platformFiles = toTargetFiles(inputs);
  const commonEntry = initTargetFile(inputs.entry, inputs.description);
  // Pull all common values into the root entry file, removing them from the platform-specific files. win32 is the
  // default platform, so its file acts as the primary and supplies the default values for the shared re-exports.
  const required = [platformFiles.windows, platformFiles.macos];
  const desktop = [platformFiles.win32, platformFiles.windows, platformFiles.macos];
  const optional = [platformFiles.android, platformFiles.ios].filter((f): f is CodegenTargetFile => f != null);
  extractCommonFromPlatforms(commonEntry, platformFiles.win32, required, optional);
  const allFiles = [commonEntry, ...Object.values(platformFiles)];
  const subsetBase = `${inputs.genbase}.subset`;
  const ext = path.extname(inputs.entry);
  // Factor constants shared within each platform group into a subset file, re-exported from the group's members.
  extractConstsUpstream(`${subsetBase}.desktop${ext}`, `Generated subset of constants for desktop platforms.`, desktop, allFiles);
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
