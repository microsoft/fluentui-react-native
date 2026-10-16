import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import { ArtifactManager } from './ArtifactManager.js';
import { captureDesktopFailureEvidence, maximumSecondaryWindowEvidence } from './failureEvidence.js';

type StubOptions = {
  closed?: readonly string[];
  handles: readonly string[];
  screenshot?: boolean;
  windowEvents?: boolean;
};

function createStubSession({ closed = [], handles, screenshot = true, windowEvents = true }: StubOptions) {
  const calls: string[] = [];
  let current = handles[0];
  const session = {
    capabilities: { 'furn:features': { screenshot } },
    getPageSource: async () => {
      calls.push(`source:${current}`);
      return `<window id="${current}"/>`;
    },
    getTree: async () => {
      calls.push(`tree:${current}`);
      return [];
    },
    getWindowEvents: async () => {
      calls.push('windowEvents');
      return { events: [], observing: true, source: 'test' };
    },
    getWindowHandle: async () => current,
    getWindowHandles: async () => [...handles],
    recordsWindowEvents: () => windowEvents,
    switchToWindow: async (handle: string) => {
      if (closed.includes(handle)) {
        throw new Error(`Window ${handle} closed.`);
      }
      calls.push(`switch:${handle}`);
      current = handle;
      return null;
    },
    takeScreenshot: async () => {
      calls.push(`screenshot:${current}`);
      return Buffer.from('png').toString('base64');
    },
  };
  return { calls, current: () => current, session: session as unknown as DesktopSessionClient };
}

describe('captureDesktopFailureEvidence', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-evidence-'));
  });
  afterEach(() => {
    fs.rmSync(root, { force: true, recursive: true });
  });

  test('captures window events first, then the current and secondary windows, and restores the current window', async () => {
    const stub = createStubSession({ closed: ['popup-closed'], handles: ['main', 'popup', 'popup-closed'] });
    const evidence = await captureDesktopFailureEvidence(stub.session, new ArtifactManager(root), 'story-test');

    expect(stub.calls[0]).toBe('windowEvents');
    expect(evidence.artifacts.map(({ name }) => name)).toEqual([
      'failure-window-events',
      'failure',
      'failure-source',
      'failure-tree',
      'failure-window-1',
      'failure-window-1-source',
    ]);
    expect(stub.calls).toContain('source:popup');
    expect(evidence.errors).toEqual([expect.stringContaining('failure-window-2 (popup-closed): Window popup-closed closed.')]);
    expect(stub.current()).toBe('main');
  });

  test('omits unsupported evidence and bounds secondary windows', async () => {
    const handles = ['main', ...Array.from({ length: maximumSecondaryWindowEvidence + 2 }, (_, index) => `popup-${index}`)];
    const stub = createStubSession({ handles, screenshot: false, windowEvents: false });
    const evidence = await captureDesktopFailureEvidence(stub.session, new ArtifactManager(root), 'story-test');

    const names = evidence.artifacts.map(({ name }) => name);
    expect(names).not.toContain('failure-window-events');
    expect(names).not.toContain('failure');
    expect(names.filter((name) => name.endsWith('-source'))).toHaveLength(maximumSecondaryWindowEvidence + 1);
    expect(evidence.errors).toEqual([
      `window handles: captured ${maximumSecondaryWindowEvidence} of ${maximumSecondaryWindowEvidence + 2} secondary windows.`,
    ]);
    expect(stub.current()).toBe('main');
  });
});
