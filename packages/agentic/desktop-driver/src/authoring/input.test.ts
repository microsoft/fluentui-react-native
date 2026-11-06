import { matchesDesktopPlatforms, resolveDesktopInput, validateDesktopCaseOptions } from './input.js';

describe('desktop input descriptors', () => {
  test.each([
    [undefined, [], 'both'],
    [undefined, ['click'], 'both'],
    [undefined, ['physical-click'], 'physical'],
    [undefined, ['accessibility-click'], 'accessible'],
    ['accessible', [], 'accessible'],
    ['physical', ['click'], 'physical'],
  ] as const)('derives input from %s and %s', (input, requires, expected) => {
    expect(resolveDesktopInput(input, requires)).toBe(expected);
  });

  test('rejects mixed transports and explicit widening', () => {
    expect(() => resolveDesktopInput(undefined, ['keyboard', 'accessibility-click'])).toThrow('split the case');
    expect(() => resolveDesktopInput('both', ['physical-click'])).toThrow('cannot widen');
    expect(() => resolveDesktopInput('physical', ['accessibility-click'])).toThrow('cannot widen');
  });

  test('validates platform filters and negation', () => {
    expect(matchesDesktopPlatforms(['!win32'], 'windows')).toBe(true);
    expect(matchesDesktopPlatforms(['!win32'], 'win32')).toBe(false);
    expect(() => validateDesktopCaseOptions({ platforms: ['macos', '!win32'] })).toThrow('known');
    expect(() => validateDesktopCaseOptions({ platforms: ['!macos', '!windows', '!win32'] })).toThrow('every platform');
  });

  test('rejects duplicate and unknown requirements', () => {
    expect(() => validateDesktopCaseOptions({ requires: ['click', 'click'] })).toThrow('duplicate');
    expect(() => validateDesktopCaseOptions({ requires: ['input'] })).toThrow('unsupported requirement');
  });
});
