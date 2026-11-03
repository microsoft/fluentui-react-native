/** Owner-validated storage supplied by the trusted supervisor, never by a model or a WebDriver client. */
export interface PrivateStorage {
  read(name: string): Promise<string | undefined>;
  /** Publishes a complete record atomically. An existing name is never overwritten. */
  publish(name: string, contents: string): Promise<void>;
  /** Removes only a validated record with exactly these contents. */
  remove(name: string, expectedContents: string): Promise<boolean>;
}

export const privateRecordMaxBytes = 16 * 1024;

// Windows strips a trailing dot and aliases these device names, with or without an extension, to devices rather than
// files. One rule for every platform keeps a record name portable.
const windowsDeviceNames = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

export function assertPrivateRecordName(name: string): void {
  if (
    typeof name !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(name) ||
    name.endsWith('.') ||
    windowsDeviceNames.test(name.split('.')[0])
  ) {
    throw new TypeError('A private record name must be a single bounded ASCII filename.');
  }
}

export function assertPrivateRecordContents(contents: string): void {
  if (
    typeof contents !== 'string' ||
    Buffer.byteLength(contents, 'utf8') > privateRecordMaxBytes ||
    Buffer.from(contents, 'utf8').toString('utf8') !== contents
  ) {
    throw new TypeError('A private record must be a UTF-8 string of at most 16 KiB.');
  }
}
