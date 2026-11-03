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
};

const maximumRecordBytes = 4 * 1024;
const maximumTextBytes = 300;

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
    case 'output':
      return false;
  }
}

export function projectDesktopEvent(event: CollectedDesktopEvent): DesktopEventRecord {
  const payload: Record<string, unknown> = {};
  switch (event.kind) {
    case 'work-selected':
      payload.workId = clip(event.payload.workId);
      payload.label = clip(event.payload.label);
      break;
    case 'scope-start':
      payload.label = clip(event.payload.label);
      payload.category = event.payload.category;
      break;
    case 'scope-end':
      payload.status = event.payload.status;
      if (event.payload.logPath) payload.logPath = clip(event.payload.logPath);
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
      payload.testId = clip(event.payload.testId);
      payload.title = clip(event.payload.title);
      payload.attempt = event.payload.attempt;
      break;
    case 'test-result':
      payload.testId = clip(event.payload.testId);
      payload.title = clip(event.payload.title);
      payload.attempt = event.payload.attempt;
      payload.status = event.payload.status;
      payload.durationMs = event.payload.durationMs;
      if (event.payload.reason) payload.reason = clip(event.payload.reason);
      if (event.payload.failure) payload.failure = projectFailure(event.payload.failure);
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
    runId: clip(event.runId),
    eventId: clip(event.eventId),
    sourceId: clip(event.sourceId),
    sourceSequence: event.sourceSequence,
    arrivalSequence: event.arrivalSequence,
    kind: event.kind,
    scopeId: clip(event.scopeId),
    ...(event.parentScopeId ? { parentScopeId: clip(event.parentScopeId) } : {}),
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
  while (Buffer.byteLength(JSON.stringify(record)) > maximumRecordBytes) {
    const key = Object.keys(payload).find((field) => typeof payload[field] === 'string' && (payload[field] as string).length > 32);
    if (!key) throw new Error('Desktop event projection cannot fit within the 4 KiB record limit.');
    payload[key] = clip(payload[key] as string, 32);
  }
  return record;
}

function projectFailure(failure: { failureId: string; kind: string; error: { name: string; message: string } }) {
  return {
    failureId: clip(failure.failureId),
    kind: failure.kind,
    error: { name: clip(failure.error.name), message: clip(failure.error.message) },
  };
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
