import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

import { createLocalSocketAddress } from './localSocket.js';

const posix = process.platform === 'win32' ? test.skip : test;

describe('local socket addresses', () => {
  const originalTmpdir = process.env.TMPDIR;
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-local-socket-'));
  });
  afterEach(() => {
    if (originalTmpdir === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = originalTmpdir;
    fs.rmSync(root, { force: true, recursive: true });
  });

  test('rejects names that are not short identifiers', () => {
    expect(() => createLocalSocketAddress('../escape', 'id')).toThrow('Invalid local socket name');
    expect(() => createLocalSocketAddress('a'.repeat(33), 'id')).toThrow('Invalid local socket name');
  });

  posix('falls back to a short private directory when the temporary directory is too long to listen in', async () => {
    const long = path.join(root, 'd'.repeat(120));
    fs.mkdirSync(long);
    process.env.TMPDIR = long;
    const endpoint = createLocalSocketAddress('process', 'unused');
    const directory = path.dirname(endpoint.address);
    try {
      expect(Buffer.byteLength(endpoint.address)).toBeLessThanOrEqual(103);
      expect(endpoint.address.startsWith(long)).toBe(false);
      expect(fs.statSync(directory).mode & 0o777).toBe(0o700);
      const server = net.createServer();
      server.listen(endpoint.address);
      await once(server, 'listening');
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    } finally {
      endpoint.dispose();
      endpoint.dispose();
    }
    expect(fs.existsSync(directory)).toBe(false);
  });
});
