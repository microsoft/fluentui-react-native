import type { CollectedDesktopEvent, DesktopEvent } from './protocol.js';
import type { DesktopEventLevel } from '@fluentui-react-native/desktop-driver/cli/reporter';

export type { DesktopEventLevel } from '@fluentui-react-native/desktop-driver/cli/reporter';
export type DesktopEventRecord = {
  schemaVersion: 1;
  type: 'event';
  runId: string;
  eventId: string;
  sourceId: string;
  sourceSequence: number;
  arrivalSequence: number;
  kind: DesktopEvent['kind'];
  scopeId: string;
  parentScopeId?: string;
  context?: DesktopEvent['context'];
  payload: Record<string, unknown>;
  /** Set when the record is the reduced form of an event that could not fit its size limit; the journal holds the whole event. */
  truncated?: true;
};

const maximumRecordBytes = 4 * 1024;
const maximumTextBytes = 300;
// Identifiers are how a consumer finds the event, test, or failure again, so only an absurd one is ever shortened.
const maximumIdBytes = 1024;
const fallbackIdBytes = 128;
const payloadIdFields = ['testId', 'workId'];

export function includeDesktopEvent(event: DesktopEvent, level: DesktopEventLevel, scopeCategory?: string): boolean {
  if (level === 'all') return true;
  if (level === 'progress') return event.kind !== 'output';
  switch (event.kind) {
    case 'scope-start':
      return event.payload.category !== 'worker';
    case 'scope-end':
      return scopeCategory !== 'worker';
    case 'service-ready':
    case 'service-failed':
    case 'producer-finished':
    case 'run-finished':
      return true;
    case 'artifact':
      return false;
    case 'diagnostic':
      return event.payload.level !== 'info';
    case 'test-result':
      return event.payload.status !== 'passed';
    case 'work-selected':
    case 'test-start':
    case 'selection':
    case 'output':
      return false;
  }
}

export function projectDesktopEvent(event: CollectedDesktopEvent): DesktopEventRecord {
  const payload: Record<string, unknown> = {};
  switch (event.kind) {
    case 'work-selected':
      payload.workId = id(event.payload.workId);
      payload.label = clip(event.payload.label);
      break;
    case 'scope-start':
      payload.label = clip(event.payload.label);
      payload.category = event.payload.category;
      break;
    case 'scope-end':
      payload.status = event.payload.status;
      if (event.payload.logPath) payload.logPath = clip(event.payload.logPath);
      if (event.payload.summary) payload.summary = clip(event.payload.summary);
      break;
    case 'service-ready':
      payload.message = clip(event.payload.message);
      break;
    case 'service-failed':
      payload.failure = projectFailure(event.payload.failure);
      break;
    case 'diagnostic':
      payload.level = event.payload.level;
      payload.message = clip(event.payload.message);
      if (event.payload.failure) payload.failure = projectFailure(event.payload.failure);
      break;
    case 'output':
      payload.stream = event.payload.stream;
      payload.text = clip(event.payload.text);
      break;
    case 'test-start':
      payload.testId = id(event.payload.testId);
      payload.title = clip(event.payload.title);
      payload.attempt = event.payload.attempt;
      break;
    case 'test-result':
      payload.testId = id(event.payload.testId);
      payload.title = clip(event.payload.title);
      payload.attempt = event.payload.attempt;
      payload.status = event.payload.status;
      payload.durationMs = event.payload.durationMs;
      if (event.payload.reason) payload.reason = clip(event.payload.reason);
      if (event.payload.gap) payload.gap = event.payload.gap;
      if (event.payload.failure) payload.failure = projectFailure(event.payload.failure);
      break;
    case 'selection':
      payload.excluded = { ...event.payload.excluded };
      break;
    case 'artifact':
      payload.path = clip(event.payload.path);
      payload.description = clip(event.payload.description);
      break;
    case 'producer-finished':
      payload.status = event.payload.status;
      break;
    case 'run-finished':
      payload.status = event.payload.status;
      payload.resultPath = clip(event.payload.resultPath);
      break;
  }
  const record: DesktopEventRecord = {
    schemaVersion: 1,
    type: 'event',
    runId: id(event.runId),
    eventId: id(event.eventId),
    sourceId: id(event.sourceId),
    sourceSequence: event.sourceSequence,
    arrivalSequence: event.arrivalSequence,
    kind: event.kind,
    scopeId: id(event.scopeId),
    ...(event.parentScopeId ? { parentScopeId: id(event.parentScopeId) } : {}),
    ...(event.context
      ? {
          context: {
            ...(event.context.endpoint ? { endpoint: event.context.endpoint } : {}),
            ...(event.context.renderer ? { renderer: event.context.renderer } : {}),
            ...(event.context.service ? { service: clip(event.context.service) } : {}),
            ...(event.context.worker ? { worker: clip(event.context.worker) } : {}),
            ...(event.context.spec ? { spec: clip(event.context.spec) } : {}),
            ...(event.context.story ? { story: clip(event.context.story) } : {}),
            ...(event.context.test ? { test: clip(event.context.test) } : {}),
            ...(event.context.attempt !== undefined ? { attempt: event.context.attempt } : {}),
          },
        }
      : {}),
    payload,
  };
  return fitRecord(record);
}

