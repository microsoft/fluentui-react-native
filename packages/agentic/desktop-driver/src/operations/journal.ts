import { journalCapacity } from './limits.js';

export type JournalScalar = boolean | number | string | null;

/** The only operation data a journal keeps: scalar fields an operation chose to declare safe. */
export type JournalSummary = Readonly<Record<string, JournalScalar>>;

export type JournalEntry = {
  at: string;
  durationMs: number;
  effect: 'mutate' | 'read';
  /** A failed operation records its code and machine reason, never its message, which may quote UI text. */
  error?: { code: string; reason?: string };
  operation: string;
  outcome: 'error' | 'ok';
  requestId: string;
  sequence: number;
  summary?: JournalSummary;
};

export type JournalRecord = Omit<JournalEntry, 'sequence' | 'summary'> & { summary?: Readonly<Record<string, unknown>> };

export type JournalPage = {
  /** Entries after the cursor that were dropped to stay within capacity. */
  dropped: number;
  entries: JournalEntry[];
  /** The cursor to pass as `after` for the next page, present only when more entries follow. */
  next?: number;
};

const maxSummaryFields = 16;
const maxSummaryString = 80;
const summaryKey = /^[a-z][A-Za-z0-9]{0,31}$/;
const errorToken = /^[a-z0-9]+(?:[ -][a-z0-9]+)*$/;
const maxErrorToken = 48;
// Control characters are stripped from recorded strings so a journal line cannot forge or hide entries.
// eslint-disable-next-line no-control-regex
const controlCharacters = /[\u0000-\u001f\u007f-\u009f]/g;

/**
 * A bounded, in-memory record of the operations a session ran. `record` is the only way in and the single redaction
 * point: nothing reaches the journal except allowlisted scalar fields, an error code, and a machine reason token, so
 * typed text, UI strings, and free-form error messages are never retained. Persisting a journal later must go through
 * the same entries.
 */
export class OperationJournal {
  private readonly capacity: number;
  private readonly entries: JournalEntry[] = [];
  private nextSequence = 1;

  constructor(capacity: number = journalCapacity.default) {
    this.capacity = Math.max(1, Math.floor(capacity));
  }

  record(record: JournalRecord): JournalEntry {
    const summary = sanitizeSummary(record.summary);
    const error = sanitizeError(record.error);
    const entry: JournalEntry = {
      at: record.at,
      durationMs: Math.max(0, Math.round(record.durationMs)),
      effect: record.effect,
      ...(error ? { error } : {}),
      operation: record.operation,
      outcome: record.outcome,
      requestId: record.requestId,
      sequence: this.nextSequence,
      ...(summary ? { summary } : {}),
    };
    this.nextSequence += 1;
    this.entries.push(entry);
    if (this.entries.length > this.capacity) {
      this.entries.splice(0, this.entries.length - this.capacity);
    }
    return entry;
  }

  /** Reads entries after a cursor in order. A cursor of 0, or none, starts at the oldest retained entry. */
  read({ after = 0, limit }: { after?: number; limit: number }): JournalPage {
    const firstRetained = this.entries[0]?.sequence ?? this.nextSequence;
    const dropped = Math.max(0, firstRetained - 1 - after);
    const pending = this.entries.filter((entry) => entry.sequence > after);
    const entries = pending.slice(0, limit);
    const last = entries[entries.length - 1];
    return {
      dropped,
      entries,
      ...(last && pending.length > entries.length ? { next: last.sequence } : {}),
    };
  }

  get size(): number {
    return this.entries.length;
  }
}

function sanitizeSummary(summary: Readonly<Record<string, unknown>> | undefined): JournalSummary | undefined {
  if (!summary) {
    return undefined;
  }
  const result: Record<string, JournalScalar> = {};
  for (const [key, value] of Object.entries(summary)) {
    if (Object.keys(result).length >= maxSummaryFields) {
      break;
    }
    if (!summaryKey.test(key)) {
      continue;
    }
    if (typeof value === 'string') {
      result[key] = clip(value.replace(controlCharacters, ' '), maxSummaryString);
    } else if (typeof value === 'number') {
      result[key] = Number.isFinite(value) ? value : null;
    } else if (typeof value === 'boolean') {
      result[key] = value;
    } else if (value === null) {
      result[key] = null;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function sanitizeError(error: JournalEntry['error'] | undefined): JournalEntry['error'] | undefined {
  if (!error) {
    return undefined;
  }
  const code = errorToken.test(error.code) && error.code.length <= maxErrorToken ? error.code : 'unknown error';
  const reason =
    error.reason !== undefined && errorToken.test(error.reason) && error.reason.length <= maxErrorToken ? error.reason : undefined;
  return { code, ...(reason ? { reason } : {}) };
}

function clip(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}
