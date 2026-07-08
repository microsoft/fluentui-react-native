import path from 'node:path';

export type FileMetadata = {
  isTypeScript?: boolean;
  isSource?: boolean;
  isTest?: boolean;
  platformSuffix?: string;
  intermediateSuffix?: string;
};

const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', 'cts']);
const JS_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', 'cjs']);
const PLATFORM_SUFFIXES = new Set(['android', 'ios', 'win32', 'windows', 'macos']);
const INTERMEDIATE_SUFFIXES = new Set(['native', 'win']);

function testNamePart(part: string, metadata: FileMetadata): boolean {
  if (part === 'test' || part === 'spec') {
    metadata.isTest = true;
    return true;
  }
  if (PLATFORM_SUFFIXES.has(part)) {
    metadata.platformSuffix = part;
    return true;
  }
  if (INTERMEDIATE_SUFFIXES.has(part)) {
    metadata.intermediateSuffix = part;
    return true;
  }
  return false;
}

/**
 * Get the metadata for a given file. This will attempt to determine:
 * - is this a source file type?
 * - is this a test file?
 * - what is the platform suffix?
 * - what is the intermediate platform suffix? (like native, win)
 *
 * For files to be treated as having platform suffixes those should come last. E.g.:
 * - MyFile.test.android.ts - is a test file and android platform
 * - Myfile.android.ts - is an android platform file
 * - MyFile.android.test.ts - is a test file but NOT an android platform file as Jest/Metro wouldn't treat it as such.
 *
 * @param file The file path to analyze.
 * @returns The metadata for the given file.
 */
export function getFileMetadata(file: string): FileMetadata {
  const parts = path.parse(file);
  const ext = parts.ext;

  const isTypeScript = TS_EXTENSIONS.has(ext);
  const isSource = isTypeScript || JS_EXTENSIONS.has(ext);
  const result: FileMetadata = { isTypeScript, isSource };

  const nameParts = parts.name.split('.');
  if (nameParts.length > 1) {
    const last = nameParts.pop();
    if (last && testNamePart(last, result) && nameParts.length > 1 && !result.isTest) {
      const secondLast = nameParts.pop();
      testNamePart(secondLast || '', result);
    }
  }
  return result;
}
