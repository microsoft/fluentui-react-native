import { NativeDriverError } from '../../native/NativeDriverError';
import { toWebDriverError } from '../../protocol/errors';
import type { WebDriverErrorCode } from '../../protocol/errors';
import { translateNativeError } from './NativeDesktopHost';

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
});
