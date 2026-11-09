import { NativeDriverError } from '../../native/NativeDriverError';
import type { NativeDriverArtifact } from '../../native/types';
import { toWebDriverError } from '../../protocol/errors';
import type { WebDriverErrorCode } from '../../protocol/errors';
import { attachFailureEffect, dispositionOfFailure, readFailureEffect, readProviderQuarantine } from '../../protocol/settlement';
import {
  applyDisabledInputFeaturePolicy,
  FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES,
  NativeDesktopHost,
  parseKeyedActions,
  resolveDisabledInputFeatures,
  translateNativeError,
} from './NativeDesktopHost';

describe('NativeDesktopHost accessibility action keys', () => {
  test('pairs each listed action with its key', () => {
    expect(parseKeyedActions({ actions: ['AXPress', 'Toggle'], keys: ['k1', 'k2'] })).toEqual([
      { key: 'k1', name: 'AXPress' },
      { key: 'k2', name: 'Toggle' },
    ]);
    expect(parseKeyedActions({ actions: [], keys: [] })).toEqual([]);
  });

  describe('NativeDesktopHost input feature policy', () => {
    test('unions explicit masks with the operator environment mask', () => {
      const previous = process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES];
      process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES] = 'physicalClick,wheel';
      try {
        expect([...resolveDisabledInputFeatures(['keyboard'])].sort()).toEqual(['keyboard', 'physicalClick', 'wheel']);
      } finally {
        if (previous === undefined) delete process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES];
        else process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES] = previous;
      }
    });
  });

  test.each([
    ['no keys', { actions: ['AXPress'] }],
    ['lists of different lengths', { actions: ['AXPress', 'Toggle'], keys: ['k1'] }],
    ['an empty key', { actions: ['AXPress'], keys: [''] }],
    ['an overlong key', { actions: ['AXPress'], keys: ['k'.repeat(129)] }],
    ['a name that is not a string', { actions: [1], keys: ['k1'] }],
  ])('refuses a response with %s', (_, result) => {
    expect(() => parseKeyedActions(result)).toThrow(expect.objectContaining({ data: { nativeCode: 'invalid-action-keys' } }));
  });
});

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

  test.each(['no-such-element', 'stale-element', 'unsupported-operation', 'automation-failed', 'unmapped-failure'])(
    'carries the effect a provider reports through the translation of %s',
    (nativeCode) => {
      const reported = translateNativeError(attachFailureEffect(new NativeDriverError(nativeCode, 'native failure'), 'partial'));
      const silent = translateNativeError(new NativeDriverError(nativeCode, 'native failure'));

      expect(readFailureEffect(reported)).toBe('partial');
      expect(readFailureEffect(silent)).toBeUndefined();
    },
  );

  test('keeps the reason a provider gives an automation failure, so a caller can tell a target that stopped responding', () => {
    const translated = translateNativeError(
      new NativeDriverError('automation-failed', 'native failure', { axError: { name: 'cannotComplete' }, reason: 'target-non-response' }),
    );

    expect(toWebDriverError(translated)).toMatchObject({
      code: 'unknown error',
      data: { axError: { name: 'cannotComplete' }, nativeCode: 'automation-failed', reason: 'target-non-response' },
      message: 'native failure',
    });
    expect(toWebDriverError(translateNativeError(new NativeDriverError('automation-failed', 'native failure'))).data).toEqual({
      nativeCode: 'automation-failed',
    });
  });

  describe('provider settlement codes', () => {
    test.each<[nativeCode: string, effect: string, disposition: string]>([
      ['mutation-indeterminate', 'unknown', 'indeterminate'],
      ['target-quarantined', 'none', 'rejected'],
    ])('reads %s as a %s effect that a quarantined provider reports', (nativeCode, effect, disposition) => {
      const translated = translateNativeError(new NativeDriverError(nativeCode, 'native failure', { command: 'click' }));

      expect(toWebDriverError(translated)).toMatchObject({
        code: 'unknown error',
        data: { command: 'click', nativeCode },
        message: 'native failure',
      });
      expect(readFailureEffect(translated)).toBe(effect);
      expect(dispositionOfFailure(translated)).toBe(disposition);
      expect(readProviderQuarantine(translated)).toBe(true);
    });

    test('lets the settlement code decide the effect over a contradictory report', () => {
      const reported = attachFailureEffect(new NativeDriverError('mutation-indeterminate', 'native failure'), 'none');

      expect(readFailureEffect(translateNativeError(reported))).toBe('unknown');
    });

    test('does not mark an ordinary failure as a provider quarantine', () => {
      expect(readProviderQuarantine(translateNativeError(new NativeDriverError('no-such-element', 'native failure')))).toBe(false);
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
      wireProtocol: { major: 1, minor: 0 },
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

    test('reports input rejected before dispatch as having no effect, so it never quarantines a target', async () => {
      const policyHost = new NativeDesktopHost({
        application: { windowTitle: 'Test App' },
        artifact,
        disabledInputFeatures: ['keyboard', 'physicalClick', 'wheel'],
        endpoint: 'windows',
      });
      const host = new NativeDesktopHost({ application: { windowTitle: 'Test App' }, artifact, endpoint: 'windows' });
      const failures = await Promise.all(
        [
          policyHost.click('element', 'physical'),
          policyHost.clear('element'),
          policyHost.sendKeys('element', 'text'),
          policyHost.performActions([{ actions: [{ button: 0, type: 'pointerDown' }], id: 'pointer', type: 'pointer' }]),
          host.performActions([{ actions: [{ type: 'keyDown', value: 'AB' }], id: 'key', type: 'key' }]),
        ].map((attempt) =>
          attempt.then(
            () => undefined,
            (error: unknown) => error,
          ),
        ),
      );

      expect(failures).toHaveLength(5);
      for (const failure of failures) {
        expect(failure).toBeInstanceOf(Error);
        expect(readFailureEffect(failure)).toBe('none');
      }
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
