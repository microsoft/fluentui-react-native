import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ArtifactManager } from './ArtifactManager.js';

describe('ArtifactManager', () => {
  test('confines and atomically writes artifacts beneath the run root', () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-artifacts-'));
    try {
      const manager = new ArtifactManager(temporaryDirectory);
      const artifact = manager.writeSource('../story:id', '../source', '<application />');

      expect(artifact.path).toBe('tests/-story-id/-source.xml');
      expect(fs.readFileSync(path.join(temporaryDirectory, ...artifact.path.split('/')), 'utf8')).toBe('<application />');
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});
