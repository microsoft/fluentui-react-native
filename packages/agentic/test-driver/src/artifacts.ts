/**
 * Run artifacts.
 *
 * Screenshots, accessibility source, and logs routinely contain private content, so the writer
 * redacts anything that could carry a credential or user-typed value before it reaches disk, and
 * keeps every path inside the run directory.
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { DesktopDriverError } from './errors.ts';
import { PORTABLE_COMMAND_MATRIX_VERSION } from './capabilities.ts';
import { DESKTOP_PROTOCOL_VERSION } from './protocol.ts';
import { renderJUnit } from './junit.ts';
import type { ArtifactManifest, DesktopLifecycleEvent, DesktopRunReport, DesktopTestResult } from './types.ts';

/** Keys whose values are never persisted, at any nesting depth. */
const REDACTED_KEYS = new Set([
  'token',
  'authorization',
  'auth',
  'password',
  'secret',
  'apikey',
  'api_key',
  'cookie',
  'clipboard',
  'value',
  'text_input',
  'env',
  'environment',
]);

const REDACTED = '[redacted]';

/**
 * Recursively replaces sensitive values and bounds the payload size.
 *
 * `value` is redacted because it is the property a `setValue` step carries, which is exactly the
 * text a user typed.
 */
export function redact(input: unknown, depth = 0): unknown {
  if (depth > 6) {
    return '[truncated]';
  }
  if (typeof input === 'string') {
    return input.length > 2000 ? `${input.slice(0, 2000)}…[truncated]` : input;
  }
  if (Array.isArray(input)) {
    return input.slice(0, 100).map((entry) => redact(entry, depth + 1));
  }
  if (typeof input === 'object' && input !== null) {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(input as Record<string, unknown>)) {
      output[key] = REDACTED_KEYS.has(key.toLowerCase()) ? REDACTED : redact(entry, depth + 1);
    }
    return output;
  }
  return input;
}

/** Generates a sortable, filesystem-safe run id. */
export function createRunId(now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  return `${stamp}-${crypto.randomBytes(3).toString('hex')}`;
}

/** Converts an arbitrary test title into a stable directory name. */
export function toArtifactId(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return normalized.length > 0 ? normalized : crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

export interface ArtifactStoreOptions {
  rootDirectory: string;
  runId?: string;
}

/** Owns the on-disk layout described in the package README. */
export class ArtifactStore {
  readonly runId: string;
  readonly runDirectory: string;
  private readonly files = new Set<string>();
  private eventStream?: fs.WriteStream;

  constructor(options: ArtifactStoreOptions) {
    this.runId = options.runId ?? createRunId();
    this.runDirectory = path.join(path.resolve(options.rootDirectory), this.runId);
    fs.mkdirSync(this.runDirectory, { recursive: true });
  }

  /** Resolves a path inside the run directory, rejecting traversal. */
  resolve(...segments: string[]): string {
    const target = path.resolve(this.runDirectory, ...segments);
    const relative = path.relative(this.runDirectory, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new DesktopDriverError('Artifact path escapes the run directory', {
        kind: 'validation',
        detail: { segments },
      });
    }
    return target;
  }

  testDirectory(testId: string): string {
    const directory = this.resolve('tests', toArtifactId(testId));
    fs.mkdirSync(directory, { recursive: true });
    return directory;
  }

  write(relativePath: string, contents: string | Uint8Array): string {
    const target = this.resolve(relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
    this.files.add(path.relative(this.runDirectory, target));
    return target;
  }

  /** Appends a redacted lifecycle event to `events.ndjson`. */
  appendEvent(event: DesktopLifecycleEvent): void {
    if (!this.eventStream) {
      this.eventStream = fs.createWriteStream(this.resolve('events.ndjson'), { flags: 'a' });
      this.files.add('events.ndjson');
    }
    this.eventStream.write(`${JSON.stringify(redact(event))}\n`);
  }

  writeRunReport(report: Omit<DesktopRunReport, 'protocolVersion' | 'portableCommandMatrixVersion' | 'artifacts'>): DesktopRunReport {
    const full: DesktopRunReport = {
      ...report,
      protocolVersion: DESKTOP_PROTOCOL_VERSION,
      portableCommandMatrixVersion: PORTABLE_COMMAND_MATRIX_VERSION,
      artifacts: [...this.files].sort(),
    };
    this.write('run.json', `${JSON.stringify(redact(full), null, 2)}\n`);
    return full;
  }

  writeJUnit(suiteName: string, results: readonly DesktopTestResult[]): string {
    return this.write('junit.xml', renderJUnit(suiteName, results));
  }

  manifest(): ArtifactManifest {
    return { runId: this.runId, directory: this.runDirectory, files: [...this.files].sort() };
  }

  async close(): Promise<void> {
    const stream = this.eventStream;
    this.eventStream = undefined;
    if (!stream) {
      return;
    }
    await new Promise<void>((resolve) => {
      stream.end(resolve);
    });
  }
}
