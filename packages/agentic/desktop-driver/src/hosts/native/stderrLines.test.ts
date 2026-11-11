import { maxStderrCharacters, maxStderrLineCharacters, StderrLineDecoder } from './stderrLines';

function collect(): { decoder: StderrLineDecoder; lines: string[] } {
  const lines: string[] = [];
  return { decoder: new StderrLineDecoder((line) => lines.push(line)), lines };
}

describe('StderrLineDecoder', () => {
  test('forwards whole lines with their terminators and the unterminated tail on end()', () => {
    const { decoder, lines } = collect();

    decoder.write(Buffer.from('one\ntw'));
    decoder.write(Buffer.from('o\r\nthree'));
    expect(lines).toEqual(['one\n', 'two\r\n']);

    decoder.end();
    expect(lines).toEqual(['one\n', 'two\r\n', 'three']);
  });

  test('keeps a multi-byte character intact when it is split between chunks', () => {
    const { decoder, lines } = collect();
    const bytes = Buffer.from('naïve 😀 日本\n', 'utf8');

    for (const byte of bytes) {
      decoder.write(Buffer.from([byte]));
    }

    expect(lines).toEqual(['naïve 😀 日本\n']);
  });

  test('truncates an overlong line, never splitting a surrogate pair, and resumes on the next line', () => {
    const { decoder, lines } = collect();

    decoder.write(Buffer.from(`${'a'.repeat(maxStderrLineCharacters - 1)}😀 tail\nnext\n`));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(`${'a'.repeat(maxStderrLineCharacters - 1)} [line truncated]\n`);
    expect(lines[1]).toBe('next\n');
  });

  test('bounds a line that never ends across many chunks', () => {
    const { decoder, lines } = collect();

    for (let index = 0; index < 100; index += 1) {
      decoder.write(Buffer.alloc(1024, 0x62));
    }
    decoder.end();

    expect(lines).toHaveLength(1);
    expect(lines[0]?.length).toBeLessThan(maxStderrLineCharacters + 64);
  });

  test('stops forwarding after the total limit and says so once', () => {
    const { decoder, lines } = collect();
    const line = `${'x'.repeat(1023)}\n`;

    for (let index = 0; index < (maxStderrCharacters / line.length) * 2; index += 1) {
      decoder.write(Buffer.from(line));
    }

    expect(lines.slice(0, -1).every((forwarded) => forwarded === line)).toBe(true);
    expect(lines.at(-1)).toContain('limit reached');
    expect(lines.filter((forwarded) => forwarded.includes('limit reached'))).toHaveLength(1);
    expect(lines.slice(0, -1).join('').length).toBeLessThanOrEqual(maxStderrCharacters);
  });
});
