import { NativeDriverError } from '../../native/NativeDriverError';
import type { NativeDriverArtifact } from '../../native/types';
import { toWebDriverError } from '../../protocol/errors';
import type { WebDriverErrorCode } from '../../protocol/errors';
import {
  applyDisabledInputFeaturePolicy,
  FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES,
  NativeDesktopHost,
  translateNativeError,
} from './NativeDesktopHost';

describe('NativeDesktopHost error translation', () => {
  test.each<[nativeCode: string, webdriverCode: WebDriverErrorCode]>([
    ['capture-failed', 'unable to capture screen'],
    ['element-not-interactable', 'element not interactable'],
    ['invalid-params', 'invalid argument'],
    ['invalid-request', 'invalid argument'],
    ['no-such-element', 'no such element'],
    ['no-such-window', 'no such window'],
  ])('maps %s to %s', (nativeCode, webdriverCode) => {
    const error = toWebDriverError(translateNativeError(new NativeDriverError(nativeCode, 'native failure', { operation: 'test' })));

    expect(error).toMatchObject({
      code: webdriverCode,
      data: { operation: 'test' },
      message: 'native failure',
    });
  });

  describe('NativeDesktopHost input policy', () => {
    const artifact: NativeDriverArtifact = {
      architecture: 'x64',
      artifactId: 'artifact',
      artifactRoot: 'artifact-root',
      buildFingerprint: 'build',
      buildId: 'build',
      compatibilityKey: 'compatibility',
      configuration: 'release',
      endpoints: ['windows', 'win32'],
      executablePath: 'driver.exe',
      features: [],
      origin: 'cache',
      provider: 'windows',
      schemaVersion: 1,
      signing: { mode: 'none' },
      sourceDigest: 'source',
      wireProtocol: { major: 1, minor: 1 },
    };

    afterEach(() => {
      delete process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES];
    });

    test('masks configured input capabilities', () => {
      const hostInfo = applyDisabledInputFeaturePolicy(
        {
          endpoint: 'win32',
          features: {
            accessibilityClick: true,
            elementScreenshot: true,
            focus: true,
            keyboard: true,
            physicalClick: true,
            screenshot: true,
            setWindowRect: true,
            wheel: true,
          },
          platformName: 'windows',
          protocolVersion: 1,
        },
        new Set(['keyboard', 'physicalClick', 'wheel']),
      );

      expect(hostInfo.features).toMatchObject({
        accessibilityClick: true,
        keyboard: false,
        physicalClick: false,
        wheel: false,
      });
    });

    test('rejects disabled physical commands before starting the helper', async () => {
      const host = new NativeDesktopHost({
        application: { windowTitle: 'Test App' },
        artifact,
        disabledInputFeatures: ['keyboard', 'physicalClick', 'wheel'],
        endpoint: 'windows',
      });

      await expect(host.click('element', 'physical')).rejects.toMatchObject({ name: 'HostUnsupportedError' });
      await expect(host.clear('element')).rejects.toMatchObject({ name: 'HostUnsupportedError' });
      await expect(host.sendKeys('element', 'text')).rejects.toMatchObject({ name: 'HostUnsupportedError' });
      await expect(
        host.performActions([{ actions: [{ button: 0, type: 'pointerDown' }], id: 'pointer', type: 'pointer' }]),
      ).rejects.toMatchObject({ name: 'HostUnsupportedError' });
    });

    test('rejects unknown disabled input features from the environment', () => {
      process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES] = 'physicalClick,unknown';

      expect(
        () =>
          new NativeDesktopHost({
            application: { windowTitle: 'Test App' },
            artifact,
            endpoint: 'windows',
          }),
      ).toThrow('Unsupported disabled native input feature "unknown"');
    });
  });
});
