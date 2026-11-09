import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  formatDuration,
  formatOperationHeader,
  neutralizeWorkflowCommands,
  readLogExcerpt,
  singleLine,
  trimTrailingLineBreaks,
} from './presentation.js';

describe('formatDuration', () => {
  test.each([
    [0, '0ms'],
    [850, '850ms'],
    [999, '999ms'],
    [999.6, '1.0s'],
    [4234, '4.2s'],
    [9950, '10s'],
    [42_000, '42s'],
    [59_500, '1m 00s'],
    [123_000, '2m 03s'],
    [3_599_500, '1h 00m'],
    [3_723_000, '1h 02m'],
    [-5, '0ms'],
    [Number.NaN, '0ms'],
    [Number.POSITIVE_INFINITY, '0ms'],
  ])('%p is %s', (milliseconds, expected) => {
    expect(formatDuration(milliseconds)).toBe(expected);
  });
});

describe('singleLine', () => {
  test('replaces every kind of line separator with a space', () => {
    expect(singleLine('one\ntwo\r\nthree\u0085four\u2028five\u2029six')).toBe('one two  three four five six');
  });

  test('trims trailing whitespace but keeps tabs and escape sequences', () => {
    expect(singleLine('a\tb  \n')).toBe('a\tb');
    expect(singleLine('\u001b[31mred\u001b[0m')).toBe('\u001b[31mred\u001b[0m');
  });

  test('clips long text with an ellipsis and never leaves half of a surrogate pair', () => {
    expect(singleLine('abc', 3)).toBe('abc');
    expect(singleLine('abcdef', 3)).toBe('abc…');
    expect(singleLine('ab\u{1F600}', 3)).toBe('ab…');
    expect(singleLine('ab\u{1F600}', 4)).toBe('ab\u{1F600}');
  });
});

describe('neutralizeWorkflowCommands', () => {
  test.each([
    ['plain text', 'plain text'],
    ['', ''],
    ['text ::error::not at the start', 'text ::error::not at the start'],
    ['::error::boom', ': :error::boom'],
    ['::stop-commands::token', ': :stop-commands::token'],
    ['  \t::warning::indented', '  \t: :warning::indented'],
    [':::triple', ': ::triple'],
    ['abc ##[group]title', 'abc # #[group]title'],
    ['##[error]boom', '# #[error]boom'],
  ])('%j becomes %j', (text, expected) => {
    expect(neutralizeWorkflowCommands(text)).toBe(expected);
  });

  test('looks past every character the runner trims, and only those', () => {
    expect(neutralizeWorkflowCommands('\u00a0::x')).toBe('\u00a0: :x');
    expect(neutralizeWorkflowCommands('\u0085::x')).toBe('\u0085: :x');
    expect(neutralizeWorkflowCommands('\u2028::x')).toBe('\u2028: :x');
    expect(neutralizeWorkflowCommands('\u3000::x')).toBe('\u3000: :x');
    expect(neutralizeWorkflowCommands('\u200b::x')).toBe('\u200b::x');
  });

  test('guards each line, where the runner splits on both CR and LF', () => {
    expect(neutralizeWorkflowCommands('::a::\nok\n::b::\n')).toBe(': :a::\nok\n: :b::\n');
    expect(neutralizeWorkflowCommands('safe\r::error::boom')).toBe('safe\r: :error::boom');
    expect(neutralizeWorkflowCommands('safe\r\n::error::boom\r\n')).toBe('safe\r\n: :error::boom\r\n');
  });

  test('is idempotent', () => {
    for (const text of ['::error::boom', '  ::x::\n##[group]y\n::z::', 'ok']) {
      const once = neutralizeWorkflowCommands(text);
      expect(neutralizeWorkflowCommands(once)).toBe(once);
    }
  });
});

describe('trimTrailingLineBreaks', () => {
  test.each([
    ['a\n\n', 'a'],
    ['a\r\n', 'a'],
    ['a\nb', 'a\nb'],
    ['a \n', 'a '],
    ['\n', ''],
    ['', ''],
  ])('%j becomes %j', (text, expected) => {
    expect(trimTrailingLineBreaks(text)).toBe(expected);
  });
});

