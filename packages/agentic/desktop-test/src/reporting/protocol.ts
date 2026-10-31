import { randomUUID } from 'node:crypto';

export type FailureKind = 'test' | 'infrastructure' | 'cleanup' | 'evidence' | 'reporting';
export type ReportError = { name: string; message: string; stack?: string; cause?: ReportError; errors?: ReportError[] };
export type ReportFailure = { failureId: string; kind: FailureKind; error: ReportError };
export class DesktopReportedError extends Error {
  readonly failure: ReportFailure;

  constructor(failure: unknown) {
    validateFailure(failure);
    super(failure.error.message);
    this.name = failure.error.name;
    this.stack = failure.error.stack;
    this.failure = failure;
  }
}
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'unsupported' | 'cancelled' | 'not-run' | 'incomplete';
export type EventContext = {
  endpoint?: 'macos' | 'windows' | 'win32';
  renderer?: 'fabric' | 'paper';
  service?: string;
  worker?: string;
  spec?: string;
  story?: string;
  test?: string;
  attempt?: number;
};
export type EventData =
  | { kind: 'work-selected'; payload: { workId: string; label: string } }
  | { kind: 'scope-start'; payload: { label: string; category: 'service' | 'worker' | 'phase' } }
  | { kind: 'scope-end'; payload: { status: 'passed' | 'failed' | 'cancelled' | 'skipped' | 'unsupported'; logPath?: string } }
  | { kind: 'service-ready'; payload: { message: string } }
  | { kind: 'service-failed'; payload: { failure: ReportFailure } }
  | { kind: 'diagnostic'; payload: { level: 'info' | 'warning' | 'error'; message: string; failure?: ReportFailure } }
  | { kind: 'output'; payload: { stream: 'stdout' | 'stderr'; text: string } }
  | { kind: 'test-start'; payload: { testId: string; title: string; attempt: number } }
  | {
      kind: 'test-result';
      payload: {
        testId: string;
        title: string;
        attempt: number;
        status: TestStatus;
        durationMs: number;
        reason?: string;
        failure?: ReportFailure;
      };
    }
  | { kind: 'artifact'; payload: { path: string; description: string } }
  | { kind: 'producer-finished'; payload: { status: 'passed' | 'failed' } }
  | { kind: 'run-finished'; payload: { status: TestStatus; resultPath: string } };

export type DesktopEvent = {
  schemaVersion: 1;
  runId: string;
  eventId: string;
  sourceId: string;
  sourceSequence: number;
  scopeId: string;
  parentScopeId?: string;
  timestamp: string;
  context?: EventContext;
} & EventData;

export type CollectedDesktopEvent = DesktopEvent & { arrivalSequence: number };
export type EventEmitter = (event: EventData, scopeId?: string, context?: EventContext, parentScopeId?: string) => void;
export const reportStatuses: readonly TestStatus[] = ['passed', 'failed', 'skipped', 'unsupported', 'cancelled', 'not-run', 'incomplete'];
const payloadFields = {
  'work-selected': ['workId', 'label'],
  'scope-start': ['label', 'category'],
  'scope-end': ['status', 'logPath'],
  'service-ready': ['message'],
  'service-failed': ['failure'],
  diagnostic: ['level', 'message', 'failure'],
  output: ['stream', 'text'],
  'test-start': ['testId', 'title', 'attempt'],
  'test-result': ['testId', 'title', 'attempt', 'status', 'durationMs', 'reason', 'failure'],
  artifact: ['path', 'description'],
  'producer-finished': ['status'],
  'run-finished': ['status', 'resultPath'],
} as const;

export function createEventEmitter(runId: string, sourceId: string, receive: (event: DesktopEvent) => void): EventEmitter {
  let sequence = 0;
  return (event, scopeId = sourceId, context, parentScopeId) =>
    receive({
      ...event,
      schemaVersion: 1,
      runId,
      eventId: randomUUID(),
      sourceId,
      sourceSequence: ++sequence,
      scopeId,
      parentScopeId,
      timestamp: new Date().toISOString(),
      context,
    });
}

