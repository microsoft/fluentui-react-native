/** Owner-validated storage supplied by the trusted supervisor, never by a model or a WebDriver client. */
export interface PrivateStorage {
  read(name: string): Promise<string | undefined>;
  /** Publishes a complete record atomically. An existing name is never overwritten. */
  publish(name: string, contents: string): Promise<void>;
  /** Removes only a validated record with exactly these contents. */
  remove(name: string, expectedContents: string): Promise<boolean>;
}

export const privateRecordMaxBytes = 16 * 1024;

export function assertPrivateRecordName(name: string): void {
  if (typeof name !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(name)) {
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
