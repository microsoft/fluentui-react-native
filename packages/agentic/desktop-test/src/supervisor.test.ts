import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { accessibleLaneMaskedFeatures } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';
import type { ResolvedDesktopTarget } from './config.js';
import { startNativeDesktopService } from './driverService.js';
import { DesktopRunReporter } from './reporting/collector.js';
import { DesktopSupervisor } from './supervisor.js';

jest.mock('./driverService', () => ({ startDesktopService: jest.fn(), startNativeDesktopService: jest.fn() }));
jest.mock('./adapters', () => ({ resolveDesktopApplication: jest.fn(async () => ({ executablePath: 'Fixture.app' })) }));

describe('desktop supervisor input lane', () => {
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  const startNative = startNativeDesktopService as jest.MockedFunction<typeof startNativeDesktopService>;
  let artifactsRoot: string;

  beforeEach(() => {
    artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-supervisor-'));
    // The helper is mocked, so any host can stand in for the macOS machine the endpoint requires.
    Object.defineProperty(process, 'platform', { ...platform, value: 'darwin' });
    startNative.mockReset();
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the mocked service stands in for a loopback Desktop Driver
    startNative.mockResolvedValue({ url: 'http://127.0.0.1:1', close: async () => undefined } as Awaited<
      ReturnType<typeof startNativeDesktopService>
    >);
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', platform);
    fs.rmSync(artifactsRoot, { force: true, recursive: true });
  });

  async function nativeServiceOptions(input?: DesktopInputLane) {
    const output = { write: () => true };
    const reporter = new DesktopRunReporter({ artifactsRoot, errorOutput: output, output, reporterMode: 'plain', summary: false });
    const target: ResolvedDesktopTarget = {
      endpoint: 'macos',
      id: 'fixture',
      registrationId: 'fixture',
      instanceId: 'fixture-1',
      projectRoot: artifactsRoot,
      configPath: path.join(artifactsRoot, 'desktop.config.mts'),
      host: { kind: 'installed' },
    };
    const supervisor = new DesktopSupervisor({
      target,
      reporter,
      reportSession: { reporter, delegated: true, environment: {}, close: async () => 0 },
      ...(input ? { input } : {}),
    });
    try {
      await supervisor.start();
    } finally {
      await supervisor.close();
    }
    expect(startNative).toHaveBeenCalledTimes(1);
    return startNative.mock.calls[0][0];
  }

  test('starts the native host with physical input disabled for an accessible lane', async () => {
    const options = await nativeServiceOptions('accessible');
    expect(options.disabledInputFeatures).toEqual([...accessibleLaneMaskedFeatures]);
  });

  test.each([['physical' as const], [undefined]])('leaves the native host unmasked for %s', async (input) => {
    const options = await nativeServiceOptions(input);
    expect(options).not.toHaveProperty('disabledInputFeatures');
  });
});
