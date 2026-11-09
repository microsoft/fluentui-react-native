import fs from 'node:fs/promises';
import type { FileHandle } from 'node:fs/promises';

import type { EventData } from './protocol.js';

export type DesktopScopeStatus = Extract<EventData, { kind: 'scope-end' }>['payload']['status'];

const symbols: Record<DesktopScopeStatus, string> = { passed: '✔', failed: '✖', skipped: '○', unsupported: '○', cancelled: '⚠' };
const headBytes = 4096;

/** Formats a duration for an operation header: `850ms`, `4.2s`, `42s`, `2m 03s`, or `1h 02m`. */
export function formatDuration(milliseconds: number): string {
  const whole = Math.round(Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0);
  if (whole < 1000) return `${whole}ms`;
  const tenths = Math.round(whole / 100);
  if (tenths < 100) return `${Math.floor(tenths / 10)}.${tenths % 10}s`;
  const seconds = Math.round(whole / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

// The Actions runner trims these (.NET `Char.IsWhiteSpace`) before it looks for `::`.
function isRunnerWhitespace(code: number): boolean {
  return (
    (code >= 0x09 && code <= 0x0d) ||
    code === 0x20 ||
    code === 0x85 ||
    code === 0xa0 ||
    code === 0x1680 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000
  );
}

function neutralizeLine(line: string): string {
  let start = 0;
  while (start < line.length && isRunnerWhitespace(line.charCodeAt(start))) start++;
  const guarded = line.startsWith('::', start) ? `${line.slice(0, start + 1)} ${line.slice(start + 1)}` : line;
  return guarded.replaceAll('##[', '# #[');
}

/**
 * Defuses text the Actions runner would read as a workflow command: `::` after the leading whitespace of a line (the
 * runner splits lines on CR and LF) and `##[` anywhere. Everything the reporter prints that it did not build as a
 * command passes through this, so child output needs no `::stop-commands::` wrapper. Only text that would have been
 * a command changes.
 */
export function neutralizeWorkflowCommands(text: string): string {
  if (!text.includes('::') && !text.includes('##[')) return text;
  let result = '';
  let start = 0;
  for (let index = 0; index <= text.length; index++) {
    const code = index < text.length ? text.charCodeAt(index) : 0x0a;
    if (code !== 0x0a && code !== 0x0d) continue;
    result += neutralizeLine(text.slice(start, index)) + (index < text.length ? text[index] : '');
    start = index + 1;
  }
  return result;
}

/** Drops trailing line breaks so one printed message is one block of lines. */
export function trimTrailingLineBreaks(text: string): string {
  let end = text.length;
  while (end > 0 && (text[end - 1] === '\n' || text[end - 1] === '\r')) end--;
  return end === text.length ? text : text.slice(0, end);
}

/**
 * Collapses text to one line: line separators become spaces and text longer than `maxLength` is clipped with an
 * ellipsis. Escape sequences and tabs are kept so colored child output survives.
 */
export function singleLine(text: string, maxLength = 4096): string {
  const limit = Math.min(text.length, maxLength);
  let line = '';
  for (let index = 0; index < limit; index++) {
    const code = text.charCodeAt(index);
    line += code === 0x0a || code === 0x0d || code === 0x85 || code === 0x2028 || code === 0x2029 ? ' ' : text[index];
  }
  const clipped = text.length > limit;
  const last = line.charCodeAt(line.length - 1);
  if (clipped && last >= 0xd800 && last <= 0xdbff) line = line.slice(0, -1);
  return line.trimEnd() + (clipped ? '…' : '');
}

export type DesktopOperationHeader = {
  status: DesktopScopeStatus;
  label: string;
  durationMs?: number;
  /** The outcome in a few words. Skipped, unsupported, and cancelled operations name their status when it is omitted. */
  detail?: string;
};

/** The one-line outcome of an operation, such as `✔ pod install (42s)` or `✖ rnx-cli build (4m 03s): exit code 65`. */
export function formatOperationHeader({ status, label, durationMs, detail }: DesktopOperationHeader): string {
  const duration = durationMs === undefined ? '' : ` (${formatDuration(durationMs)})`;
  const outcome = detail ?? (status === 'passed' || status === 'failed' ? undefined : status);
  return `${symbols[status]} ${singleLine(label, 200)}${duration}${outcome ? `: ${singleLine(outcome, 400)}` : ''}`;
}

export type DesktopLogExcerptLimits = { lines: number; bytes: number };

async function readRange(handle: FileHandle, position: number, length: number): Promise<Buffer> {
  const buffer = Buffer.alloc(length);
  let filled = 0;
  while (filled < length) {
    const { bytesRead } = await handle.read(buffer, filled, length - filled, position + filled);
    if (bytesRead === 0) break;
    filled += bytesRead;
  }
  return filled === length ? buffer : buffer.subarray(0, filled);
}

/**
 * Reads the lines of a command log to show. A log within `limits` comes back whole. A larger one keeps its first line,
 * which names the command, then `omittedNote`, then the last lines that fit.
 */
export async function readLogExcerpt(file: string, limits: DesktopLogExcerptLimits, omittedNote: string): Promise<string[]> {
  const handle = await fs.open(file, 'r');
  try {
    const { size } = await handle.stat();
    const windowStart = Math.max(0, size - limits.bytes);
    // The byte before the window shows whether the window begins on a line boundary.
    const from = Math.max(0, windowStart - 1);
    const window = await readRange(handle, from, size - from);
    const partial = windowStart > 0;
    let offset = 0;
    let cut = false;
    if (partial) {
      offset = 1;
      if (window[0] !== 0x0a) {
        const newline = window.indexOf(0x0a, 1);
        // A single line can fill the whole window; its end is more useful than nothing.
        cut = newline < 0 || newline === window.length - 1;
        offset = cut ? 0 : newline + 1;
      }
    }
    const lines = window.toString('utf8', offset).split('\n');
    if (cut) {
      let start = 0;
      while (lines[0][start] === '\uFFFD') start++;
      lines[0] = `…${lines[0].slice(start)}`;
    }
    if (lines.at(-1) === '') lines.pop();
    const capped = lines.length > limits.lines;
    const tail = capped ? lines.slice(lines.length - Math.max(0, limits.lines)) : lines;
    if (!partial && !capped) return tail;
    const head = await readRange(handle, 0, Math.min(size, headBytes));
    const newline = head.indexOf(0x0a);
    let first = head.toString('utf8', 0, newline < 0 ? head.length : newline);
    if (newline < 0 && size > head.length) {
      while (first.endsWith('\uFFFD')) first = first.slice(0, -1);
      first += '…';
    }
    return [first, omittedNote, ...tail];
  } finally {
    await handle.close();
  }
}
