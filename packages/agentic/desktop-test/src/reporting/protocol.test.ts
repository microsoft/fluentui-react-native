import { redactDesktopSecrets } from './protocol';

describe('redactDesktopSecrets', () => {
  test('redacts known secrets, longest first', () => {
    expect(redactDesktopSecrets('token abc and abcdef', ['abc', 'abcdef'])).toBe('token [REDACTED] and [REDACTED]');
  });

  test.each([
    ['password=hunter2', 'password=[REDACTED]'],
    ['leaseNonce: n-1', 'leaseNonce: [REDACTED]'],
    ['{"bridgeNonce":"n-2"}', '{"bridgeNonce":"[REDACTED]"}'],
    ['"authorization" : "Bearer"', '"authorization" : "[REDACTED]"'],
    ['access-token = t; next', 'access-token = [REDACTED]; next'],
    ['ACCESS_TOKEN:t', 'ACCESS_TOKEN:[REDACTED]'],
  ])('redacts the value assigned in %s', (input, expected) => {
    expect(redactDesktopSecrets(input, [])).toBe(expected);
  });

  test('leaves unassigned keywords alone', () => {
    expect(redactDesktopSecrets('password reset requested', [])).toBe('password reset requested');
  });

  test('stays linear on keywords followed by long whitespace without an assignment', () => {
    const input = `${'password'}${' '.repeat(50_000)}x`.repeat(4);
    const started = performance.now();
    expect(redactDesktopSecrets(input, [])).toBe(input);
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});
