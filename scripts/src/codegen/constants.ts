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
 * Find the constant names whose values are identical across a set of files.
 *
 * A key is considered "matching" when its value in `primary` equals the value of the same key in every `required`
 * file. When `optional` files are provided, a match additionally requires that each optional file either has the same
 * value or omits the key entirely (an optional file must never disagree on the value).
 * @param primary The file whose keys are used as the candidate set and whose values are compared against.
 * @param required Files that must all share the same value for a key to match.
 * @param optional Files that may omit a key, but must not contradict its value when present.
 * @returns The names of the constants that match across the provided files.
 */
export function findMatchingConstants(
  primary: CodegenTargetFile,
  required: CodegenTargetFile[],
  optional: CodegenTargetFile[] = [],
): string[] {
  const matchingKeys: string[] = [];
  if (required.length === 0) {
    return matchingKeys;
  }
  for (const key of Object.keys(primary.constants)) {
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

/** Returns true when `key` is present in every file of `srcSet`. */
function keysExist(key: string, srcSet: CodegenTargetFile[]): boolean {
  for (const src of srcSet) {
    if (!(key in src.constants)) {
      return false;
    }
  }
  return true;
}

/** Returns true when `key` has the exact value `value` in every file of `srcSet`. */
function valuesMatch(key: string, value: ConstValue, srcSet: CodegenTargetFile[]): boolean {
  for (const src of srcSet) {
    if (src.constants[key] !== value) {
      return false;
    }
  }
  return true;
}

/** Returns true when `key` is absent from every file of `srcSet`. */
function keysMissing(key: string, srcSet: CodegenTargetFile[]): boolean {
  for (const src of srcSet) {
    if (key in src.constants) {
      return false;
    }
  }
  return true;
}

/** Returns the keys of `primary` that also exist (with any value) in every one of the `required` files. */
function findSharedKeys(primary: CodegenTargetFile, required: CodegenTargetFile[]): Set<string> {
  const sharedKeys = new Set<string>();
  for (const key of Object.keys(primary.constants)) {
    if (keysExist(key, required)) {
      sharedKeys.add(key);
    }
  }
  return sharedKeys;
}

/** Build a new constants map containing only the given keys, copying their values from `src`. */
function constsFromKeys(src: CodegenTargetFile, keys: string[]): Constants {
  const result: Constants = {};
  for (const key of keys) {
    result[key] = src.constants[key];
  }
  return result;
}

/** Delete the given keys from a file's constants map, in place. */
function deleteKeys(src: CodegenTargetFile, keys: string[]): void {
  for (const key of keys) {
    delete src.constants[key];
  }
}

/**
 * Pull values that are common across platforms up into a shared/common file.
 *
 * Any key whose value matches across `primary` and the other platform files (per {@link findMatchingConstants}) is
 * moved into `targetFile` and removed from every platform file. In addition, keys that still exist on every platform
 * but whose values differ are re-exported from `targetFile` using the `primary` (win32) value as the default.
 * @param targetFile The shared/common file that receives the extracted constants and default re-exports.
 * @param primary The default platform's file (win32); its values are used as the shared defaults.
 * @param required Platform files that must all agree with `primary` for a constant to be treated as common.
 * @param optional Platform files that may omit a constant but must not contradict its value when present.
 */
export function extractCommonFromPlatforms(
  targetFile: CodegenTargetFile,
  primary: CodegenTargetFile,
  required: CodegenTargetFile[],
  optional: CodegenTargetFile[] = [],
) {
  const matchingKeys = findMatchingConstants(primary, required, optional);
  const allPlatforms = [primary, ...required, ...optional];
  const commonConsts = targetFile.constants;
  for (const key of matchingKeys) {
    commonConsts[key] = primary.constants[key];
    for (const srcFile of allPlatforms) {
      delete srcFile.constants[key];
    }
  }

  const merged = [...required, ...optional];
  const sharedKeys = findSharedKeys(primary, merged);
  targetFile.reExports ??= {};
  targetFile.reExports[getImportExportPath(targetFile.filePath, primary.filePath)] = {
    values: sharedKeys,
    description: `Platform specific constants that are shared across all platforms.`,
  };
}

/** Type guard: true when the array is non-empty and every entry is defined. */
function areAllValid(srcFiles: (CodegenTargetFile | undefined)[]): srcFiles is CodegenTargetFile[] {
  return srcFiles.length > 0 && !srcFiles.some((f) => f == null);
}

/**
 * Pull constants that are shared across a subset of files up into a new upstream file and re-export them from each
 * source file. This is used to factor per-platform-group subsets (e.g. desktop, mobile, Windows, Apple) out of the
 * individual platform files so each value is declared exactly once.
 *
 * The upstream file is always created (and pushed to `outputs`) so that the set of generated files is stable between
 * runs, even when there are no shared constants to extract.
 * @param targetPath Path of the upstream file to create.
 * @param description Optional header comment for the upstream file.
 * @param srcFiles The source files to factor shared constants out of; all must be defined for extraction to occur.
 * @param outputs Accumulator that the newly created upstream file is appended to.
 * @returns The upstream file when constants were extracted, otherwise `undefined`.
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
