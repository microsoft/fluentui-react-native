import type { PrivateStorage } from '@fluentui-react-native/desktop-driver/authority';

import { createDesktopMacOSApplicationLeaseResource } from './applicationOwnership';
import type { DesktopMacOSApplicationObservation } from './applicationOwnership';

const record = 'application-lease.macos.json';
const selector = { bundleIdentifier: 'com.example.storybook', windowTitle: 'Storybook' };
const first: DesktopMacOSApplicationObservation = {
  processId: 123,
  processStartedAt: '2026-11-12T00:00:00.123456Z',
  executablePath: '/Applications/Storybook.app/Contents/MacOS/Storybook',
};
const second = { ...first, processId: 456, processStartedAt: '2026-11-12T00:00:01.123456Z' };

function fixture(initial?: string) {
  const contents = new Map<string, string>(initial === undefined ? [] : [[record, initial]]);
  const storage: jest.Mocked<PrivateStorage> = {
    read: jest.fn(async (name) => contents.get(name)),
    publish: jest.fn(async (name, value) => {
      if (contents.has(name)) throw new Error('Already exists');
      contents.set(name, value);
    }),
    remove: jest.fn(async (name, expected) => {
      if (contents.get(name) !== expected) return false;
      contents.delete(name);
      return true;
    }),
  };
  const state: { observation?: DesktopMacOSApplicationObservation; error?: Error } = { observation: first };
  const inspector = {
    inspect: jest.fn(async (_signal: AbortSignal) => {
      if (state.error) throw state.error;
      return state.observation;
    }),
    close: jest.fn(async () => undefined),
  };
  const addSecret = jest.fn();
  const onWarning = jest.fn();
  const onFailure = jest.fn();
  const openStorage = jest.fn(async () => {
    expect(addSecret).toHaveBeenCalledWith('private-nonce');
    return storage;
  });
  const openInspector = jest.fn(async () => inspector);
  const contribution = createDesktopMacOSApplicationLeaseResource({
    selector,
    record,
    nonce: 'private-nonce',
    intervalMs: 10,
    openStorage,
    openInspector,
    addSecret,
    onWarning,
    onFailure,
  });
  const controller = new AbortController();
  const plan = contribution.prepare({ signal: controller.signal, targetId: 'target', targetInstanceId: 'instance' });
  return {
    contribution,
    plan,
    controller,
    storage,
    contents,
    state,
    inspector,
    addSecret,
    onWarning,
    onFailure,
    openStorage,
    openInspector,
  };
}

async function until(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 400; attempt++) {
    if (predicate()) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('Timed out waiting for lease maintenance.');
}

