// Opt in on an unlocked Windows desktop with FURN_NATIVE_DRIVER_TEST=1 and run --runInBand.
// These scenarios activate the test-only Win32 fixture and send real pointer and keyboard input.
import { createHash } from 'node:crypto';

import { createDesktopDriverClient } from '../../client/DesktopDriverClient';
import type { DesktopSessionClient } from '../../client/DesktopDriverClient';
import { NativeDesktopHost } from '../../hosts/native/NativeDesktopHost';
import type { CaptureResult } from '../../operations/capture';
import { createDesktopDriverServer } from '../../server/createDesktopDriverServer';
import { fixtureExecutable, helperArtifact, waitFor } from './win32FixtureSupport';

jest.setTimeout(240_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;
const activate = { automationId: '1001' };
const field = { automationId: '1002' };
const checkbox = { automationId: '1003' };
const status = { automationId: '1004' };

async function withFixture(body: (session: DesktopSessionClient) => Promise<void>, args: string[] = []): Promise<void> {
  const title = `furn-operations-${process.pid}-${Date.now()}`;
  const host = new NativeDesktopHost({
    application: {
      arguments: ['--title', title, ...args],
      executablePath: await fixtureExecutable(),
      windowTitle: title,
    },
    artifact: await helperArtifact(),
    endpoint: 'win32',
  });
  const server = await createDesktopDriverServer({
    targets: [{ endpoint: 'win32', host, id: 'fixture', launchModes: ['launch'], platformName: 'windows', renderer: 'paper' }],
  });
  try {
    const session = await createDesktopDriverClient({ url: server.url }).newSession({
      alwaysMatch: { 'furn:launchMode': 'launch', 'furn:target': 'fixture', platformName: 'windows' },
    });
    await body(session);
  } finally {
    await server.close();
  }
}

async function expectStatus(session: DesktopSessionClient, count: number): Promise<void> {
  expect((await session.check({ expect: { name: `Activated ${count} times` }, find: status, waitMs: 2_000 })).result.status).toBe('passed');
}

async function readImage(session: DesktopSessionClient, capture: CaptureResult): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let offset = 0;
  for (;;) {
    const page = (await session.artifact({ artifact: capture.artifact, length: 1024, offset })).result;
    expect(page).toMatchObject({ bytes: capture.bytes, offset, sha256: capture.sha256 });
    const bytes = Buffer.from(page.data, 'base64');
    expect(bytes.length).toBeGreaterThan(0);
    chunks.push(bytes);
    if (page.next === undefined) {
      break;
    }
    expect(page.next).toBe(offset + bytes.length);
    offset = page.next;
  }
  const png = Buffer.concat(chunks);
  expect(png.length).toBe(capture.bytes);
  expect(createHash('sha256').update(png).digest('hex')).toBe(capture.sha256);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(capture.width);
  expect(png.readUInt32BE(20)).toBe(capture.height);
  return png;
}

