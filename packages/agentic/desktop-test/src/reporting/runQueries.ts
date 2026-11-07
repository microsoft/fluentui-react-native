import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { isNativeError } from 'node:util/types';

import { desktopArtifactPath } from './collector.js';
import { DesktopReportedError, reportStatuses, redactDesktopSecrets, selectionExclusionReasons, testGaps } from './protocol.js';
import type { SelectionExclusions, TestGap, TestStatus } from './protocol.js';
import { desktopInputLaneSources, summarizeDesktopRun } from './results.js';
import type { DesktopInputLaneReport, DesktopRunResult, DesktopSelectionReport } from './results.js';

export type DesktopRunQuery =
  | { operation: 'status'; runId: string }
  | { operation: 'tests' | 'work' | 'failures' | 'artifacts'; runId: string; limit?: number; cursor?: string }
  | { operation: 'artifact'; runId: string; artifactId: string };

export type DesktopRunStatus = {
  schemaVersion: 1;
  runId: string;
  terminal: boolean;
  status: TestStatus;
  counts: DesktopRunResult['counts'];
  lane?: DesktopInputLaneReport;
  excluded?: SelectionExclusions;
};
export type DesktopRunQueryItem = {
  id: string;
  title: string;
  status?: TestStatus;
  /** Set on an `unsupported` test whose gap was declared in advance. */
  gap?: TestGap;
  message?: string;
};
export type DesktopRunPage = {
  schemaVersion: 1;
  runId: string;
  terminal: boolean;
  status: TestStatus;
  items: DesktopRunQueryItem[];
  total: number;
  omissions: { items: number; textBytes: number };
  nextCursor?: string;
};
export type DesktopArtifactQueryResult = {
  schemaVersion: 1;
  runId: string;
  artifactId: string;
  text: string;
  omissions: { bytes: number };
};
export type DesktopRunQueryResponse = DesktopRunStatus | DesktopRunPage | DesktopArtifactQueryResult;

export type DesktopRunRegistration = {
  runId: string;
  root: string;
  expiresAt: number;
  /** Only these trusted, relative text artifacts can be read; run.json is queried structurally instead. */
  textArtifacts?: readonly string[];
};
export type DesktopRunReadGrant = {
  runIds: readonly string[];
  expiresAt: number;
  artifacts?: boolean;
};
type RegisteredRun = DesktopRunRegistration & {
  device: number;
  inode: number;
  artifacts: Map<string, string>;
};
type Grant = DesktopRunReadGrant & {
  cursors: Map<string, { runId: string; operation: string; digest: string; offset: number }>;
};

const maxResultBytes = 64 * 1024 * 1024;
const maxArtifactBytes = 1024 * 1024;
const maxResponseBytes = 16 * 1024;
const maxTextBytes = 1024;
const maxCursors = 256;
const unavailable = () => new Error('Desktop run query is unavailable or unauthorized.');

/**
 * Trusted host composition owns registrations and credentials. Readers cannot start work, discover roots,
 * register artifacts, or gain permissions by reconnecting. This is not a management listener.
 */
export class DesktopRunQueryService {
  private readonly runs = new Map<string, RegisteredRun>();
  private readonly grants = new Map<string, Grant>();
  private readonly secrets = new Set<string>();

  constructor(secrets: readonly string[] = []) {
    for (const secret of secrets) this.addSecret(secret);
  }

  addSecret(secret: string): void {
    if (secret) this.secrets.add(secret);
  }

  registerRun(registration: DesktopRunRegistration): void {
    opaqueId(registration.runId);
    deadline(registration.expiresAt);
    if (this.runs.has(registration.runId)) throw new Error('Desktop run is already registered.');
    const root = fs.realpathSync(registration.root);
    const stat = fs.statSync(root);
    if (!stat.isDirectory()) throw new Error('Desktop run root must be a directory.');
    const artifacts = new Map<string, string>();
    for (const relative of registration.textArtifacts ?? []) {
      const resolved = desktopArtifactPath(root, relative);
      if (relative.includes('\\') || path.relative(root, resolved).split(path.sep).join('/') !== relative || relative === 'run.json')
        throw new Error('Text artifact paths must be canonical relative paths other than run.json.');
      artifacts.set(randomUUID(), relative);
    }
    this.runs.set(registration.runId, { ...registration, root, device: stat.dev, inode: stat.ino, artifacts });
  }

  forgetRun(runId: string): void {
    this.runs.delete(runId);
    for (const grant of this.grants.values()) {
      grant.runIds = grant.runIds.filter((id) => id !== runId);
      for (const [cursor, scope] of grant.cursors) if (scope.runId === runId) grant.cursors.delete(cursor);
    }
  }