describe('formatOperationHeader', () => {
  test('shows the status, label, duration, and detail', () => {
    expect(formatOperationHeader({ status: 'passed', label: 'pod install', durationMs: 42_000 })).toBe('✔ pod install (42s)');
    expect(formatOperationHeader({ status: 'passed', label: 'Render stories', durationMs: 2, detail: '2 stories rendered' })).toBe(
      '✔ Render stories (2ms): 2 stories rendered',
    );
    expect(formatOperationHeader({ status: 'failed', label: 'rnx-cli build', durationMs: 243_000, detail: 'exit code 65' })).toBe(
      '✖ rnx-cli build (4m 03s): exit code 65',
    );
  });

  test('omits the duration when it is unknown and the detail when it is empty', () => {
    expect(formatOperationHeader({ status: 'passed', label: 'Step' })).toBe('✔ Step');
    expect(formatOperationHeader({ status: 'passed', label: 'Step', detail: '' })).toBe('✔ Step');
    expect(formatOperationHeader({ status: 'failed', label: 'Step' })).toBe('✖ Step');
  });

  test('names the status of an operation that did not pass or fail', () => {
    expect(formatOperationHeader({ status: 'skipped', label: 'Step' })).toBe('○ Step: skipped');
    expect(formatOperationHeader({ status: 'unsupported', label: 'Step' })).toBe('○ Step: unsupported');
    expect(formatOperationHeader({ status: 'cancelled', label: 'Step' })).toBe('⚠ Step: cancelled');
    expect(formatOperationHeader({ status: 'skipped', label: 'Step', detail: 'no devices' })).toBe('○ Step: no devices');
  });

  test('keeps the header on one line', () => {
    expect(formatOperationHeader({ status: 'failed', label: 'two\nlines', detail: 'first\nsecond' })).toBe('✖ two lines: first second');
    expect(formatOperationHeader({ status: 'passed', label: 'x'.repeat(300) })).toBe(`✔ ${'x'.repeat(200)}…`);
  });
});

describe('readLogExcerpt', () => {
  let directory: string;
  const note = 'earlier output omitted';
  const numbered = (count: number) => Array.from({ length: count }, (_, index) => `line-${String(index).padStart(2, '0')}`);

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-desktop-excerpt-'));
  });

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  function log(content: string): string {
    const file = path.join(directory, 'command.log');
    fs.writeFileSync(file, content);
    return file;
  }

  test('returns a log within the limits whole', async () => {
    await expect(readLogExcerpt(log('$ cmd\n[stdout] one\n[stderr] two\n'), { lines: 10, bytes: 1024 }, note)).resolves.toEqual([
      '$ cmd',
      '[stdout] one',
      '[stderr] two',
    ]);
  });

  test('returns a last line that has no line break, keeps carriage returns, and handles an empty log', async () => {
    await expect(readLogExcerpt(log('a\r\nb'), { lines: 10, bytes: 1024 }, note)).resolves.toEqual(['a\r', 'b']);
    await expect(readLogExcerpt(log(''), { lines: 10, bytes: 1024 }, note)).resolves.toEqual([]);
  });

  test('keeps the first line, a note, and the last lines when there are too many', async () => {
    const lines = numbered(20);

    await expect(readLogExcerpt(log(lines.join('\n') + '\n'), { lines: 3, bytes: 1024 * 1024 }, note)).resolves.toEqual([
      'line-00',
      note,
      'line-17',
      'line-18',
      'line-19',
    ]);
  });

  test('starts the last bytes at a line boundary', async () => {
    // Each line is 8 bytes, so a 50 byte window begins inside line-13 and the excerpt begins with the next whole line.
    const file = log(numbered(20).join('\n') + '\n');

    await expect(readLogExcerpt(file, { lines: 1000, bytes: 50 }, note)).resolves.toEqual(['line-00', note, ...numbered(20).slice(14)]);
    // A window that begins exactly where a line does keeps that line.
    await expect(readLogExcerpt(file, { lines: 1000, bytes: 56 }, note)).resolves.toEqual(['line-00', note, ...numbered(20).slice(13)]);
  });

  test('never starts the excerpt inside a multi-byte character', async () => {
    const excerpt = await readLogExcerpt(log('first\n€€€€\nlast\n'), { lines: 1000, bytes: 8 }, note);

    expect(excerpt).toEqual(['first', note, 'last']);
  });

  test('shows the end of a single line that is larger than the window', async () => {
    const excerpt = await readLogExcerpt(log('x'.repeat(10_000)), { lines: 10, bytes: 100 }, note);

    expect(excerpt).toHaveLength(3);
    expect(excerpt[0]).toBe(`${'x'.repeat(4096)}…`);
    expect(excerpt[1]).toBe(note);
    expect(excerpt[2]).toMatch(/^…x{100,101}$/);
  });

  test('shows the end of a newline-terminated line that is larger than the window', async () => {
    const excerpt = await readLogExcerpt(log(`$ cmd\n${'x'.repeat(10_000)}\n`), { lines: 10, bytes: 100 }, note);

    expect(excerpt).toHaveLength(3);
    expect(excerpt[0]).toBe('$ cmd');
    expect(excerpt[1]).toBe(note);
    expect(excerpt[2]).toMatch(/^…x{98,100}$/);
  });

  test('rejects when the log cannot be read', async () => {
    await expect(readLogExcerpt(path.join(directory, 'missing.log'), { lines: 10, bytes: 1024 }, note)).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});
