import { randomUUID } from 'node:crypto';

import { singleLine } from './presentation.js';
import type { EventContext, EventEmitter } from './protocol.js';

export type DesktopOperationOptions = {
  /** What the operation does, such as `Render stories`. It is the label of the outcome header. */
  label: string;
  category?: 'service' | 'worker' | 'phase';
  /** A scope can start only once, so the default is unique. */
  scopeId?: string;
  context?: EventContext;
};

export type DesktopOperation = {
  /** Sets the outcome the header shows, such as `30 of 101 story tests executed`. A later call replaces an earlier one. */
  summarize(summary: string): void;
  /** Records a line of detail that is shown live only in verbose mode. */
  log(text: string): void;
};

/**
 * Runs `work` as a reported operation. When it ends the reporter prints one outcome header, `✔ label (4.2s)` or
 * `✖ label (4.2s): reason`. A failure from `work` is reported and then thrown again. Detail that has no log of its own
 * goes through `log`, so that only verbose runs show it.
 */
export async function runDesktopOperation<T>(
  writer: { readonly emit: EventEmitter } | undefined,
  options: DesktopOperationOptions,
  work: (operation: DesktopOperation) => T | Promise<T>,
): Promise<T> {
  const scopeId = options.scopeId ?? `operation-${randomUUID()}`;
  let summary: string | undefined;
  const operation: DesktopOperation = {
    summarize: (text) => {
      summary = singleLine(text, 400);
    },
    log: (text) => {
      for (const line of text.split('\n')) {
        const trimmed = line.trimEnd();
        if (trimmed) writer?.emit({ kind: 'output', payload: { stream: 'stdout', text: `${trimmed}\n` } }, scopeId, options.context);
      }
    },
  };
  const end = (status: 'passed' | 'failed', outcome: string) =>
    writer?.emit({ kind: 'scope-end', payload: { status, summary: outcome } }, scopeId, options.context);
  writer?.emit({ kind: 'scope-start', payload: { label: options.label, category: options.category ?? 'phase' } }, scopeId, options.context);
  let result: T;
  try {
    result = await work(operation);
  } catch (error) {
    try {
      end('failed', summary ?? singleLine(describeError(error).split('\n', 1)[0], 400));
    } catch {
      // The failure of the work is the error to surface, not a failure to report it.
    }
    throw error;
  }
  end('passed', summary ?? '');
  return result;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