function byteLength(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value));
}

type TextSlot = { holder: Record<string, unknown>; key: string };

// Every free-text field a record carries. Identifiers are excluded: they are never shrunk to make room.
function textSlots(record: DesktopEventRecord): TextSlot[] {
  const slots: TextSlot[] = [];
  const collect = (holder: Record<string, unknown> | undefined, skip: readonly string[] = []) => {
    if (!holder) return;
    for (const key of Object.keys(holder)) if (typeof holder[key] === 'string' && !skip.includes(key)) slots.push({ holder, key });
  };
  collect(record.payload, [...payloadIdFields, 'failureId']);
  collect(record.context as Record<string, unknown> | undefined);
  const failure = record.payload.failure as { error?: Record<string, unknown> } | undefined;
  collect(failure?.error);
  return slots;
}

// Shrinks free text, longest first, until the record fits; if the identifiers and enums alone cannot fit, returns a
// minimal record rather than throwing, so one oversized event can never drop the run's terminal summary.
function fitRecord(record: DesktopEventRecord): DesktopEventRecord {
  const slots = textSlots(record).sort(
    (a, b) => Buffer.byteLength(b.holder[b.key] as string) - Buffer.byteLength(a.holder[a.key] as string),
  );
  for (const { holder, key } of slots) {
    if (byteLength(record) <= maximumRecordBytes) return record;
    if (Buffer.byteLength(holder[key] as string) > 32) holder[key] = clip(holder[key] as string, 32);
  }
  if (byteLength(record) <= maximumRecordBytes) return record;
  const payload: Record<string, unknown> = {};
  for (const key of [...payloadIdFields, 'attempt', 'status', 'durationMs', 'level', 'category', 'stream', 'gap', 'excluded'])
    if (record.payload[key] !== undefined) payload[key] = record.payload[key];
  const failure = record.payload.failure as { failureId: string; kind: string } | undefined;
  if (failure) payload.failure = { failureId: failure.failureId, kind: failure.kind };
  const reduced: DesktopEventRecord = {
    schemaVersion: 1,
    type: 'event',
    runId: record.runId,
    eventId: record.eventId,
    sourceId: record.sourceId,
    sourceSequence: record.sourceSequence,
    arrivalSequence: record.arrivalSequence,
    kind: record.kind,
    scopeId: record.scopeId,
    ...(record.parentScopeId ? { parentScopeId: record.parentScopeId } : {}),
    payload,
    truncated: true,
  };
  if (byteLength(reduced) <= maximumRecordBytes) return reduced;
  const shorten = (value: string) => clip(value, fallbackIdBytes);
  reduced.runId = shorten(reduced.runId);
  reduced.eventId = shorten(reduced.eventId);
  reduced.sourceId = shorten(reduced.sourceId);
  reduced.scopeId = shorten(reduced.scopeId);
  if (reduced.parentScopeId) reduced.parentScopeId = shorten(reduced.parentScopeId);
  for (const key of payloadIdFields) if (typeof payload[key] === 'string') payload[key] = shorten(payload[key]);
  if (failure) payload.failure = { failureId: shorten(failure.failureId), kind: failure.kind };
  return reduced;
}

function projectFailure(failure: { failureId: string; kind: string; error: { name: string; message: string } }) {
  return {
    failureId: id(failure.failureId),
    kind: failure.kind,
    error: { name: clip(failure.error.name), message: clip(failure.error.message) },
  };
}

function id(value: string): string {
  return clip(value, maximumIdBytes);
}

function clip(value: string, maximumBytes = maximumTextBytes): string {
  if (Buffer.byteLength(value) <= maximumBytes) return value;
  const marker = '[truncated]';
  let result = '';
  for (const character of value) {
    if (Buffer.byteLength(result + character + marker) > maximumBytes) break;
    result += character;
  }
  return `${result}${marker}`;
}