  issueGrant(input: DesktopRunReadGrant): string {
    deadline(input.expiresAt);
    if (!input.runIds.length || input.runIds.some((id) => !this.runs.has(id))) throw unavailable();
    const token = randomUUID();
    this.addSecret(token);
    this.grants.set(token, { ...input, runIds: [...input.runIds], cursors: new Map() });
    return token;
  }

  revokeGrant(token: string): void {
    this.grants.delete(token);
  }

  connect(token: string): DesktopRunQueryClient {
    if (!this.grants.has(token) || this.grants.get(token)!.expiresAt <= Date.now()) throw unavailable();
    return new DesktopRunQueryClient((query) => this.query(token, query));
  }

  query(token: string, input: unknown): DesktopRunQueryResponse {
    try {
      return this.read(token, input);
    } catch (error) {
      throw new Error(this.redact(isNativeError(error) ? error.message : 'Desktop run query failed.'));
    }
  }

  private read(token: string, input: unknown): DesktopRunQueryResponse {
    validateDesktopRunQuery(input);
    const grant = this.grants.get(token);
    const run = this.runs.get(input.runId);
    if (!grant || !run || !grant.runIds.includes(input.runId) || grant.expiresAt <= Date.now() || run.expiresAt <= Date.now())
      throw unavailable();
    const rootStat = fs.lstatSync(run.root);
    if (!rootStat.isDirectory() || rootStat.dev !== run.device || rootStat.ino !== run.inode) throw unavailable();
    if ((input.operation === 'artifact' || input.operation === 'artifacts') && !grant.artifacts) throw unavailable();
    const retained = readRetainedText(run.root, 'run.json', maxResultBytes);
    const digest = createHash('sha256').update(retained).digest('hex');
    const result = parseResult(retained, run.runId);
    if (input.operation === 'artifact') {
      const relative = run.artifacts.get(input.artifactId);
      if (!relative || !result.artifacts.some((artifact) => artifact.path === relative)) throw unavailable();
      const text = this.redact(readRetainedText(run.root, relative, maxArtifactBytes));
      const clipped = clip(text, 4 * 1024);
      return {
        schemaVersion: 1,
        runId: run.runId,
        artifactId: input.artifactId,
        text: clipped.text,
        omissions: { bytes: clipped.omitted },
      };
    }
    const terminal = result.terminal === true;
    // Recompute coverage from complete persisted data, never from a truncated page or producer exit code.
    const canonical = summarizeDesktopRun({
      ...result,
      optional: result.status === 'skipped',
      incomplete: !terminal || ['incomplete', 'cancelled', 'not-run', 'unsupported'].includes(result.status),
    });
    if (result.status === 'failed') canonical.status = 'failed';
    if (input.operation === 'status')
      return {
        schemaVersion: 1,
        runId: run.runId,
        terminal,
        status: canonical.status,
        counts: canonical.counts,
        ...(canonical.lane ? { lane: canonical.lane } : {}),
        ...(canonical.selection ? { excluded: canonical.selection.excluded } : {}),
      };
    let offset = 0;
    if (input.cursor) {
      const cursor = grant.cursors.get(input.cursor);
      if (!cursor || cursor.runId !== run.runId || cursor.operation !== input.operation || cursor.digest !== digest)
        throw new Error('Desktop run cursor is stale or unauthorized; request a new first page.');
      offset = cursor.offset;
    }
    const items = this.items(input.operation, canonical, run);
    const page: DesktopRunPage = {
      schemaVersion: 1,
      runId: run.runId,
      terminal,
      status: canonical.status,
      items: [],
      total: items.length,
      omissions: { items: items.length - offset, textBytes: 0 },
    };
    for (const item of items.slice(offset, offset + (input.limit ?? 10))) {
      const clipped = this.clipItem(item);
      page.items.push(clipped.item);
      if (Buffer.byteLength(JSON.stringify(page)) > maxResponseBytes - 128) {
        page.items.pop();
        break;
      }
      page.omissions.textBytes += clipped.omitted;
    }
    page.omissions.items = items.length - page.items.length;
    const nextOffset = offset + page.items.length;
    if (nextOffset < items.length) {
      if (grant.cursors.size >= maxCursors) grant.cursors.delete(grant.cursors.keys().next().value!);
      page.nextCursor = randomUUID();
      grant.cursors.set(page.nextCursor, { runId: run.runId, operation: input.operation, digest, offset: nextOffset });
    }
    return page;
  }

  private redact(text: string): string {
    return redactDesktopSecrets(text, this.secrets);
  }

  private clipItem(item: DesktopRunQueryItem): { item: DesktopRunQueryItem; omitted: number } {
    const title = clip(this.redact(item.title), maxTextBytes);
    const message = item.message === undefined ? undefined : clip(this.redact(item.message), maxTextBytes);
    return {
      item: {
        id: item.id,
        title: title.text,
        ...(item.status ? { status: item.status } : {}),
        ...(item.gap ? { gap: item.gap } : {}),
        ...(message ? { message: message.text } : {}),
      },
      omitted: title.omitted + (message?.omitted ?? 0),
    };
  }

