// Native contract for the Windows helper against a plain Win32 application. It builds the test-only fixture in
// fixtures/win32 on demand into the external native cache (never at install time) and drives it through the real
// helper over the wire protocol. Opt in with FURN_NATIVE_DRIVER_TEST=1 and run it serially on an interactive
// desktop: yarn test --runInBand win32Fixture. Only the first scenario shows a window (topmost, non-activating, for
// about a second); the others keep it off every monitor, and none of them steals the foreground.
import { NativeHostProcess } from '../../hosts/native/NativeHostProcess';
import type { NativeHostRequestResult } from '../../hosts/native/NativeHostProcess';
import type { NativeObserveRequest } from '../../host/types';
import { parseNativeObservation } from '../../protocol/observation';
import { delay } from '../filesystem';
import type { NativeHostEventMessage } from '../types';
import { fixtureExecutable, helperArtifact, required, waitFor } from './win32FixtureSupport';

jest.setTimeout(240_000);

const windowsTest = process.platform === 'win32' && process.env.FURN_NATIVE_DRIVER_TEST === '1' ? test : test.skip;

const megabyte = 1024 * 1024;

type Rect = { height: number; width: number; x: number; y: number };
type Lease = { id: string; processId: number };
type WindowInfo = { id: string; rect: Rect; title: string };
type ElementInfo = { automationId?: string; id: string; name?: string; rect: Rect; role: string };
type Retention = { privateBytes: number; retainedElementLimit: number; retainedElements: number; workingSetBytes: number };
type WindowEventReport = {
  events: { descriptor?: { title?: string }; notification: string; windowId?: string }[];
  observing: boolean;
  retention: Retention;
  source: string;
};
type Attempt = { code?: string; message?: string; ms: number; ok: boolean };
type Capture = { height: number; mimeType: string; width: number };

function expectPng(response: NativeHostRequestResult<Capture>): void {
  expect(response.binary).toBeDefined();
  const png = Buffer.from(response.binary ?? []);
  expect(response.result.mimeType).toBe('image/png');
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(response.result.width);
  expect(png.readUInt32BE(20)).toBe(response.result.height);
}

// One helper process per scenario: the settlement quarantine is process wide, so scenarios cannot share it.
class FixtureSession {
  readonly events: NativeHostEventMessage[];
  readonly host: NativeHostProcess;
  readonly lease: Lease;
  readonly main: WindowInfo;
  readonly title: string;

  private constructor(host: NativeHostProcess, lease: Lease, main: WindowInfo, title: string, events: NativeHostEventMessage[]) {
    this.host = host;
    this.lease = lease;
    this.main = main;
    this.title = title;
    this.events = events;
  }

  static async start(name: string, { args = [], onscreen = false }: { args?: string[]; onscreen?: boolean } = {}): Promise<FixtureSession> {
    const title = `furn-fixture-${name}-${process.pid}-${Date.now()}`;
    const executablePath = await fixtureExecutable();
    const host = await NativeHostProcess.start({ artifact: await helperArtifact() });
    const events: NativeHostEventMessage[] = [];
    host.on('event', (event) => events.push(event));
    try {
      const { result: lease } = await host.request<Lease>('launch', {
        application: {
          arguments: ['--title', title, '--offscreen', onscreen ? '0' : '1', ...args],
          executablePath,
          windowTitle: title,
        },
        launchTimeoutMs: 20_000,
      });
      const { result: windows } = await host.request<WindowInfo[]>('windows', { lease });
      return new FixtureSession(host, lease, required(windows[0], 'the fixture to open a window'), title, events);
    } catch (error) {
      await host.dispose().catch(() => undefined);
      throw error;
    }
  }

  async call<T = unknown>(command: string, params?: unknown): Promise<T> {
    return (await this.host.request<T>(command, params)).result;
  }

  async attempt(command: string, params?: unknown): Promise<Attempt> {
    const started = Date.now();
    try {
      await this.host.request(command, params);
      return { ms: Date.now() - started, ok: true };
    } catch (error) {
      const failure = error as { code?: string; message?: string };
      return { code: failure.code, message: failure.message, ms: Date.now() - started, ok: false };
    }
  }

  windows(): Promise<WindowInfo[]> {
    return this.call<WindowInfo[]>('windows', { lease: this.lease });
  }

  tree(windowId: string): Promise<ElementInfo[]> {
    return this.call<ElementInfo[]>('tree', { windowId });
  }

  find(windowId: string, strategy: string, value: string): Promise<ElementInfo[]> {
    return this.call<ElementInfo[]>('find', { root: { windowId }, selector: { strategy, value } });
  }

  async control(windowId: string, automationId: string): Promise<ElementInfo> {
    return required((await this.find(windowId, 'accessibility id', automationId))[0], `control ${automationId}`);
  }

