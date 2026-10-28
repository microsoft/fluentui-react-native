import { readFileSync } from 'node:fs';
import path from 'node:path';
import { applyTransform, defineTest } from 'jscodeshift/dist/testUtils';
import transform from '../button-v0-to-v1';

jest.autoMockOff();

describe('button-v0-to-v1', () => {
  defineTest(__dirname, 'button-v0-to-v1', null, 'button-v0-to-v1', { parser: 'tsx' });

  test('preserves CRLF source line endings', () => {
    const fixture = (kind: string) =>
      readFileSync(path.join(__dirname, '..', '__testfixtures__', `button-v0-to-v1.${kind}.tsx`), 'utf8')
        .replaceAll('\r\n', '\n')
        .replaceAll('\n', '\r\n');
    expect(applyTransform(transform, {}, { source: fixture('input') }, { parser: 'tsx' })).toBe(fixture('output').trim());
  });
});