  private items(operation: string, result: DesktopRunResult, run: RegisteredRun): DesktopRunQueryItem[] {
    const id = (category: string, value: string) => createHash('sha256').update(`${run.runId}:${category}:${value}`).digest('hex');
    switch (operation) {
      case 'tests':
        return result.tests.map((test) => ({
          id: id('test', test.testId),
          title: test.title,
          status: test.status,
          ...(test.attempts.at(-1)?.gap ? { gap: test.attempts.at(-1)!.gap } : {}),
          message: test.attempts.at(-1)?.failure?.error.message ?? test.attempts.at(-1)?.reason,
        }));
      case 'work':
        return result.work.map((work) => ({ id: id('work', work.workId), title: work.label, status: work.status }));
      case 'failures':
        return result.failures.map((failure) => ({
          id: id('failure', failure.failureId),
          title: failure.kind,
          status: 'failed',
          message: failure.error.message,
        }));
      case 'artifacts':
        return [...run.artifacts].flatMap(([artifactId, relative]) => {
          const artifact = result.artifacts.find((artifact) => artifact.path === relative);
          return artifact ? [{ id: artifactId, title: artifact.description }] : [];
        });
      default:
        throw new TypeError('Invalid desktop run page operation.');
    }
  }
}

export class DesktopRunQueryClient {
  private readonly request: (query: DesktopRunQuery) => DesktopRunQueryResponse | Promise<DesktopRunQueryResponse>;

  constructor(request: (query: DesktopRunQuery) => DesktopRunQueryResponse | Promise<DesktopRunQueryResponse>) {
    this.request = request;
  }

  async query(query: DesktopRunQuery): Promise<DesktopRunQueryResponse> {
    validateDesktopRunQuery(query);
    return this.request(query);
  }
}

export function validateDesktopRunQuery(value: unknown): asserts value is DesktopRunQuery {
  const request = record(value);
  opaqueId(request.runId);
  const fields =
    request.operation === 'status'
      ? ['operation', 'runId']
      : request.operation === 'artifact'
        ? ['operation', 'runId', 'artifactId']
        : ['operation', 'runId', 'limit', 'cursor'];
  if (!['status', 'tests', 'work', 'failures', 'artifacts', 'artifact'].includes(String(request.operation)))
    throw new TypeError('Invalid desktop run query operation.');
  if (Object.keys(request).some((key) => !fields.includes(key))) throw new TypeError('Unknown desktop run query field.');
  if (request.operation === 'artifact') opaqueId(request.artifactId);
  if (request.cursor !== undefined) opaqueId(request.cursor);
  if (
    request.limit !== undefined &&
    (typeof request.limit !== 'number' || !Number.isSafeInteger(request.limit) || request.limit < 1 || request.limit > 25)
  )
    throw new TypeError('Desktop run page limit must be an integer between 1 and 25.');
}

function readRetainedText(root: string, relative: string, maximum: number): string {
  const file = desktopArtifactPath(root, relative);
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1 || stat.size > maximum)
      throw new Error('Retained desktop report exceeds its read limit or is not a private regular file.');
    const buffer = Buffer.alloc(Math.min(stat.size + 1, maximum + 1));
    const length = fs.readSync(fd, buffer, 0, buffer.length, 0);
    if (length !== stat.size || length > maximum) throw new Error('Retained desktop report changed during reading; retry the query.');
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, length));
  } finally {
    fs.closeSync(fd);
  }
}

