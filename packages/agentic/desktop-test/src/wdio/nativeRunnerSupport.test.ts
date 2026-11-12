const { nativeRunnerEnabled, nativeRunnerCaptureEnabled, nativeRunnerFixture, waitForNativeFixture } = require('./nativeRunnerSupport.cjs');

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
      args: ['--title', 'exact-title', '--offscreen', '1'],
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

  test('hosted input policy skips capture without skipping transport and ownership', () => {
    const environment = {
      FURN_NATIVE_DRIVER_TEST: '1',
      FURN_NATIVE_HANDOFF_APP_PATH: 'fixture.exe',
      FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES: 'keyboard,physicalClick,wheel',
    };
    expect(nativeRunnerEnabled('win32', environment)).toBe(true);
    expect(nativeRunnerCaptureEnabled('win32', environment)).toBe(false);
    expect(nativeRunnerCaptureEnabled('win32', { ...environment, FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES: '' })).toBe(true);
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
