const {
  nativeRunnerEnabled,
  nativeRunnerCaptureEnabled,
  nativeRunnerCapture,
  nativeRunnerFixture,
  waitForNativeFixture,
  runNativeRunnerCase,
  removeNativeRunnerDescriptors,
  nativeRunnerExecution,
} = require('./nativeRunnerSupport.cjs');

describe('native runner selection', () => {
  const enabled = { FURN_NATIVE_DRIVER_TEST: '1', FURN_NATIVE_HANDOFF_APP_PATH: 'fixture' };

  test.each(['darwin', 'win32'])('selects the opted-in native consumer on %s', (platform) => {
    expect(nativeRunnerEnabled(platform, enabled)).toBe(true);
  });

  test('Windows uses an executable and native readiness, not the AppKit ready-file protocol', () => {
    const application = 'D:\\fixtures with spaces\\furn-win32-fixture.exe';
    const fixture = nativeRunnerFixture('win32', application, 'exact-title', 'unused.ready');
    expect(fixture).toMatchObject({
      executable: application,
      endpoint: 'win32',
      application: { executablePath: application, windowTitle: 'exact-title' },
      args: ['--title', 'exact-title', '--offscreen', '1', '--lifetime-ms', '135000'],
    });
    expect(() => nativeRunnerFixture('win32', 'D:\\Fixture.app', 'title', 'unused.ready')).toThrow(/fixture executable/);
  });

  test('preserves the macOS bundle executable and explicit ready-file protocol', () => {
    expect(nativeRunnerFixture('darwin', '/fixtures/Fixture.app', 'title', '/runs/ready')).toMatchObject({
      executable: '/fixtures/Fixture.app/Contents/MacOS/fixture',
      application: { bundleIdentifier: 'com.microsoft.furn.application-ownership-fixture', windowTitle: 'title' },
      args: ['--title', 'title', '--ready-file', '/runs/ready'],
    });
  });

  test.each(['darwin', 'win32'])('hosted %s input policy skips capture without skipping transport and ownership', (platform) => {
    const environment = {
      FURN_NATIVE_DRIVER_TEST: '1',
      FURN_NATIVE_HANDOFF_APP_PATH: 'fixture.exe',
      FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES: 'keyboard,physicalClick,wheel',
    };
    expect(nativeRunnerEnabled(platform, environment)).toBe(true);
    expect(nativeRunnerCaptureEnabled(platform, environment)).toBe(false);
    expect(nativeRunnerCaptureEnabled(platform, { ...environment, FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES: '' })).toBe(true);
  });

  test('endpoint capture refusal is explicitly unsupported rather than a failed ownership contract', async () => {
    await expect(
      nativeRunnerCapture({
        enabled: true,
        capture: async () => ({ isError: true, content: [{ type: 'text', text: 'Capture unsupported.' }] }),
      }),
    ).resolves.toMatchObject({ status: 'unsupported', skipped: true });
    const capture = jest.fn();
    await expect(nativeRunnerCapture({ enabled: false, capture })).resolves.toMatchObject({ status: 'skipped', skipped: true });
    expect(capture).not.toHaveBeenCalled();
  });

  test('the internal deadline shuts down a case even when its pending work ignores cancellation', async () => {
    const shutdown = jest.fn().mockResolvedValue(undefined);
    const onError = jest.fn();
    const onAbort = jest.fn();
    let signal: AbortSignal | undefined;
    await expect(
      runNativeRunnerCase({
        work: (value: AbortSignal) => {
          signal = value;
          return new Promise(() => undefined);
        },
        shutdown,
        onError,
        onAbort,
        timeoutMs: 10,
        cleanupTimeoutMs: 100,
      }),
    ).resolves.toMatchObject({ aborted: true, cleanupTimedOut: false });
    expect(signal?.aborted).toBe(true);
    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onAbort).toHaveBeenCalledTimes(1);
  });

  test('the internal deadline also bounds shutdown that never settles', async () => {
    await expect(
      runNativeRunnerCase({
        work: async () => undefined,
        shutdown: () => new Promise(() => undefined),
        onError: jest.fn(),
        timeoutMs: 100,
        cleanupTimeoutMs: 10,
      }),
    ).resolves.toMatchObject({ cleanupTimedOut: true });
  });

  test('failed-case descriptor cleanup removes only records owned by the exited child', async () => {
    const owned = JSON.stringify({ version: 1, service: { pid: 123 } });
    const foreign = JSON.stringify({ version: 1, service: { pid: 456 } });
    const records = new Map([
      ['case-agent.json', owned],
      ['case-runner.json', foreign],
    ]);
    const storage = {
      read: async (name: string) => records.get(name),
      remove: jest.fn(async (name: string, contents: string) => records.get(name) === contents && records.delete(name)),
    };
    await expect(removeNativeRunnerDescriptors(storage, ['case-agent.json', 'case-runner.json'], 123)).resolves.toEqual({
      removed: ['case-agent.json'],
      retained: ['case-runner.json'],
    });
    expect(records.get('case-runner.json')).toBe(foreign);
    expect(storage.remove).toHaveBeenCalledTimes(1);
    expect(storage.remove).toHaveBeenCalledWith('case-agent.json', owned);
  });

  test('failed-case cleanup never removes a descriptor replaced after its ownership check', async () => {
    const original = JSON.stringify({ version: 1, service: { pid: 123 } });
    const replacement = JSON.stringify({ version: 1, service: { pid: 456 } });
    let contents = original;
    const storage = {
      read: async () => {
        contents = replacement;
        return original;
      },
      remove: async (_name: string, expected: string) => expected === contents,
    };
    await expect(removeNativeRunnerDescriptors(storage, ['case-agent.json'], 123)).resolves.toEqual({
      removed: [],
      retained: ['case-agent.json'],
    });
    expect(contents).toBe(replacement);
  });

  test('ownership alone cannot qualify a native consumer when accessibility input was not disabled', () => {
    const ownershipOnly = { executed: 1, passed: 1, skipped: 1, failed: 0 };
    expect(() => nativeRunnerExecution(ownershipOnly, 'handoff')).toThrow(/both ownership and accessibility input/);
    expect(nativeRunnerExecution({ executed: 2, passed: 2, skipped: 0, failed: 0 }, 'handoff')).toMatchObject({
      executed: 2,
      expectedExecuted: 2,
      accessibilityClick: 'passed',
    });
  });

  test('native readiness waits for the exact window and ready control, then releases only its attached lease', async () => {
    const lease = { processId: 123 };
    const onDisposed = jest.fn();
    const host = {
      attach: jest.fn().mockRejectedValueOnce({ code: 'attach-failed' }).mockResolvedValue(lease),
      windows: jest.fn().mockResolvedValue([{ id: 'window', title: 'fixture' }]),
      find: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValue([{ automationId: '1004', name: 'Ready' }]),
      closeApplication: jest.fn(),
      dispose: jest.fn(),
    };
    await expect(
      waitForNativeFixture({
        host,
        target: { host: { application: { windowTitle: 'fixture' } } },
        fixture: { pid: 123, exitCode: null, signalCode: null },
        statusId: '1004',
        onDisposed,
        intervalMs: 1,
      }),
    ).resolves.toBe(lease);
    expect(host.attach).toHaveBeenCalledTimes(2);
    expect(host.find).toHaveBeenCalledTimes(2);
    expect(host.closeApplication).toHaveBeenCalledWith(lease);
    expect(host.dispose).toHaveBeenCalledTimes(1);
    expect(onDisposed).toHaveBeenCalledTimes(1);
  });

  test('native readiness refuses a different process incarnation and still disposes its helper', async () => {
    const host = {
      attach: jest.fn().mockResolvedValue({ processId: 456 }),
      closeApplication: jest.fn(),
      dispose: jest.fn(),
    };
    await expect(
      waitForNativeFixture({
        host,
        target: {},
        fixture: { pid: 123, exitCode: null, signalCode: null },
        statusId: '1004',
      }),
    ).rejects.toThrow(/exact fixture/);
    expect(host.closeApplication).toHaveBeenCalledTimes(1);
    expect(host.dispose).toHaveBeenCalledTimes(1);
  });

  test('native readiness cannot confirm cleanup when its helper disposal fails', async () => {
    const onDisposed = jest.fn();
    await expect(
      waitForNativeFixture({
        host: {
          attach: jest.fn().mockRejectedValue(new Error('Readiness unavailable.')),
          dispose: jest.fn().mockRejectedValue(new Error('Helper disposal unconfirmed.')),
        },
        target: {},
        fixture: { pid: 123, exitCode: null, signalCode: null },
        statusId: '1004',
        onDisposed,
      }),
    ).rejects.toThrow('Helper disposal unconfirmed.');
    expect(onDisposed).not.toHaveBeenCalled();
  });

  test.each([
    ['linux', enabled],
    ['win32', { FURN_NATIVE_DRIVER_TEST: '1' }],
    ['win32', { FURN_NATIVE_HANDOFF_APP_PATH: 'fixture' }],
  ])('does not launch a native consumer without supported OS and both opt-ins (%s)', (platform, environment) => {
    expect(nativeRunnerEnabled(platform, environment)).toBe(false);
  });
});
