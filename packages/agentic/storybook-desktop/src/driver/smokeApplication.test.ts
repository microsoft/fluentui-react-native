import type { ApplicationLease, DesktopHost } from '@fluentui-react-native/desktop-driver';
import { prepareSmokeApplicationHost } from './smokeApplication';
import type { updateWindowsApplicationLease } from './applicationLease';

function fixture(endpoint: 'macos' | 'windows' | 'win32') {
  const events: string[] = [];
  const application: ApplicationLease = {
    id: 'native-lease',
    ownership: 'launched',
    processId: 123,
    processStartedAt: endpoint === 'macos' ? '2026-11-16T08:00:00.123456Z' : '2026-11-16T08:00:00.1234567Z',
    executablePath: endpoint === 'macos' ? '/Fixture/Host.app/Contents/MacOS/Host' : 'C:\\Fixture\\Host.exe',
    ...(endpoint === 'macos' ? {} : { interactiveSession: 'windows-session:1' }),
    ...(endpoint === 'windows' ? { aumid: 'Fixture!App' } : {}),
    launchKind: endpoint === 'windows' ? 'packaged-activation' : endpoint === 'macos' ? 'launch-services' : 'direct-child',
    containment: endpoint === 'win32' ? 'job-object' : 'uncontained',
  };
  const native = {
    endpoint,
    probe: jest.fn(async () => ({})),
    launch: jest.fn(async () => {
      events.push('launch');
      return application;
    }),
    windows: jest.fn(async () => []),
    closeApplication: jest.fn(async () => {
      events.push('close');
    }),
    dispose: jest.fn(async () => {
      events.push('dispose');
    }),
  };
  const updateLease = jest.fn<ReturnType<typeof updateWindowsApplicationLease>, Parameters<typeof updateWindowsApplicationLease>>(
    async (_manifest, _handoff, update) => {
      events.push(update.operation);
      return update.operation === 'publish' ? 'receipt' : undefined;
    },
  );
  const options = {
    target: {
      endpoint,
      id: 'fixture',
      platformName: endpoint === 'macos' ? ('macos' as const) : ('windows' as const),
      launchModes: ['attach' as const],
    },
    manifestPath: 'manifest.json',
    handoff: 'trusted-handoff',
    windowTitle: 'Fixture',
    signal: new AbortController().signal,
    onResource: jest.fn(),
    updateLease,
  };
  return { events, native, updateLease, options, host: native as unknown as DesktopHost, application };
}

test.each(['windows', 'win32'] as const)(
  'retains the exact %s application across attached sessions and withdraws its lease last',
  async (endpoint) => {
    const f = fixture(endpoint);
    const host = await prepareSmokeApplicationHost(f.host, f.options);
    const lease = await host.attach({ ...f.options.target, host });
    await host.closeApplication(lease);
    expect(f.native.closeApplication).not.toHaveBeenCalled();
    expect(f.updateLease.mock.calls[0][2]).toEqual({
      operation: 'publish',
      application: {
        processId: f.application.processId,
        processStartedAt: f.application.processStartedAt,
        windowTitle: 'Fixture',
        ...(endpoint === 'windows' ? { aumid: 'Fixture!App' } : { executablePath: f.application.executablePath }),
      },
    });
    await host.dispose();
    await host.dispose();
    expect(f.events).toEqual(['launch', 'publish', 'close', 'dispose', 'remove']);
    expect(f.native.closeApplication).toHaveBeenCalledWith(f.application, undefined);
    expect(f.options.onResource).toHaveBeenLastCalledWith(expect.objectContaining({ disposal: 'settled' }));
  },
);

test('retains the macOS application without publishing a competing Windows lease', async () => {
  const f = fixture('macos');
  const host = await prepareSmokeApplicationHost(f.host, f.options);
  const lease = await host.attach({ ...f.options.target, host });
  await host.closeApplication(lease);
  expect(f.native.closeApplication).not.toHaveBeenCalled();
  await host.dispose();
  expect(f.events).toEqual(['launch', 'close', 'dispose']);
  expect(f.native.closeApplication).toHaveBeenCalledWith(f.application, undefined);
  expect(f.updateLease).not.toHaveBeenCalled();
  expect(f.options.onResource).toHaveBeenLastCalledWith(expect.objectContaining({ disposal: 'settled' }));
});

test('preserves the protected lease and reports uncertain native cleanup', async () => {
  const f = fixture('windows');
  const host = await prepareSmokeApplicationHost(f.host, f.options);
  f.native.closeApplication.mockRejectedValueOnce(new Error('exact-incarnation close failed'));
  await expect(host.dispose()).rejects.toThrow('did not settle');
  expect(f.events).not.toContain('remove');
});

test('failed lease publication closes only the acquired application and aggregates a cleanup failure', async () => {
  const f = fixture('win32');
  f.updateLease.mockRejectedValueOnce(new Error('foreign lease'));
  f.native.closeApplication.mockRejectedValueOnce(new Error('native cleanup failed'));
  await expect(prepareSmokeApplicationHost(f.host, f.options)).rejects.toMatchObject({
    errors: [expect.objectContaining({ message: 'foreign lease' }), expect.any(AggregateError)],
  });
  expect(f.updateLease).toHaveBeenCalledTimes(1);
});

test('pre-cancelled smoke performs no native acquisition or lease publication', async () => {
  const f = fixture('windows');
  await expect(prepareSmokeApplicationHost(f.host, { ...f.options, signal: AbortSignal.abort(new Error('cancelled')) })).rejects.toThrow(
    'cancelled',
  );
  expect(f.native.launch).not.toHaveBeenCalled();
  expect(f.updateLease).not.toHaveBeenCalled();
});
