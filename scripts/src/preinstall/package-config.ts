import fs from 'node:fs';
import path from 'node:path';

export function isJestEnabled(dir: string, manifest: Record<string, unknown>): boolean {
  if (fs.existsSync(path.join(dir, 'jest.config.js')) || fs.existsSync(path.join(dir, 'jest.config.cjs'))) {
    return true;
  }

  return Boolean(manifest.jest);
}