describe('host-owned macOS application lease', () => {
  test('tracks relaunch, missing records, ambiguity, and application exit without owning the application', async () => {
    const f = fixture();
    expect(f.contribution).toMatchObject({ id: 'macos-application-lease', ownership: 'owned' });
    expect(f.openStorage).not.toHaveBeenCalled();
    expect(f.openInspector).not.toHaveBeenCalled();
    await f.plan.acquire(f.controller.signal);
    try {
      await until(() => f.contents.has(record));
      expect(JSON.parse(f.contents.get(record)!)).toEqual({
        schemaVersion: 1,
        endpoint: 'macos',
        nonce: 'private-nonce',
        ...selector,
        ...first,
      });
      expect(f.openInspector).toHaveBeenCalledWith(selector, f.controller.signal);
      expect(f.addSecret).toHaveBeenCalledWith('private-nonce');

      f.state.observation = second;
      await until(() => JSON.parse(f.contents.get(record) ?? '{}').processId === second.processId);
      const current = f.contents.get(record)!;
      expect(f.storage.remove).toHaveBeenCalledWith(record, expect.stringContaining('"processId":123'));
      f.contents.delete(record);
      await until(() => f.contents.get(record) === current);

      f.state.error = new Error('Ambiguous application, private-nonce');
      await until(() => !f.contents.has(record) && f.onWarning.mock.calls.length === 1);
      const inspections = f.inspector.inspect.mock.calls.length;
      await until(() => f.inspector.inspect.mock.calls.length >= inspections + 2);
      expect(f.onWarning).toHaveBeenCalledTimes(1);
      expect(f.onWarning.mock.calls[0][0]).not.toContain('private-nonce');
      f.state.error = undefined;
      await until(() => f.contents.has(record));
      f.state.observation = undefined;
      await until(() => !f.contents.has(record));
      expect(f.onFailure).not.toHaveBeenCalled();
    } finally {
      await f.plan.dispose();
    }
    expect(f.inspector.close).toHaveBeenCalledTimes(1);
  });

  test('withdraws its exact record during shutdown and leaves a replacement untouched', async () => {
    const f = fixture();
    await f.plan.acquire(f.controller.signal);
    await until(() => f.contents.has(record));
    const previous = f.contents.get(record)!;
    f.contents.set(record, 'foreign-replacement');
    await expect(f.plan.dispose()).rejects.toThrow('cleanup did not settle');
    expect(f.storage.remove).toHaveBeenCalledWith(record, previous);
    expect(f.contents.get(record)).toBe('foreign-replacement');
    expect(f.inspector.close).toHaveBeenCalledTimes(1);
  });

  test('refuses a preexisting lease instead of adopting or removing it', async () => {
    const f = fixture('foreign-record');
    await f.plan.acquire(f.controller.signal);
    await until(() => f.onFailure.mock.calls.length === 1);
    await f.plan.dispose();
    expect(f.contents.get(record)).toBe('foreign-record');
    expect(f.storage.publish).not.toHaveBeenCalled();
    expect(f.storage.remove).not.toHaveBeenCalled();
  });

  test('rejects imprecise process identities and resumes after a verified observation', async () => {
    const f = fixture();
    f.state.observation = { ...first, processStartedAt: '2026-11-12T00:00:00.123Z' };
    await f.plan.acquire(f.controller.signal);
    try {
      await until(() => f.onWarning.mock.calls.length === 1);
      expect(f.storage.publish).not.toHaveBeenCalled();
      f.state.observation = first;
      await until(() => f.contents.has(record));
      expect(f.onFailure).not.toHaveBeenCalled();
    } finally {
      await f.plan.dispose();
    }
  });

  test('fences cleanup when a publication may have taken effect before failing', async () => {
    const f = fixture();
    f.storage.publish.mockImplementationOnce(async (name, value) => {
      f.contents.set(name, value);
      throw new Error('Publication outcome unknown');
    });
    await f.plan.acquire(f.controller.signal);
    await until(() => f.onFailure.mock.calls.length === 1);
    await expect(f.plan.dispose()).rejects.toThrow('cleanup did not settle');
    expect(f.contents.has(record)).toBe(true);
    expect(f.storage.remove).not.toHaveBeenCalled();
    expect(f.inspector.close).toHaveBeenCalledTimes(1);
  });

  test('does not publish an inspection that completes after cancellation', async () => {
    const f = fixture();
    let finish!: (observation: DesktopMacOSApplicationObservation) => void;
    f.inspector.inspect.mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    await f.plan.acquire(f.controller.signal);
    await until(() => f.inspector.inspect.mock.calls.length === 1);
    f.controller.abort(new Error('Host stopping'));
    finish(first);
    await f.plan.dispose();
    expect(f.storage.publish).not.toHaveBeenCalled();
    expect(f.inspector.close).toHaveBeenCalledTimes(1);
  });

  test('closes an inspector acquired after resource shutdown began', async () => {
    const f = fixture();
    let finish!: (inspector: typeof f.inspector) => void;
    f.openInspector.mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    const acquiring = f.plan.acquire(f.controller.signal);
    await until(() => f.openInspector.mock.calls.length === 1);
    await f.plan.dispose();
    finish(f.inspector);
    await expect(acquiring).rejects.toThrow('closing');
    expect(f.inspector.close).toHaveBeenCalledTimes(1);
    expect(f.storage.publish).not.toHaveBeenCalled();
  });

  test('rejects selectors that could read their own lease', () => {
    const f = fixture();
    expect(() =>
      createDesktopMacOSApplicationLeaseResource({
        selector: { ...selector, leasePath: '/tmp/lease.json' } as typeof selector,
        record,
        nonce: 'nonce',
        openStorage: f.openStorage,
        openInspector: f.openInspector,
        addSecret: f.addSecret,
        onFailure: f.onFailure,
      }),
    ).toThrow('application selector');
  });
});
