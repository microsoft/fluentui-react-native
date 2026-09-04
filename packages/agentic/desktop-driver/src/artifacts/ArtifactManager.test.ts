import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ArtifactManager } from './ArtifactManager.js';
import type { DesktopStoryRunResult } from '../authoring/results.js';

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

  test('writes machine-readable, JUnit, event, and per-test run artifacts', () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-run-artifacts-'));
    try {
      const manager = new ArtifactManager(temporaryDirectory);
      const result: DesktopStoryRunResult = {
        accessibility: {
          nameAssertions: { failed: 0, passed: 0 },
          reachabilityAssertions: { failed: 0, passed: 0 },
          roleAssertions: { failed: 0, passed: 0 },
        },
        endpoint: 'windows',
        finishedAt: '2026-09-04T12:00:01.000Z',
        manifest: { catalog: 'catalog', platform: 'platform', portable: 'portable' },
        platformName: 'windows',
        runId: 'run',
        schemaVersion: 2,
        startedAt: '2026-09-04T12:00:00.000Z',
        status: 'passed',
        summary: { failed: 0, passed: 1, quarantined: 0, selected: 1, skipped: 0 },
        targetId: 'target',
        tests: [
          {
            artifacts: [],
            durationMs: 25,
            status: 'passed',
            steps: [{ artifacts: [], durationMs: 5, index: 0, status: 'passed' }],
            storyId: 'components-button--default',
            testId: 'semantics',
            title: 'Semantics',
          },
        ],
      };

      manager.writeRunResult(result);

      expect(JSON.parse(fs.readFileSync(path.join(temporaryDirectory, 'run.json'), 'utf8'))).toMatchObject({ runId: 'run' });
      expect(fs.readFileSync(path.join(temporaryDirectory, 'events.ndjson'), 'utf8')).toContain('"type":"test"');
      expect(fs.readFileSync(path.join(temporaryDirectory, 'junit.xml'), 'utf8')).toContain('<testcase');
      const testDirectory = manager.testDirectory('components-button--default', 'semantics');
      expect(JSON.parse(fs.readFileSync(path.join(temporaryDirectory, 'tests', testDirectory, 'result.json'), 'utf8'))).toMatchObject({
        testId: 'semantics',
      });
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test('removes stale run-owned artifacts without deleting unrelated files', () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-stale-artifacts-'));
    try {
      fs.mkdirSync(path.join(temporaryDirectory, 'tests', 'stale'), { recursive: true });
      fs.writeFileSync(path.join(temporaryDirectory, 'tests', 'stale', 'result.json'), '{}');
      fs.writeFileSync(path.join(temporaryDirectory, 'run.json'), '{}');
      fs.writeFileSync(path.join(temporaryDirectory, 'keep.log'), 'keep');

      const manager = new ArtifactManager(temporaryDirectory);
      expect(fs.existsSync(path.join(temporaryDirectory, 'tests', 'stale', 'result.json'))).toBe(true);

      manager.prepareRun();

      expect(fs.existsSync(path.join(temporaryDirectory, 'tests'))).toBe(false);
      expect(fs.existsSync(path.join(temporaryDirectory, 'run.json'))).toBe(false);
      expect(fs.readFileSync(path.join(temporaryDirectory, 'keep.log'), 'utf8')).toBe('keep');
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test('uses collision-resistant directories for distinct authored ids', () => {
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-collision-artifacts-'));
    try {
      const manager = new ArtifactManager(temporaryDirectory);
      expect(manager.testDirectory('story', 'a/b')).not.toBe(manager.testDirectory('story', 'a-b'));
    } finally {
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});
