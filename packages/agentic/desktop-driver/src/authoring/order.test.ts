import { compareDesktopCodePoints } from './order.js';

describe('compareDesktopCodePoints', () => {
  test('orders by code point, independent of the locale', () => {
    expect(['é', 'z', 'Z', 'a', 'B', 'ä'].sort(compareDesktopCodePoints)).toEqual(['B', 'Z', 'a', 'z', 'ä', 'é']);
    expect(['a/b', 'a-b', 'a', 'a b'].sort(compareDesktopCodePoints)).toEqual(['a', 'a b', 'a-b', 'a/b']);
  });

  test('orders characters beyond the Basic Multilingual Plane after U+FFFD, unlike UTF-16 code units', () => {
    const astral = '\u{1F600}';
    const high = '\uFFFD';
    expect('\uD83D' < high).toBe(true);
    expect(compareDesktopCodePoints(astral, high)).toBe(1);
    expect(compareDesktopCodePoints(high, astral)).toBe(-1);
    expect(compareDesktopCodePoints(`a${astral}`, `a${astral}b`)).toBe(-1);
  });

  test('treats equal text as equal and a prefix as smaller', () => {
    expect(compareDesktopCodePoints('same', 'same')).toBe(0);
    expect(compareDesktopCodePoints('story', 'story/test')).toBe(-1);
    expect(compareDesktopCodePoints('story/test', 'story')).toBe(1);
  });
});
