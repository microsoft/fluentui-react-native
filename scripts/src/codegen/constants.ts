import type { ConstValue, Constants, CodegenTargetFile } from './types.ts';
import { getImportExportPath, initTargetFile, writeComment } from './helpers.ts';

/**
 * Write out a single const export statement for a given name and value. The value can be a string, number, or boolean.
 * @param name The name of the constant to export.
 * @param value The value of the constant to export.
 * @returns The generated export statement as a string.
 */
export function writeExportConst(name: string, value: ConstValue): string {
  if (typeof value === 'string') {
    return `export const ${name} = '${value}';\n`;
  } else if (typeof value === 'number') {
    return `export const ${name} = ${value};\n`;
  } else {
    return `export const ${name} = ${value ? 'true' : 'false'};\n`;
  }
}

/**
 * Write out const exports for a given set of constants, optionally including a comment description.
 * @param constants The constants to be exported.
 * @param description An optional description to include as a comment.
 * @returns The generated export statements as a string.
 */
export function writeConstExports(constants: Constants, description?: string): string {
  let content = '';
  if (description) {
    content += writeComment(description, '', true);
  }
  const keys = Object.keys(constants).sort();
  for (const key of keys) {
    const value = constants[key];
    content += writeExportConst(key, value);
  }
  return content;
}

/**
 * Return any keys that match across the set of source files.
 * @param srcFiles The source files to check for matching constants.
 * @returns An array of constant names that match across all source files.
 */
export function findMatchingConstants(
  primary: CodegenTargetFile,
  required: CodegenTargetFile[],
  optional: CodegenTargetFile[] = [],
  keysToCheck?: string[],
): string[] {
  const matchingKeys: string[] = [];
  if (required.length === 0) {
    return matchingKeys;
  }
  const baseKeys = keysToCheck ?? Object.keys(primary.constants);
  for (const key of baseKeys) {
    const value = primary.constants[key];
    let match = valuesMatch(key, value, required);
    if (optional.length > 0 && match) {
      if (!valuesMatch(key, value, optional) && !keysMissing(key, optional)) {
        match = false;
      }
    }
    if (match) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
}

function keysExist(key: string, srcSet: CodegenTargetFile[]): boolean {
  for (const src of srcSet) {
    if (!(key in src.constants)) {
      return false;
    }
  }
  return true;
}

function valuesMatch(key: string, value: ConstValue, srcSet: CodegenTargetFile[]): boolean {
  for (const src of srcSet) {
    if (src.constants[key] !== value) {
      return false;
    }
  }
  return true;
}

function keysMissing(key: string, srcSet: CodegenTargetFile[]): boolean {
  for (const src of srcSet) {
    if (key in src.constants) {
      return false;
    }
  }
  return true;
}

function findSharedKeys(primary: CodegenTargetFile, required: CodegenTargetFile[]): [Set<string>, string[]] {
  const sharedKeys = new Set<string>();
  const nonSharedKeys = new Set<string>();
  for (const key of Object.keys(primary.constants)) {
    if (keysExist(key, required)) {
      sharedKeys.add(key);
    } else {
      nonSharedKeys.add(key);
    }
  }
  // go through the other files to look for additional keys that may not be in primary
  for (const src of required) {
    for (const key of Object.keys(src.constants)) {
      if (!sharedKeys.has(key) && !nonSharedKeys.has(key)) {
        nonSharedKeys.add(key);
      }
    }
  }
  return [sharedKeys, Array.from(nonSharedKeys)];
}

function constsFromKeys(src: CodegenTargetFile, keys: string[]): Constants {
  const result: Constants = {};
  for (const key of keys) {
    result[key] = src.constants[key];
  }
  return result;
}

function deleteKeys(src: CodegenTargetFile, keys: string[]): void {
  for (const key of keys) {
    delete src.constants[key];
  }
}

/**
 * Used to pull things upstream to a common file. This will remove the matching keys from the (likely platform specific)
 * source files and add them to the target file.
 * @param targetFile The target file to which the matching constants will be added.
 * @param required The source files from which the matching constants will be removed.
 */
export function extractCommonFromPlatforms(
  targetFile: CodegenTargetFile,
  defaultPlatform: CodegenTargetFile,
  required: CodegenTargetFile[],
  optional: CodegenTargetFile[] = [],
) {
  const matchingKeys = findMatchingConstants(defaultPlatform, required, optional);
  const allPlatforms = [defaultPlatform, ...required, ...optional];
  const commonConsts = (targetFile.constants ??= {});
  for (const key of matchingKeys) {
    commonConsts[key] = defaultPlatform.constants[key];
    for (const srcFile of allPlatforms) {
      delete srcFile.constants[key];
    }
  }

  const merged = [...required, ...optional];
  const [sharedKeys, _nonSharedKeys] = findSharedKeys(defaultPlatform, merged);
  targetFile.reExports ??= {};
  targetFile.reExports[getImportExportPath(targetFile.filePath, defaultPlatform.filePath)] = {
    values: sharedKeys,
    description: `Platform specific constants that are shared across all platforms.`,
  };
}

function areAllValid(srcFiles: (CodegenTargetFile | undefined)[]): srcFiles is CodegenTargetFile[] {
  return srcFiles.length > 0 && !srcFiles.some((f) => f == null);
}

/**
 * Pull out common values to an upstream file and re-export them from the source files.
 * @param targetPath the upstream file to which the matching constants will be added
 * @param description an optional description for the upstream file
 * @param srcFiles The source files from which the matching constants will be removed and added as a re-export
 */
export function extractConstsUpstream(
  targetPath: string,
  description: string | undefined,
  srcFiles: (CodegenTargetFile | undefined)[],
  outputs: CodegenTargetFile[],
): CodegenTargetFile | undefined {
  if (!areAllValid(srcFiles)) {
    return undefined;
  }

  // create the file, regardless of matches, so that file existence doesn't change between runs.
  const upstream = initTargetFile(targetPath, description);
  outputs.push(upstream);

  const [primary, ...required] = srcFiles;
  const matchingKeys = findMatchingConstants(primary, required);
  if (matchingKeys.length === 0) {
    return undefined;
  }

  // now add a re-export from the upstream file and remove it from the source files
  upstream.constants = constsFromKeys(primary, matchingKeys);
  for (const srcFile of srcFiles) {
    const exportSrc = getImportExportPath(srcFile.filePath, upstream.filePath);
    srcFile.reExports ??= {};
    srcFile.reExports[exportSrc] = { values: new Set<string>(matchingKeys) };
    deleteKeys(srcFile, matchingKeys);
  }
  return upstream;
}