export function validateDesktopEvent(value: unknown): asserts value is DesktopEvent {
  const event = record(value, 'report event');
  exactKeys(event, [
    'schemaVersion',
    'runId',
    'eventId',
    'sourceId',
    'sourceSequence',
    'scopeId',
    'parentScopeId',
    'timestamp',
    'context',
    'kind',
    'payload',
  ]);
  if (event.schemaVersion !== 1) throw new TypeError('Unsupported desktop reporting schemaVersion.');
  for (const key of ['runId', 'eventId', 'sourceId', 'scopeId', 'timestamp']) requireText(event[key], key);
  if (event.parentScopeId !== undefined) requireText(event.parentScopeId, 'parentScopeId');
  if (!Number.isFinite(Date.parse(String(event.timestamp)))) throw new TypeError('Invalid reporting timestamp.');
  integer(event.sourceSequence, 'sourceSequence', 1);
  if (typeof event.kind !== 'string' || !Object.hasOwn(payloadFields, event.kind))
    throw new TypeError('Unknown desktop report event kind.');
  const kind = event.kind as keyof typeof payloadFields;
  const payload = record(event.payload, 'event payload');
  exactKeys(payload, payloadFields[kind]);
  if (event.context !== undefined) {
    const context = record(event.context, 'event context');
    exactKeys(context, ['endpoint', 'renderer', 'service', 'worker', 'spec', 'story', 'test', 'attempt']);
    for (const [key, value] of Object.entries(context)) {
      if (value === undefined) continue;
      if (key === 'attempt') integer(value, key, 0);
      else requireText(value, key);
    }
    if (context.endpoint !== undefined) member(context.endpoint, ['macos', 'windows', 'win32']);
    if (context.renderer !== undefined) member(context.renderer, ['fabric', 'paper']);
  }
  switch (kind) {
    case 'work-selected':
      requireText(payload.workId, 'workId');
      requireText(payload.label, 'label');
      break;
    case 'scope-start':
      requireText(payload.label, 'label');
      member(payload.category, ['service', 'worker', 'phase']);
      break;
    case 'scope-end':
      if (payload.logPath !== undefined) requireText(payload.logPath, 'logPath');
      member(payload.status, ['passed', 'failed', 'cancelled', 'skipped', 'unsupported']);
      break;
    case 'producer-finished':
      member(payload.status, ['passed', 'failed']);
      break;
    case 'service-ready':
      requireText(payload.message, 'message');
      break;
    case 'service-failed':
      validateFailure(payload.failure);
      break;
    case 'diagnostic':
      member(payload.level, ['info', 'warning', 'error']);
      requireText(payload.message, 'message');
      if (payload.failure !== undefined) validateFailure(payload.failure);
      break;
    case 'output':
      member(payload.stream, ['stdout', 'stderr']);
      if (typeof payload.text !== 'string') throw new TypeError('output.text must be a string.');
      break;
    case 'test-start':
    case 'test-result':
      requireText(payload.testId, 'testId');
      requireText(payload.title, 'title');
      integer(payload.attempt, 'attempt', 0);
      if (kind === 'test-result') {
        member(payload.status, reportStatuses);
        if (typeof payload.durationMs !== 'number' || !Number.isFinite(payload.durationMs) || payload.durationMs < 0)
          throw new TypeError('Invalid test duration.');
        if (payload.reason !== undefined) requireText(payload.reason, 'reason');
        if (['skipped', 'unsupported', 'cancelled', 'not-run', 'incomplete'].includes(String(payload.status)) && !payload.reason) {
          throw new TypeError('Non-executed test results require a reason.');
        }
        if (payload.status === 'failed' && !payload.failure) throw new TypeError('Failed test results require their original failure.');
        if (payload.failure !== undefined) validateFailure(payload.failure);
      }
      break;
    case 'artifact':
      requireText(payload.path, 'artifact path');
      requireText(payload.description, 'artifact description');
      break;
    case 'run-finished':
      member(payload.status, reportStatuses);
      requireText(payload.resultPath, 'resultPath');
      break;
  }
}