describe('Windows agent operations against the Win32 fixture', () => {
  windowsTest('activates, physically clicks with a hit-tested proof, types, clears, and refuses ambiguous selectors', async () => {
    await withFixture(async (session) => {
      const { result: found } = await session.find(activate);
      expect(found.outcome).toBe('unique');
      const proof = { ref: found.matches[0].ref, sample: found.sample.id };
      expect((await session.act({ action: 'activate', ...proof })).result.mechanism).toBe('accessibility');
      await expectStatus(session, 1);
      expect((await session.act({ action: 'click', ...proof })).result.mechanism).toBe('physical-pointer');
      await expectStatus(session, 2);

      await session.act({ action: 'type', find: field, text: 'Windows operation text' });
      expect((await session.check({ expect: { value: 'Windows operation text' }, find: field, waitMs: 2_000 })).result.status).toBe(
        'passed',
      );
      await session.act({ action: 'clear', find: field });
      expect((await session.check({ expect: { value: '' }, find: field })).result.status).toBe('passed');
      await expect(session.act({ action: 'activate', find: { role: 'button' } })).rejects.toMatchObject({
        data: { mutation: { disposition: 'rejected', effect: 'none' }, reason: 'selector-not-unique' },
      });
      await expectStatus(session, 2);
      expect(JSON.stringify((await session.journal()).result)).not.toContain('Windows operation text');
    });
  });

  windowsTest('sequences two actions and a check, stops at failure, and bounds a waiting check', async () => {
    await withFixture(async (session) => {
      const { result } = await session.sequence({
        steps: [
          { act: { action: 'activate', find: activate } },
          { act: { action: 'activate', find: activate } },
          { check: { expect: { name: 'Activated 2 times' }, find: status, waitMs: 2_000 } },
        ],
      });
      expect(result).toMatchObject({ status: 'completed', steps: [{}, {}, { check: { status: 'passed' } }] });
      const stopped = await session.sequence({
        steps: [{ check: { expect: { name: 'Not the status' }, find: status } }, { act: { action: 'activate', find: activate } }],
      });
      expect(stopped.result).toMatchObject({ status: 'stopped', stoppedAt: 0 });
      await expectStatus(session, 2);
      const waiting = (await session.check({ expect: { name: 'Never appears' }, find: status, waitMs: 300 })).result;
      expect(waiting).toMatchObject({ last: 'failed', status: 'timed-out' });
      expect(waiting.attempts).toBeGreaterThan(1);
      expect(waiting.elapsedMs).toBeGreaterThanOrEqual(300);
    });
  });

  windowsTest('captures a window and status crop and pages each complete PNG with its hash and scaled dimensions', async () => {
    await withFixture(async (session) => {
      const found = (await session.find(status)).result;
      const ref = found.matches[0].ref;
      const observation = (await session.observe({ facts: ['geometry'], format: 'nodes', view: 'all', within: ref })).result;
      const rect = observation.nodes![0].rect!;
      const window = (await session.capture()).result;
      const element = (await session.capture({ ref })).result;
      await readImage(session, window);
      await readImage(session, element);
      expect(window.scope).toBe('window');
      expect(element).toMatchObject({ ref, scaleFactor: window.scaleFactor, scope: 'element' });
      // The public observation rounds geometry to whole DIPs; capture retains physical pixels.
      expect(Math.abs(element.width - rect.width * element.scaleFactor)).toBeLessThanOrEqual(element.scaleFactor / 2 + 0.02);
      expect(Math.abs(element.height - rect.height * element.scaleFactor)).toBeLessThanOrEqual(element.scaleFactor / 2 + 0.02);
      expect(element.width).toBeLessThan(window.width);
      expect(element.height).toBeLessThan(window.height);
      console.info(`Win32 operations capture scale: ${element.scaleFactor}; crop: ${element.width}x${element.height}`);
    });
  });

  windowsTest('publishes UIA actions, performs Invoke and Toggle, and excludes names from the journal', async () => {
    await withFixture(async (session) => {
      const nodes = (await session.observe({ facts: ['actions'], format: 'nodes', view: 'all' })).result.nodes!;
      expect(nodes.find((node) => node.automationId === '1001')?.actions).toContain('Invoke');
      expect(nodes.find((node) => node.automationId === '1003')?.actions).toContain('Toggle');
      expect(nodes.find((node) => node.automationId === '1004')).toMatchObject({ role: 'text' });
      await session.act({ action: 'perform', find: activate, name: 'Invoke' });
      await expectStatus(session, 1);
      await session.act({ action: 'perform', find: checkbox, name: 'Toggle' });
      expect((await session.check({ expect: { checked: true }, find: checkbox, waitMs: 2_000 })).result.status).toBe('passed');
      await expect(session.act({ action: 'perform', find: activate, name: 'Unpublished action' })).rejects.toMatchObject({
        data: { mutation: { disposition: 'rejected', effect: 'none' }, reason: 'action-not-published' },
      });
      await expectStatus(session, 1);
      expect(JSON.stringify((await session.journal()).result)).not.toMatch(/Invoke|Toggle|Unpublished action/);
    });
  });

  windowsTest('quarantines an unsettled named UIA action before another operation can dispatch', async () => {
    await withFixture(
      async (session) => {
        await expect(session.act({ action: 'perform', find: { automationId: '1009' }, name: 'Invoke' })).rejects.toMatchObject({
          data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true } },
        });
        await expect(session.act({ action: 'perform', find: activate, name: 'Invoke' })).rejects.toMatchObject({
          data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: true }, reason: 'target-quarantined' },
        });
        await waitFor(
          'the abandoned action to settle exactly once',
          async () => {
            try {
              return (await session.check({ expect: { name: 'Stuck action applied 1 times' }, find: status })).result.status === 'passed';
            } catch (error) {
              // UIA can serialize reads behind the stuck provider. A failed read does not resolve its mutation.
              if ((error as { data?: { nativeCode?: string } }).data?.nativeCode !== 'automation-failed') {
                throw error;
              }
              return false;
            }
          },
          { timeoutMs: 10_000 },
        );
        await expect(session.act({ action: 'activate', find: activate })).rejects.toMatchObject({
          data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: true }, reason: 'target-quarantined' },
        });
      },
      ['--stuck-ms', '8000'],
    );
  });
});
