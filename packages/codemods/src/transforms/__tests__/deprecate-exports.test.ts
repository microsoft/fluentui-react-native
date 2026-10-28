import { readFileSync } from 'node:fs';
import path from 'node:path';
import { applyTransform, defineTest } from 'jscodeshift/dist/testUtils';
import transform from '../deprecate-exports';

jest.autoMockOff();

describe('deprecate-exports', () => {
  defineTest(__dirname, 'deprecate-exports', null, 'deprecate-exports', { parser: 'tsx' });

  test('preserves CRLF source line endings', () => {
    const fixture = (kind: string) =>
      readFileSync(path.join(__dirname, '..', '__testfixtures__', `deprecate-exports.${kind}.tsx`), 'utf8')
        .replaceAll('\r\n', '\n')
        .replaceAll('\n', '\r\n');
    expect(applyTransform(transform, {}, { source: fixture('input') }, { parser: 'tsx' })).toBe(fixture('output').trim());
  });
});
