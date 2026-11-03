import { isBareToken, neutralizeText, quoteText, safeToken, utf8Length } from './text';

describe('neutralizeText', () => {
  test('leaves ordinary text, emoji, joiners, tabs, and newlines alone', () => {
    const text = 'Save as…\tname\r\n👨‍👩‍👧 می‌خواهم';
    expect(neutralizeText(text)).toBe(text);
  });

  test('escapes controls, invisible format characters, and line separators', () => {
    expect(neutralizeText('a\u0000b\u0007c\u007fd\u0085e')).toBe('a\\u0000b\\u0007c\\u007fd\\u0085e');
    expect(neutralizeText('x\u200by\u2028z\u2029\u202e\ufeff')).toBe('x\\u200by\\u2028z\\u2029\\u202e\\ufeff');
    expect(neutralizeText('\u2066a\u2069')).toBe('\\u2066a\\u2069');
  });

  test('makes hidden Unicode tag characters visible instead of passing them to a model', () => {
    const hidden = String.fromCodePoint(0xe0049, 0xe0067); // tag "I", tag "g"
    const neutral = neutralizeText(`Save${hidden}`);

    expect(neutral).toBe('Save\\udb40\\udc49\\udb40\\udc67');
    expect(neutral).not.toMatch(/[\ud800-\udfff]/);
  });

  test('keeps other astral characters', () => {
    expect(neutralizeText('😀 \u{1d11e}')).toBe('😀 \u{1d11e}');
  });
});

describe('quoteText', () => {
  test('produces a JSON string literal that decodes to the neutralized text', () => {
    const quoted = quoteText('He said "hi"\nand\\left');

    expect(quoted).toBe('"He said \\"hi\\"\\nand\\\\left"');
    expect(JSON.parse(quoted)).toBe('He said "hi"\nand\\left');
  });

  test('never contains a raw line break or an unescaped invisible character', () => {
    const quoted = quoteText('a\nb\u2028c\u0085d\r');

    expect(quoted).not.toMatch(/[\n\r\u2028\u2029\u0085]/);
  });

  test('marks a clipped string with an ellipsis inside the quotes', () => {
    expect(quoteText('Very long na', true)).toBe('"Very long na…"');
    expect(JSON.parse(quoteText('abc', true))).toBe('abc…');
  });
});

describe('safeToken', () => {
  test('keeps a provider token and replaces anything that could break a line', () => {
    expect(safeToken('AXPress')).toBe('AXPress');
    expect(safeToken('my role "x"\n')).toBe('my_role__x__');
    expect(safeToken('')).toBe('_');
    expect(safeToken('a'.repeat(100))).toHaveLength(48);
  });
});

describe('isBareToken', () => {
  test.each([
    ['num7Button', true],
    ['com.app/Save-1', true],
    ['', false],
    ['two words', false],
    ['quo"te', false],
    ['x'.repeat(129), false],
  ])('%j -> %s', (value, expected) => {
    expect(isBareToken(value)).toBe(expected);
  });
});

describe('utf8Length', () => {
  test('counts bytes, not characters', () => {
    expect(utf8Length('abc')).toBe(3);
    expect(utf8Length('…')).toBe(3);
    expect(utf8Length('😀')).toBe(4);
  });
});
