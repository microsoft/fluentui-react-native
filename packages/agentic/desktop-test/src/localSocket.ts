import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type LocalSocketAddress = {
  /** A Windows named pipe, or a Unix-domain socket path inside a private directory. */
  readonly address: string;
  /** Removes the private socket directory. Call it after the server closes. */
  dispose(): void;
};

// sockaddr_un.sun_path holds 104 bytes on macOS and the BSDs and 108 on Linux, including the terminating NUL.
const unixSocketPathLimit = process.platform === 'linux' ? 107 : 103;
const namePattern = /^[a-z][a-z0-9-]{0,31}$/;
const directoryPrefix = 'furn-';

/**
 * Reserves a short local IPC address. POSIX sockets go in a new owner-only directory under the temporary directory, or
 * under `/tmp` when the temporary directory is too long for the platform's socket-path limit.
 */
export function createLocalSocketAddress(name: string, unique: string): LocalSocketAddress {
  if (!namePattern.test(name)) throw new TypeError('Invalid local socket name.');
  if (process.platform === 'win32') {
    if (!/^[\w-]{1,64}$/.test(unique)) throw new TypeError('Invalid local pipe identity.');
    return { address: `\\\\.\\pipe\\furn-${name}-${unique}`, dispose: () => undefined };
  }
  const socketName = `${name}.sock`;
  // mkdtemp appends six characters to the prefix.
  const fits = (root: string) => Buffer.byteLength(path.join(root, `${directoryPrefix}XXXXXX`, socketName)) <= unixSocketPathLimit;
  const root = [os.tmpdir(), '/tmp'].find(fits);
  if (!root)
    throw new Error(
      `Local socket paths under ${os.tmpdir()} exceed the ${unixSocketPathLimit}-byte platform limit; set TMPDIR to a shorter directory.`,
    );
  const directory = fs.mkdtempSync(path.join(root, directoryPrefix));
  fs.chmodSync(directory, 0o700);
  let disposed = false;
  return {
    address: path.join(directory, socketName),
    dispose() {
      if (disposed) return;
      disposed = true;
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}