export function serializeReportError(error: unknown, seen = new Set<unknown>()): ReportError {
  if (seen.has(error)) return { name: 'Error', message: '[circular error]' };
  seen.add(error);
  if (!error || typeof error !== 'object') return { name: 'Error', message: String(error) };
  return {
    name: 'name' in error && typeof error.name === 'string' && error.name ? error.name : 'Error',
    message: 'message' in error && typeof error.message === 'string' ? error.message : String(error),
    ...('stack' in error && typeof error.stack === 'string' ? { stack: error.stack } : {}),
    ...('cause' in error && error.cause !== undefined ? { cause: serializeReportError(error.cause, seen) } : {}),
    ...('errors' in error && Array.isArray(error.errors)
      ? { errors: error.errors.map((child: unknown) => serializeReportError(child, seen)) }
      : {}),
  };
}

// Each optional token begins with a character its neighbors cannot match, so matching stays linear on long input
// such as `password` followed by many spaces (R-SCAN-001).
const SECRET_ASSIGNMENT = /((?:leaseNonce|bridgeNonce|authorization|password|access[_-]?token)\s*(?:["']\s*)?[:=]\s*["']?)[^\s"',;]+/gi;

/** Replace each known secret, longest first, and the value of each `key: value` or `key=value` secret assignment. */
export function redactDesktopSecrets(text: string, secrets: Iterable<string>): string {
  let result = text;
  for (const secret of [...secrets].sort((a, b) => b.length - a.length)) result = result.replaceAll(secret, '[REDACTED]');
  return result.replace(SECRET_ASSIGNMENT, '$1[REDACTED]');
}

export function sanitizeDesktopReport<T>(value: T, redact: (text: string) => string): T {
  return JSON.parse(
    JSON.stringify(value, (key, item: unknown) => {
      if (/nonce|password|secret|authorization|access[_-]?token|cookie/i.test(key)) return '[REDACTED]';
      return typeof item === 'string' ? redact(item) : item;
    }),
  ) as T;
}

function validateFailure(value: unknown): asserts value is ReportFailure {
  const failure = record(value, 'failure');
  exactKeys(failure, ['failureId', 'kind', 'error']);
  requireText(failure.failureId, 'failureId');
  member(failure.kind, ['test', 'infrastructure', 'cleanup', 'evidence', 'reporting']);
  const checkError = (value: unknown, depth: number): void => {
    if (depth > 20) throw new TypeError('Report error cause depth exceeds 20.');
    const error = record(value, 'error');
    exactKeys(error, ['name', 'message', 'stack', 'cause', 'errors']);
    requireText(error.name, 'error.name');
    if (typeof error.message !== 'string') throw new TypeError('error.message must be text.');
    if (error.stack !== undefined && typeof error.stack !== 'string') throw new TypeError('error.stack must be text.');
    if (error.cause !== undefined) checkError(error.cause, depth + 1);
    if (error.errors !== undefined) {
      if (!Array.isArray(error.errors)) throw new TypeError('error.errors must be an array.');
      for (const child of error.errors) checkError(child, depth + 1);
    }
  };
  checkError(failure.error, 0);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value as Record<string, unknown>;
}
function requireText(value: unknown, name: string): void {
  if (typeof value !== 'string' || !value.length) throw new TypeError(`${name} must be nonempty text.`);
}
function integer(value: unknown, name: string, minimum: number): void {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) throw new TypeError(`Invalid ${name}.`);
}
function member(value: unknown, values: readonly string[]): void {
  if (typeof value !== 'string' || !values.includes(value)) throw new TypeError(`Expected one of: ${values.join(', ')}.`);
}
function exactKeys(value: Record<string, unknown>, allowed: readonly string[]): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`Unknown reporting field "${key}".`);
}
