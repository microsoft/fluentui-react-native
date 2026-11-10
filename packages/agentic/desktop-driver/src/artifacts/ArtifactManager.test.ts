import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ArtifactManager } from './ArtifactManager.js';
import { testArtifactDirectory } from './segments.js';

describe('ArtifactManager', () => {
  let temporaryDirectory: string;
  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-artifacts-'));
  });
  afterEach(() => {
    fs.rmSync(temporaryDirectory, { force: true, recursive: true });
  });

  test('confines and atomically writes artifacts beneath the run root', () => {
    const manager = new ArtifactManager(temporaryDirectory);
    const artifact = manager.writeSource('../story:id', '../source', '<application />');

    expect(artifact.path).toBe('tests/-story-id/-source.xml');
    expect(fs.readFileSync(path.join(temporaryDirectory, ...artifact.path.split('/')), 'utf8')).toBe('<application />');
  });

  test('writes into nested test directories', () => {
    const manager = new ArtifactManager(path.join(temporaryDirectory, 'run'));
    const artifact = manager.writeScreenshot(
      testArtifactDirectory('button--primary', 'opens'),
      'before',
      Buffer.from('png').toString('base64'),
    );

    expect(artifact.path).toMatch(/^tests\/button-primary\/opens-[0-9a-f]{12}\/before\.png$/);
    expect(fs.existsSync(path.join(manager.root, ...artifact.path.split('/')))).toBe(true);
  });

  test('refuses a link that leads out of the root before it creates anything outside', () => {
    const root = path.join(temporaryDirectory, 'root');
    const outside = path.join(temporaryDirectory, 'outside');
    fs.mkdirSync(path.join(root, 'tests'), { recursive: true });
    fs.mkdirSync(outside);
    fs.symlinkSync(outside, path.join(root, 'tests', 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    const manager = new ArtifactManager(root);

    expect(() => manager.writeSource(['linked', 'nested', 'deeper'], 'source', '<x />')).toThrow('outside the configured root');
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  test('refuses a link that does not resolve instead of creating its target', () => {
    const root = path.join(temporaryDirectory, 'root');
    const missing = path.join(temporaryDirectory, 'missing');
    fs.mkdirSync(path.join(root, 'tests'), { recursive: true });
    fs.symlinkSync(missing, path.join(root, 'tests', 'dangling'), process.platform === 'win32' ? 'junction' : 'dir');
    const manager = new ArtifactManager(root);

    expect(() => manager.writeSource(['dangling', 'nested'], 'source', '<x />')).toThrow('does not resolve');
    expect(fs.existsSync(missing)).toBe(false);
  });
});
