import { StringDecoder } from 'node:string_decoder';

/** The longest line forwarded; the rest of a longer line is dropped. */
export const maxStderrLineCharacters = 4096;
/** The most text forwarded over a helper's lifetime. */
export const maxStderrCharacters = 1024 * 1024;

const lineTruncatedNotice = ' [line truncated]';
const limitReachedNotice = '[native helper stderr limit reached; further output dropped]\n';

/**
 * Turns helper stderr into bounded lines. Bytes are decoded as UTF-8 across chunk boundaries, so a character split
 * between two reads is never replaced, and each forwarded message is one whole line with its terminator. Output
 * is bounded per line and in total, so a helper that floods stderr cannot grow Node's memory or the log.
 */
export class StderrLineDecoder {
  private readonly decoder = new StringDecoder('utf8');
  private readonly onLine: (line: string) => void;
  private line = '';
  private lineTruncated = false;
  private forwarded = 0;
  private limitReached = false;

  constructor(onLine: (line: string) => void) {
    this.onLine = onLine;
  }

  write(chunk: Uint8Array): void {
    this.consume(this.decoder.write(Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength)));
  }

  /** Forwards the unterminated final line, if any. */
  end(): void {
    this.consume(this.decoder.end());
    if (this.line.length > 0) {
      this.emitLine(this.line + (this.lineTruncated ? lineTruncatedNotice : ''));
      this.line = '';
      this.lineTruncated = false;
    }
  }

  private consume(text: string): void {
    let start = 0;
    while (start < text.length) {
      const newline = text.indexOf('\n', start);
      const end = newline === -1 ? text.length : newline;
      this.append(text.slice(start, end));
      if (newline === -1) {
        return;
      }
      this.emitLine(`${this.line}${this.lineTruncated ? lineTruncatedNotice : ''}\n`);
      this.line = '';
      this.lineTruncated = false;
      start = newline + 1;
    }
  }

  private append(segment: string): void {
    const room = maxStderrLineCharacters - this.line.length;
    if (segment.length <= room) {
      this.line += segment;
      return;
    }
    this.lineTruncated = true;
    let kept = segment.slice(0, Math.max(room, 0));
    const last = kept.charCodeAt(kept.length - 1);
    if (last >= 0xd800 && last <= 0xdbff) {
      kept = kept.slice(0, -1);
    }
    this.line += kept;
  }

  private emitLine(line: string): void {
    if (this.limitReached) {
      return;
    }
    if (this.forwarded + line.length > maxStderrCharacters) {
      this.limitReached = true;
      this.onLine(limitReachedNotice);
      return;
    }
    this.forwarded += line.length;
    this.onLine(line);
  }
}
