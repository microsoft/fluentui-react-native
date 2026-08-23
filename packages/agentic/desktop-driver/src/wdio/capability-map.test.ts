import { resolveDesktopOptions } from '../config.ts';
import { buildCapabilities, buildRootSessionCapabilities, describeAttachResolution } from './capability-map.ts';

describe('capability mapping', () => {
  it('describes exact and fuzzy attach resolution', () => {
    expect(describeAttachResolution({ mode: 'attach', title: 'Storybook' })).toEqual({ exact: false, order: ['title'] });
    expect(describeAttachResolution({ mode: 'attach', processId: 7 }).exact).toBe(true);
  });

  it('maps a macOS launch target to Mac2 capabilities', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({ platform: 'macos', target: { mode: 'launch', app: '/Applications/Sample.app', args: ['--flag'] } }),
    );

    expect(capabilities).toMatchObject({
      platformName: 'mac',
      'appium:automationName': 'Mac2',
      'appium:appPath': '/Applications/Sample.app',
      'appium:arguments': ['--flag'],
    });
  });

  it('treats a bare macOS identifier as a bundle id', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({ platform: 'macos', target: { mode: 'launch', app: 'com.example.Sample' } }),
    );
    expect(capabilities['appium:bundleId']).toBe('com.example.Sample');
    expect(capabilities['appium:appPath']).toBeUndefined();
  });

  it('never relaunches or kills an attached macOS application', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({ platform: 'macos', target: { mode: 'attach', identity: 'com.example.Sample' } }),
    );

    expect(capabilities['appium:noReset']).toBe(true);
    expect(capabilities['appium:skipAppKill']).toBe(true);
  });

  it('pins an attached Windows session to one window instead of the desktop root', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({ platform: 'windows', target: { mode: 'attach', windowHandle: '0x1234' } }),
    );

    expect(capabilities).toMatchObject({
      platformName: 'Windows',
      'appium:automationName': 'NovaWindows',
      'appium:appTopLevelWindow': '0x1234',
      'appium:shouldCloseApp': false,
    });
    expect(capabilities['appium:app']).toBeUndefined();
  });

  it('normalizes a decimal window handle to the hexadecimal form the driver parses', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({ platform: 'windows', target: { mode: 'attach', windowHandle: '264316' } }),
    );
    expect(capabilities['appium:appTopLevelWindow']).toBe('0x4087c');
  });

  it('asks for the desktop root only while discovering the window', () => {
    const options = resolveDesktopOptions({ platform: 'windows', target: { mode: 'attach', title: 'AgenticStorybook' } });

    expect(buildCapabilities(options)).toMatchObject({ 'appium:app': 'Root' });
    expect(buildRootSessionCapabilities(options)).toMatchObject({ 'appium:app': 'Root' });

    const pinned = buildCapabilities(options, { windowHandle: '0x501e2' });
    expect(pinned['appium:appTopLevelWindow']).toBe('0x501e2');
    expect(pinned['appium:app']).toBeUndefined();
    expect(buildRootSessionCapabilities(options)['appium:appTopLevelWindow']).toBeUndefined();
  });

  it('stops NovaWindows from closing an attached window at session end', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({ platform: 'windows', backend: 'novawindows', target: { mode: 'attach', windowHandle: '0x1234' } }),
    );

    expect(capabilities).toMatchObject({
      'appium:automationName': 'NovaWindows',
      'appium:shouldCloseApp': false,
    });
    expect(capabilities['ms:forcequit']).toBeUndefined();
  });

  it('does not set attach-only capabilities for a launch target', () => {
    const capabilities = buildCapabilities(resolveDesktopOptions({ platform: 'windows', target: { mode: 'launch', app: 'C:/app.exe' } }));

    expect(capabilities['ms:forcequit']).toBeUndefined();
    expect(capabilities['appium:shouldCloseApp']).toBeUndefined();
  });

  it('pins browserName so both platforms resolve the same WebdriverIO command implementations', () => {
    const macos = buildCapabilities(resolveDesktopOptions({ platform: 'macos', target: { mode: 'launch', app: 'com.example.app' } }));
    const windows = buildCapabilities(resolveDesktopOptions({ platform: 'windows', target: { mode: 'launch', app: 'C:/app.exe' } }));

    expect(macos.browserName).toBe('');
    expect(windows.browserName).toBe('');
  });

  it('lets a consumer override a generated capability', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({
        platform: 'windows',
        target: { mode: 'launch', app: 'C:/app.exe' },
        backendCapabilities: { 'appium:appArguments': '--custom' },
      }),
    );
    expect(capabilities['appium:appArguments']).toBe('--custom');
  });

  it.each([
    {
      name: 'Mac2 app termination',
      options: { platform: 'macos', target: { mode: 'attach', identity: 'com.example.Sample' } } as const,
      capability: { 'appium:skipAppKill': false },
    },
    {
      name: 'NovaWindows app termination',
      options: {
        platform: 'windows',
        backend: 'novawindows',
        target: { mode: 'attach', windowHandle: '0x1234' },
      } as const,
      capability: { 'appium:shouldCloseApp': true },
    },
    {
      name: 'attached window routing',
      options: { platform: 'windows', target: { mode: 'attach', windowHandle: '0x1234' } } as const,
      capability: { 'appium:app': 'OtherApp' },
    },
  ])('rejects an unsafe $name capability override', ({ options, capability }) => {
    expect(() => buildCapabilities(resolveDesktopOptions({ ...options, backendCapabilities: capability }))).toThrow(
      /cannot override attach ownership or routing/,
    );
  });

  it('allows a protected capability override when it preserves the generated value', () => {
    const capabilities = buildCapabilities(
      resolveDesktopOptions({
        platform: 'windows',
        target: { mode: 'attach', windowHandle: '0x1234' },
        backendCapabilities: { 'appium:shouldCloseApp': false },
      }),
    );
    expect(capabilities['appium:shouldCloseApp']).toBe(false);
  });

  it('protects root-session routing from backend overrides', () => {
    const options = resolveDesktopOptions({
      platform: 'windows',
      target: { mode: 'attach', title: 'Storybook' },
      backendCapabilities: { 'appium:app': 'OtherApp' },
    });
    expect(() => buildRootSessionCapabilities(options)).toThrow(/cannot override attach ownership or routing/);
  });
});