function parseResult(text: string, runId: string): DesktopRunResult & { terminal?: boolean } {
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new TypeError('Persisted desktop run is not valid JSON.');
  }
  const value = record(input);
  if (
    value.schemaVersion !== 1 ||
    value.runId !== runId ||
    (value.kind !== 'tests' && value.kind !== 'lifecycle') ||
    (value.terminal !== undefined && typeof value.terminal !== 'boolean')
  )
    throw new TypeError('Invalid persisted desktop run identity or status.');
  statusField(value.status);
  for (const field of ['tests', 'work', 'failures', 'artifacts']) {
    if (!Array.isArray(value[field])) throw new TypeError('Invalid persisted desktop run collection.');
  }
  const tests = (value.tests as unknown[]).map((entry) => {
    const test = record(entry);
    textField(test.testId);
    textField(test.title);
    statusField(test.status);
    if (typeof test.flaky !== 'boolean' || !Array.isArray(test.attempts) || !test.attempts.length)
      throw new TypeError('Invalid persisted desktop test attempts.');
    const attempts = test.attempts.map((entry: unknown) => {
      const attempt = record(entry);
      statusField(attempt.status);
      if (typeof attempt.attempt !== 'number' || !Number.isSafeInteger(attempt.attempt) || attempt.attempt < 0)
        throw new TypeError('Invalid persisted desktop attempt ordinal.');
      if (typeof attempt.durationMs !== 'number' || !Number.isFinite(attempt.durationMs) || attempt.durationMs < 0)
        throw new TypeError('Invalid persisted desktop attempt duration.');
      const reason = attempt.reason;
      if (reason !== undefined) textField(reason);
      const gap = attempt.gap;
      if (gap !== undefined && (!testGaps.includes(gap as TestGap) || attempt.status !== 'unsupported'))
        throw new TypeError('Invalid persisted desktop test gap.');
      return {
        attempt: attempt.attempt,
        durationMs: attempt.durationMs,
        status: attempt.status,
        ...(typeof reason === 'string' ? { reason } : {}),
        ...(gap !== undefined ? { gap: gap as TestGap } : {}),
        ...(attempt.failure !== undefined ? { failure: new DesktopReportedError(attempt.failure).failure } : {}),
      };
    });
    if (attempts.at(-1)!.status !== test.status) throw new TypeError('Persisted desktop test status disagrees with its latest attempt.');
    return { testId: test.testId, title: test.title, status: test.status, flaky: test.flaky, attempts };
  });
  const work = (value.work as unknown[]).map((entry) => {
    const item = record(entry);
    textField(item.workId);
    textField(item.label);
    statusField(item.status);
    return { workId: item.workId, label: item.label, status: item.status };
  });
  const failures = (value.failures as unknown[]).map((entry) => new DesktopReportedError(entry).failure);
  const artifacts = (value.artifacts as unknown[]).map((entry) => {
    const artifact = record(entry);
    textField(artifact.path);
    textField(artifact.description);
    return { path: artifact.path, description: artifact.description };
  });
  textField(value.startedAt);
  textField(value.finishedAt);
  if (typeof value.durationMs !== 'number' || !Number.isFinite(value.durationMs) || value.durationMs < 0)
    throw new TypeError('Invalid persisted desktop run duration.');
  const lane = laneField(value.lane);
  const selection = selectionField(value.selection);
  const result = summarizeDesktopRun({
    schemaVersion: 1,
    runId,
    kind: value.kind,
    startedAt: value.startedAt,
    finishedAt: value.finishedAt,
    durationMs: value.durationMs,
    ...(lane ? { lane } : {}),
    ...(selection ? { selection } : {}),
    tests,
    work,
    failures,
    artifacts,
  });
  return { ...result, status: value.status, ...(typeof value.terminal === 'boolean' ? { terminal: value.terminal } : {}) };
}

function laneField(value: unknown): DesktopInputLaneReport | undefined {
  if (value === undefined) return undefined;
  const lane = record(value);
  const source = desktopInputLaneSources.find((candidate) => candidate === lane.source);
  if (lane.policyEnforced !== false || source === undefined) throw new TypeError('Invalid persisted desktop input lane.');
  if (lane.input === 'physical' && lane.masking === undefined) return { input: 'physical', source, policyEnforced: false };
  if (lane.input === 'accessible' && (lane.masking === 'host-masked' || lane.masking === 'verified-masked'))
    return { input: 'accessible', source, masking: lane.masking, policyEnforced: false };
  throw new TypeError('Invalid persisted desktop input lane.');
}

function selectionField(value: unknown): DesktopSelectionReport | undefined {
  if (value === undefined) return undefined;
  const excluded = record(record(value).excluded);
  const counts = {} as SelectionExclusions;
  for (const reason of selectionExclusionReasons) {
    const count = excluded[reason];
    if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0)
      throw new TypeError('Invalid persisted desktop exclusion count.');
    counts[reason] = count;
  }
  return { excluded: counts };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected a desktop run query object.');
  return value as Record<string, unknown>;
}
function opaqueId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value))
    throw new TypeError('Expected an opaque desktop run identifier.');
}
function deadline(value: number): void {
  if (!Number.isSafeInteger(value) || value <= Date.now())
    throw new TypeError('Desktop run retention/grant deadline must be in the future.');
}
function textField(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('Invalid persisted desktop report text.');
}
function statusField(value: unknown): asserts value is TestStatus {
  if (!reportStatuses.includes(value as TestStatus)) throw new TypeError('Invalid persisted desktop report status.');
}
function clip(text: string, maximum: number): { text: string; omitted: number } {
  const bytes = Buffer.byteLength(text);
  if (bytes <= maximum) return { text, omitted: 0 };
  let retained = '';
  let size = 0;
  for (const character of text) {
    const length = Buffer.byteLength(character);
    if (size + length > maximum) break;
    retained += character;
    size += length;
  }
  return { text: retained, omitted: bytes - size };
}
