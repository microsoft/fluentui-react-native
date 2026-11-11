import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { createAbortError, throwIfAborted } from './filesystem.js';
import { NativeDriverError } from './NativeDriverError.js';

export type BoundedCommandOptions = {
  /** How long to wait for stdio to close after the process exits, because a descendant can keep the pipes open. */
  closeGraceMs?: number;
  /** How long a terminated process may ignore the request before it is killed. */
  killGraceMs?: number;
  /** The most output kept per stream. The oldest bytes are dropped first. */
  maxOutputBytes: number;
  signal?: AbortSignal;
  timeoutMs: number;
};

export type BoundedCommandResult = {
  code: number | null;
  stderr: string;
  stderrTruncated: boolean;
  stdout: string;
  stdoutTruncated: boolean;
  terminationSignal: NodeJS.Signals | null;
  timedOut: boolean;
};

/**
 * Runs one child process with bounded output and a deadline. It never rejects for a non-zero exit, so the caller owns
 * the error taxonomy, but it does reject for a spawn failure and for abort. A process that ignores termination is killed,
 * and stdio that a descendant keeps open does not delay the result beyond a short grace.
 */
export async function runBoundedCommand(
  command: string,
  args: readonly string[],
  { closeGraceMs = 2_000, killGraceMs = 5_000, maxOutputBytes, signal, timeoutMs }: BoundedCommandOptions,
): Promise<BoundedCommandResult> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const stdout = new TailBuffer(maxOutputBytes);
    const stderr = new TailBuffer(maxOutputBytes);
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));

    const timers: NodeJS.Timeout[] = [];
    let settled = false;
    let aborted = false;
    let timedOut = false;
    let terminating = false;
    let exited = false;
    let code: number | null = null;
    let terminationSignal: NodeJS.Signals | null = null;

    const finish = (outcome: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      for (const timer of timers) {
        clearTimeout(timer);
      }
      signal?.removeEventListener('abort', onAbort);
      child.stdout.destroy();
      child.stderr.destroy();
      outcome();
    };
    const complete = () =>
      finish(() => {
        if (aborted) {
          reject(createAbortError());
          return;
        }
        resolve({
          code,
          stderr: stderr.text(),
          stderrTruncated: stderr.truncated,
          stdout: stdout.text(),
          stdoutTruncated: stdout.truncated,
          terminationSignal,
          timedOut,
        });
      });
    const terminate = () => {
      if (terminating || exited) {
        return;
      }
      terminating = true;
      child.kill('SIGTERM');
      timers.push(setTimeout(() => child.kill('SIGKILL'), killGraceMs));
      timers.push(setTimeout(complete, killGraceMs + closeGraceMs));
    };
    function onAbort() {
      aborted = true;
      terminate();
    }

    child.once('error', (error) => finish(() => reject(error)));
    child.once('exit', (exitCode, exitSignal) => {
      exited = true;
      code = exitCode;
      terminationSignal = exitSignal;
      timers.push(setTimeout(complete, closeGraceMs));
    });
    child.once('close', complete);
    signal?.addEventListener('abort', onAbort, { once: true });
    timers.push(
      setTimeout(() => {
        if (!exited) {
          timedOut = true;
          terminate();
        }
      }, timeoutMs),
    );
  });
}

const buildCommandTimeoutMs = 30 * 60 * 1000;
const buildCommandOutputLimit = 16 * 1024 * 1024;
const buildFailureDetailLength = 4_096;

export type BuildCommandOptions = {
  /** The error code for a non-zero exit. A process that was killed by a signal always reports `build-failed`. */
  exitFailureCode?: string;
  /** Receives the bounded combined output before any failure is thrown, so diagnostics survive a failed build. */
  logPath?: string;
  signal?: AbortSignal;
};

/**
 * Runs a toolchain or build command and turns a timeout or non-zero exit into a typed error whose message carries only
 * a clipped excerpt of the output. The full bounded output goes to `logPath`, never into the error.
 */
export async function runBuildCommand(
  command: string,
  args: readonly string[],
  options: BuildCommandOptions = {},
): Promise<{ stderr: string; stdout: string }> {
  const { exitFailureCode = 'build-failed', logPath, signal } = options;
  const result = await runBoundedCommand(command, args, {
    maxOutputBytes: buildCommandOutputLimit,
    signal,
    timeoutMs: buildCommandTimeoutMs,
  });
  if (logPath) {
    fs.writeFileSync(logPath, `${result.stdout}${result.stderr}`);
  }
  const name = path.basename(command);
  if (result.timedOut) {
    throw new NativeDriverError('build-timeout', `${name} exceeded the 30-minute build deadline.`);
  }
  if (result.code !== 0) {
    const details = clipDiagnostic(`${result.stdout}${result.stderr}`, buildFailureDetailLength);
    throw new NativeDriverError(
      result.code === null ? 'build-failed' : exitFailureCode,
      `${name} ${result.code === null ? `was terminated by ${String(result.terminationSignal)}` : `exited with code ${result.code}`}.${details ? `\n${details}` : ''}`,
    );
  }
  return { stderr: result.stderr, stdout: result.stdout };
}

/** Strips control characters and keeps the end of a diagnostic, where a failing tool reports its cause. */
export function clipDiagnostic(text: string, maxLength = 2_048): string {
  const printable = text.replaceAll(/(?![\t\n])\p{Cc}/gu, '').trim();
  return printable.length > maxLength ? `...${printable.slice(-maxLength)}` : printable;
}

class TailBuffer {
  truncated = false;

  private chunks: Buffer[] = [];
  private readonly limit: number;
  private size = 0;

  constructor(limit: number) {
    this.limit = limit;
  }

  push(chunk: Buffer): void {
    this.chunks.push(chunk);
    this.size += chunk.length;
    while (this.size > this.limit) {
      const excess = this.size - this.limit;
      const [first] = this.chunks;
      this.truncated = true;
      if (first.length <= excess) {
        this.chunks.shift();
        this.size -= first.length;
      } else {
        this.chunks[0] = first.subarray(excess);
        this.size -= excess;
      }
    }
  }

  text(): string {
    return Buffer.concat(this.chunks).toString('utf8');
  }
}