  async press(element: ElementInfo): Promise<void> {
    await this.call('click', { elementId: element.id, mode: 'accessibility' });
  }

  async click(automationId: string, windowId = this.main.id): Promise<void> {
    await this.press(await this.control(windowId, automationId));
  }

  async status(): Promise<string> {
    return (await this.control(this.main.id, '1004')).name ?? '';
  }

  eventReport(): Promise<WindowEventReport> {
    return this.call<WindowEventReport>('windowEvents', { lease: this.lease });
  }

  async dispose(): Promise<void> {
    await this.host.request('closeApplication', { lease: this.lease }).catch(() => undefined);
    await this.host.dispose().catch(() => undefined);
  }
}

describe('Windows helper against a plain Win32 application', () => {
  windowsTest('observes, drives, hit tests, and captures a plain Win32 window', async () => {
    const session = await FixtureSession.start('basic', { onscreen: true });
    try {
      const { main } = session;
      expect(main.title).toBe(session.title);
      expect(main.rect.width).toBeCloseTo(460, 0);
      expect(main.rect.height).toBeCloseTo(300, 0);

      const tree = await session.tree(main.id);
      const control = (automationId: string) =>
        required(
          tree.find((element) => element.automationId === automationId),
          automationId,
        );
      expect(control('1001')).toMatchObject({ name: 'Activate', role: 'button' });
      expect(control('1002')).toMatchObject({ name: 'Name:', role: 'textbox' });
      expect(control('1003')).toMatchObject({ name: 'Enabled', role: 'checkbox' });
      expect(control('1004')).toMatchObject({ name: 'Ready', role: 'text' });
      expect(tree.filter((element) => element.role === 'menuitem').map((element) => element.name)).toEqual(
        expect.arrayContaining(['File', 'Help']),
      );

      expect(await session.find(main.id, 'tag name', 'checkbox')).toHaveLength(1);
      expect(await session.find(main.id, 'link text', 'Activate')).toHaveLength(1);
      expect(await session.find(main.id, 'partial link text', 'Rename')).toHaveLength(1);
      expect(await session.find(main.id, '-furn:text', 'Ready')).toHaveLength(1);

      // A successful accessibility click means the provider accepted the request; the application applies it later.
      await session.click('1001');
      await waitFor('the click to reach the application', async () => (await session.status()) === 'Activated 1 times');

      // Another application may cover part of the window, in which case the hit is reported as an external window.
      let identified = 0;
      for (const automationId of ['1001', '1002', '1003', '1004', '1005', '1007']) {
        const target = control(automationId);
        const hit = await session.call<ElementInfo | null>('hitTest', {
          windowId: main.id,
          x: target.rect.x + target.rect.width / 2,
          y: target.rect.y + target.rect.height / 2,
        });
        if (hit?.id === target.id) {
          identified += 1;
        } else {
          expect(hit).toMatchObject({ name: 'External desktop window', role: 'window' });
        }
      }
      expect(identified).toBeGreaterThan(0);
      expect(await session.call('hitTest', { windowId: main.id, x: 100_000, y: 100_000 })).toBeNull();
      expect(await session.call('activeElement', { windowId: main.id })).toBeNull();

      expectPng(await session.host.request<Capture>('captureWindow', { windowId: main.id }));
      expectPng(await session.host.request<Capture>('captureElement', { elementId: control('1001').id }));
    } finally {
      await session.dispose();
    }
  });

  windowsTest('follows a window whose title changes without changing its identity', async () => {
    const session = await FixtureSession.start('title');
    try {
      for (const count of [1, 2]) {
        await session.click('1005');
        const renamed = await waitFor('the title to change', async () =>
          (await session.windows()).find((window) => window.title.endsWith(` - renamed ${count}`)),
        );
        expect(renamed).toMatchObject({ id: session.main.id, title: `${session.title} - renamed ${count}` });
      }

      const report = await waitFor('the name change event', async () => {
        const current = await session.eventReport();
        return current.events.some(
          (event) =>
            event.notification === 'EVENT_OBJECT_NAMECHANGE' &&
            event.windowId === session.main.id &&
            event.descriptor?.title?.endsWith(' - renamed 2'),
        )
          ? current
          : undefined;
      });
      expect(report).toMatchObject({ observing: true, source: 'WinEvent' });
    } finally {
      await session.dispose();
    }
  });

  windowsTest('refuses input to an owner while its popup is open and reports the popup closing', async () => {
    const session = await FixtureSession.start('popup');
    try {
      const { main } = session;
      const activate = await session.control(main.id, '1001');
      await session.click('1006');
      const dialog = await waitFor('the dialog window', async () => (await session.windows()).find((window) => window.id !== main.id));
      expect(dialog.title).toBe('Fixture dialog');
      expect(await session.control(dialog.id, '3002')).toMatchObject({ name: 'Dialog open', role: 'text' });

      const refused = await session.attempt('click', { elementId: activate.id, mode: 'accessibility' });
      expect(refused).toMatchObject({ code: 'element-not-interactable', ok: false });
      expect(refused.message).toContain('not enabled');

      await session.click('3001', dialog.id);
      await waitFor('the dialog to close', async () => (await session.windows()).length === 1);
      await waitFor('the window-closed event', async () =>
        session.events.find((event) => event.event === 'window-closed' && (event.payload as { windowId?: string })?.windowId === dialog.id),
      );
      const report = await session.eventReport();
      expect(report.events).toEqual(
        expect.arrayContaining([expect.objectContaining({ notification: 'EVENT_OBJECT_DESTROY', windowId: dialog.id })]),
      );

      // The refused click never reached the application, and the owner accepts input again.
      expect(await session.status()).toBe('Ready');
      await session.click('1001');
      await waitFor('the owner to accept the click', async () => (await session.status()) === 'Activated 1 times');
    } finally {
      await session.dispose();
    }
  });

  windowsTest('reports a hung application without guessing and recovers when it responds again', async () => {
    const session = await FixtureSession.start('hang', { args: ['--hang-ms', '14000'] });
    try {
      const { main } = session;
      const activate = await session.control(main.id, '1001');
      await session.click('1007');
      await delay(300);

      const listedAt = Date.now();
      expect(await session.windows()).toHaveLength(1);
      expect(Date.now() - listedAt).toBeLessThan(1_000);

      const read = await session.attempt('find', {
        root: { windowId: main.id },
        selector: { strategy: 'accessibility id', value: '1004' },
      });
      expect(read).toMatchObject({ code: 'automation-failed', ok: false });
      expect(read.message).toMatch(/did not respond|timed out/i);
      expect(read.ms).toBeLessThan(8_000);

      // Refreshing the element fails before anything is sent, so the click is refused outright, not indeterminate.
      const refused = await session.attempt('click', { elementId: activate.id, mode: 'accessibility' });
      expect(refused).toMatchObject({ code: 'automation-failed', ok: false });

      await waitFor('the application to respond again', async () => (await session.status().catch(() => undefined)) === 'Hang finished', {
        intervalMs: 250,
        timeoutMs: 40_000,
      });
      await session.click('1001');
      await waitFor('the click to apply exactly once', async () => (await session.status()) === 'Activated 1 times');
    } finally {
      await session.dispose();
    }
  });

  windowsTest('quarantines later mutations after a provider call does not settle', async () => {
    const session = await FixtureSession.start('stuck', { args: ['--stuck-ms', '8000'] });
    try {
      const { main } = session;
      const stuck = await session.control(main.id, '1009');
      const activate = await session.control(main.id, '1001');

      const first = await session.attempt('click', { elementId: stuck.id, mode: 'accessibility' });
      expect(first).toMatchObject({ code: 'mutation-indeterminate', ok: false });
      expect(first.message).toContain('effect on the application is unknown');
      expect(first.ms).toBeGreaterThanOrEqual(4_500);
      expect(first.ms).toBeLessThan(7_500);

      const again = await session.attempt('click', { elementId: stuck.id, mode: 'accessibility' });
      expect(again).toMatchObject({ code: 'target-quarantined', ok: false });
      expect(again.ms).toBeLessThan(1_500);
      expect(await session.attempt('click', { elementId: activate.id, mode: 'accessibility' })).toMatchObject({
        code: 'target-quarantined',
        ok: false,
      });
      expect(await session.windows()).toHaveLength(1);

      // The abandoned call still lands after the helper stopped waiting, exactly once.
      await waitFor('the late effect', async () => (await session.status().catch(() => undefined)) === 'Stuck action applied 1 times', {
        intervalMs: 250,
        timeoutMs: 30_000,
      });
      expect(await session.attempt('click', { elementId: activate.id, mode: 'accessibility' })).toMatchObject({
        code: 'target-quarantined',
        ok: false,
      });
      expect(await session.status()).toBe('Stuck action applied 1 times');
    } finally {
      await session.dispose();
    }
  });

  windowsTest('bounds a large tree and stays responsive', async () => {
    const nearLimit = await FixtureSession.start('tree-4900', { args: ['--nodes', '4900'] });
    try {
      const tree = await nearLimit.tree(nearLimit.main.id);
      expect(tree.length).toBeGreaterThanOrEqual(4_900);
      expect(tree.length).toBeLessThanOrEqual(5_000);
      expect(tree.some((element) => element.name === 'Item 4899')).toBe(true);
      const { retention } = await nearLimit.eventReport();
      expect(retention.retainedElements).toBeLessThanOrEqual(retention.retainedElementLimit);
    } finally {
      await nearLimit.dispose();
    }

    const overLimit = await FixtureSession.start('tree-10000', { args: ['--nodes', '10000'] });
    try {
      expect(await overLimit.attempt('tree', { windowId: overLimit.main.id })).toMatchObject({ code: 'tree-too-large', ok: false });
      // A selector search from the window root walks the same bounded tree, so it is refused the same way.
      expect(
        await overLimit.attempt('find', {
          root: { windowId: overLimit.main.id },
          selector: { strategy: 'accessibility id', value: '1004' },
        }),
      ).toMatchObject({
        code: 'tree-too-large',
        ok: false,
      });
      expect(await overLimit.windows()).toHaveLength(1);
      const { retention } = await overLimit.eventReport();
      expect(retention.retainedElements).toBeLessThanOrEqual(retention.retainedElementLimit);

      // A bounded observation of the same tree returns a partial sample instead of failing.
      const observe = async (budget: NativeObserveRequest['budget']) => {
        const request: NativeObserveRequest = { budget, facts: ['enabled', 'geometry'], windowId: overLimit.main.id };
        const started = Date.now();
        const parsed = parseNativeObservation(request, await overLimit.call('observe', request));
        if (parsed.status === 'rejected') {
          throw new Error(`The helper's observation breaks the contract: ${parsed.message}`);
        }
        return { ms: Date.now() - started, observation: parsed.observation };
      };
      const generous = { deadlineMs: 30_000, maxBytes: 4_194_304, maxDepth: 64, maxStringLength: 256, maxVisited: 5_000 };
      const visited = await observe(generous);
      expect(visited.observation.complete).toBe(false);
      expect(visited.observation.nodes).toHaveLength(5_000);
      expect(visited.observation.truncation).toEqual([{ limit: 5_000, reason: 'visited', unvisited: 0 }]);
      const repeated = await observe(generous);
      expect(repeated.observation.nodes.map((node) => node.id)).toEqual(visited.observation.nodes.map((node) => node.id));
      const deadline = await observe({ ...generous, deadlineMs: 50 });
      expect(deadline.observation.truncation.map((entry) => entry.reason)).toEqual(['deadline']);
      expect(deadline.ms).toBeLessThan(2_000);
      expect(await overLimit.windows()).toHaveLength(1);

      const ids = visited.observation.nodes.map((node) => node.id);
      let released = 0;
      for (let start = 0; start < ids.length; start += 1_000) {
        released += (await overLimit.call<{ released: number }>('releaseElements', { ids: ids.slice(start, start + 1_000) })).released;
      }
      expect(released).toBe(5_000);
    } finally {
      await overLimit.dispose();
    }
  });

  windowsTest('holds retained memory steady over 500 repeated cycles', async () => {
    const session = await FixtureSession.start('cycles');
    try {
      const { main } = session;
      const samples = new Map<number, Retention>();
      for (let cycle = 1; cycle <= 500; cycle += 1) {
        const tree = await session.tree(main.id);
        const control = (elements: ElementInfo[], automationId: string) =>
          required(
            elements.find((element) => element.automationId === automationId),
            `control ${automationId} in cycle ${cycle}`,
          );
        await session.press(control(tree, '1001'));
        await session.press(control(tree, '1005'));
        await session.press(control(tree, '1006'));
        const dialog = await waitFor(
          `the dialog in cycle ${cycle}`,
          async () => (await session.windows()).find((window) => window.id !== main.id),
          {
            intervalMs: 5,
          },
        );
        await session.press(control(await session.tree(dialog.id), '3001'));
        await waitFor(`the dialog to close in cycle ${cycle}`, async () => (await session.windows()).length === 1, { intervalMs: 5 });
        if (cycle % 100 === 0) {
          samples.set(cycle, (await session.eventReport()).retention);
        }
      }

      await waitFor('every click to apply', async () => (await session.status()) === 'Activated 500 times', { timeoutMs: 15_000 });
      await waitFor('the last rename', async () => (await session.windows()).find((window) => window.title.endsWith(' - renamed 500')));

      const baseline = required(samples.get(100), 'the 100-cycle sample');
      const final = required(samples.get(500), 'the 500-cycle sample');
      console.info(`retention after 100 and 500 cycles: ${JSON.stringify({ baseline, final })}`);
      expect(final.retainedElements).toBeLessThanOrEqual(Math.min(baseline.retainedElements + 5, final.retainedElementLimit));
      expect(final.workingSetBytes - baseline.workingSetBytes).toBeLessThan(8 * megabyte);
      expect(final.privateBytes - baseline.privateBytes).toBeLessThan(8 * megabyte);
    } finally {
      await session.dispose();
    }
  });
});
