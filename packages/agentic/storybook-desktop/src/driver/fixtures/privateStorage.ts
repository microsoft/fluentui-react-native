import fs from 'node:fs';
import path from 'node:path';

import type { CreateStorybookPrivateStorage } from '../generatedManifest.js';

/** Test-only storage. Real OS ownership qualification uses the shipped private-storage adapters. */
export const createFixturePrivateStorage: CreateStorybookPrivateStorage = async (root) => {
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  return {
    async read(name) {
      const filename = path.join(root, name);
      return fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : undefined;
    },
    async publish(name, contents) {
      fs.writeFileSync(path.join(root, name), contents, { flag: 'wx', mode: 0o600 });
    },
    async remove(name, expectedContents) {
      const filename = path.join(root, name);
      if (!fs.existsSync(filename) || fs.readFileSync(filename, 'utf8') !== expectedContents) return false;
      fs.unlinkSync(filename);
      return true;
    },
  };
};
