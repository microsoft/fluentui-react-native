import { z } from 'zod';

import type { NativeObservedNode, NativeObserveFact } from '../host/types.js';
import { operationError } from './envelope.js';
import { observationBudgets } from './limits.js';
import { assertContentAllowed, requestsContent, requireBoundedObservation } from './policy.js';
import { defaultObservedFacts, nativeFacts, observeFacts, project, shownFacts } from './projection.js';
import type { ProjectedElement, Projection, ProjectionRefs } from './projection.js';
import type { ObservationSnapshot } from './observations.js';
import { registerOperation } from './runtime.js';
import type { OperationRuntime } from './runtime.js';
import { flushLedger, sampleTree } from './sampling.js';
import { operationSchemaReference } from './schemaReferences.js';
import { budgetField, factSchema, referenceSchema, sampleIdSchema, sampleSchema, truncationSchema, warningSchema } from './shapes.js';

const viewSchema = z.enum(['interactive', 'content', 'all']);
const unavailableContinuationSchema = z.literal('cache-limit');

export const observeInput = z.strictObject({
  budget: z
    .strictObject({
      deadlineMs: budgetField(observationBudgets.deadlineMs).describe('Milliseconds the application may take.'),
      maxBytes: budgetField(observationBudgets.maxBytes).describe('Most bytes of outline or nodes returned.'),
      maxDepth: budgetField(observationBudgets.maxDepth).describe('Deepest level read below the root.'),
      maxNodes: budgetField(observationBudgets.maxNodes).describe('Most elements returned.'),
      maxStringLength: budgetField(observationBudgets.maxStringLength).describe(
        'Longest name, value, or text kept; longer is cut and marked.',
      ),
      maxVisited: budgetField(observationBudgets.maxVisited).describe('Most elements read from the application.'),
    })
    .prefault({})
    .describe('Size limits. The result says when one cut it short.'),
  facts: z
    .array(factSchema)
    .max(observeFacts.length)
    .optional()
    .describe(`Facts to show instead of the default ${defaultObservedFacts.join(', ')}. value, text, and help carry displayed content.`),
  format: z
    .enum(['outline', 'nodes'])
    .default('outline')
    .describe('outline: one compact line per element. nodes: the same elements as JSON objects.'),
  view: viewSchema
    .default('interactive')
    .describe('interactive: what can be operated. content: also what is displayed. all: every element.'),
  within: referenceSchema.optional().describe('An element reference to observe inside, instead of the whole window.'),
});

const elementSchema = z.strictObject({
  actions: z.array(z.string()).optional(),
  automationId: z.string().optional(),
  clipped: z.array(z.string()).optional().describe('Fields cut to maxStringLength.'),
  depth: z.number().describe('Number of emitted ancestors.'),
  flags: z.array(z.string()).optional(),
  help: z.string().optional(),
  more: z.literal(true).optional().describe('Children exist that were not returned.'),
  name: z.string().optional(),
  rect: z.strictObject({ height: z.number(), width: z.number(), x: z.number(), y: z.number() }).optional(),
  ref: z.string(),
  role: z.string(),
  text: z.string().optional(),
  value: z.string().optional(),
});

const resetSchema = z.strictObject({
  baseSample: sampleIdSchema,
  reason: z.enum(['base-expired', 'basis-mismatch']),
});

export const observeOutput = z.strictObject({
  sample: sampleSchema,
  view: viewSchema,
  facts: z.array(factSchema).describe('Facts shown for each element.'),
  unsupportedFacts: z.array(factSchema).describe('Shown facts this application cannot report for any element.'),
  budgets: z.strictObject({
    deadlineMs: z.number(),
    maxBytes: z.number(),
    maxDepth: z.number(),
    maxNodes: z.number(),
    maxStringLength: z.number(),
    maxVisited: z.number(),
  }),
  complete: z.boolean().describe('True when the provider finished and every element selected by the view was returned.'),
  truncation: z.array(truncationSchema),
  counts: z.strictObject({
    bytes: z.number().describe('UTF-8 bytes of the outline, or of the nodes.'),
    emitted: z.number(),
    matched: z.number().describe('Elements the view selects, including context ancestors.'),
    visited: z.number().describe('Elements read from the application.'),
  }),
  warnings: z.array(warningSchema).optional(),
  outline: z
    .string()
    .optional()
    .describe('One line per element: role "name" ref #automationId flags value="" text="" help="" actions= @x,y wxh more.'),
  nodes: z.array(elementSchema).optional(),
  next: z.string().optional().describe('Opaque cursor for the next page of this immutable sample.'),
  continuationUnavailable: unavailableContinuationSchema.optional(),
});

const deltaChangeSchema = z.strictObject({
  change: z.enum(['added', 'changed', 'removed']),
  element: elementSchema.extend({
    ref: z.string().optional().describe('Absent for a removed element the session holds no reference to.'),
  }),
});

const deltaResultSchema = z.strictObject({
  mode: z.literal('delta'),
  sample: sampleSchema,
  baseSample: sampleIdSchema,
  complete: z.boolean().describe('True only when both samples were complete and every change was returned.'),
  removalsSuppressed: z.boolean().describe('True when either sample was incomplete; missing nodes are not reported as deleted.'),
  changes: z.array(deltaChangeSchema),
  counts: z.strictObject({
    added: z.number(),
    changed: z.number(),
    removed: z.number(),
    emitted: z.number(),
    omitted: z.number(),
    bytes: z.number(),
  }),
  truncation: z.array(truncationSchema),
  warnings: z.array(warningSchema).optional(),
  next: z.string().optional().describe('Opaque cursor for the next page of this delta.'),
  continuationUnavailable: unavailableContinuationSchema.optional(),
});

const freshDeltaResultSchema = z.strictObject({
  mode: z.literal('fresh'),
  snapshot: operationSchemaReference(observeOutput, 'observe', 'output'),
  reset: resetSchema,
});

const observeDeltaOutput = z.discriminatedUnion('mode', [deltaResultSchema, freshDeltaResultSchema]);
const observePageOutput = z.union([operationSchemaReference(observeOutput, 'observe', 'output'), deltaResultSchema]);

const observeDeltaInput = observeInput.extend({
  since: sampleIdSchema.describe('The retained sample to compare against. A missing or mismatched base returns a fresh snapshot.'),
});

const observePageInput = z.strictObject({
  budget: z
    .strictObject({
      maxBytes: budgetField(observationBudgets.maxBytes),
      maxNodes: budgetField(observationBudgets.maxNodes),
    })
    .prefault({})
    .describe('Per-page output limits; the original sample scope and projection are fixed by the cursor.'),
  cursor: z
    .string()
    .min(1)
    .max(512)
    .regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    .describe('The opaque next cursor returned by observe or observeDelta.'),
});

export type ObserveInput = z.input<typeof observeInput>;
export type ObserveResult = z.infer<typeof observeOutput>;
export type ObserveOptions = z.output<typeof observeInput>;
export type ObserveDeltaInput = z.input<typeof observeDeltaInput>;
export type ObserveDeltaResult = z.infer<typeof observeDeltaOutput>;
export type ObservePageInput = z.input<typeof observePageInput>;
export type ObservePageResult = z.infer<typeof observePageOutput>;

/** True when the observation would show displayed content, which the operator's content policy governs. */
export function observeNeedsContent(input: ObserveOptions): boolean {
  return requestsContent(shownFacts(input.view, input.facts ?? defaultObservedFacts));
}

type CapturedObservation = {
  /** The first page of the sample. Absent when the sample was compared with its delta base, which pages its own changes. */
  result?: ObserveResult;
  /** The reference of the sample's root, issued even when no page of the sample was projected. */
  root?: string;
  snapshot: ObservationSnapshot;
  stored: boolean;
};

/** Reads one bounded observation and stores its immutable native sample when the session cache can retain it. */
export async function observeWindow(runtime: OperationRuntime, input: ObserveOptions): Promise<ObserveResult> {
  return (await captureObservation(runtime, input)).result!;
}

/**
 * Reads and stores one sample. With a delta base the sample is projected, and so issues references, only when it
 * cannot be compared with the base: a delta names the references of its own changes, and a projection nobody reads
 * would issue references the caller is never told and evict the ones it holds.
 */
async function captureObservation(
  runtime: OperationRuntime,
  input: ObserveOptions,
  preserve: readonly string[] = [],
  base?: ObservationSnapshot,
): Promise<CapturedObservation> {
  const { budget, format, view } = input;
  const shown = shownFacts(view, input.facts ?? defaultObservedFacts);
  assertContentAllowed(runtime, requestsContent(shown));
  const sampled = await sampleTree(
    runtime,
    {
      facts: nativeFacts(view, shown),
      limits: {
        deadlineMs: budget.deadlineMs,
        maxDepth: budget.maxDepth,
        maxStringLength: budget.maxStringLength,
        maxVisited: budget.maxVisited,
      },
      within: input.within,
    },
    ({ deadlineMs, issue, observation, refs, sample, rootId, windowId }) => {
      const snapshot: ObservationSnapshot = {
        observation,
        projection: {
          deadlineMs,
          facts: shown,
          format,
          maxBytes: budget.maxBytes,
          maxDepth: budget.maxDepth,
          maxNodes: budget.maxNodes,
          maxStringLength: budget.maxStringLength,
          maxVisited: budget.maxVisited,
          shown,
          view,
        },
        ...(rootId === undefined ? {} : { rootId }),
        sample,
        scopeKey: scopeKey(sample, rootId, windowId, input, shown),
        windowId,
      };
      const comparable = base !== undefined && base.scopeKey === snapshot.scopeKey;
      const projection = comparable
        ? undefined
        : project({
            budgets: { maxBytes: budget.maxBytes, maxNodes: budget.maxNodes },
            format,
            observation,
            refs,
            shown,
            view,
          });
      const root = projection ? projection.root : observation.nodes[0] && issue(observation.nodes[0]);
      const retained = runtime.state.observations.add(snapshot, preserve);
      runtime.state.ledger.queue(retained.evicted);
      return {
        projection,
        root,
        snapshot,
        stored: retained.stored,
        unsupportedFacts: observation.unsupportedFacts.filter((fact) => shown.includes(fact)),
      };
    },
  );
  const { projection, root, snapshot, stored, unsupportedFacts } = sampled.value;
  return {
    ...(projection
      ? {
          result: snapshotResult(
            runtime,
            snapshot,
            projection,
            unsupportedFacts,
            sampled.warnings,
            budget.maxBytes,
            budget.maxNodes,
            stored,
          ),
        }
      : {}),
    ...(root === undefined ? {} : { root }),
    snapshot,
    stored,
  };
}

function snapshotResult(
  runtime: OperationRuntime,
  snapshot: ObservationSnapshot,
  projection: Projection,
  unsupportedFacts: readonly NativeObserveFact[],
  warnings: readonly { code: 'release-failed'; pending: number }[],
  maxBytes: number,
  maxNodes: number,
  stored: boolean,
): ObserveResult {
  const result: ObserveResult = {
    sample: projection.root === undefined ? snapshot.sample : { ...snapshot.sample, root: projection.root },
    view: snapshot.projection.view,
    facts: [...snapshot.projection.shown],
    unsupportedFacts: [...unsupportedFacts],
    budgets: {
      deadlineMs: snapshot.projection.deadlineMs,
      maxBytes,
      maxDepth: snapshot.projection.maxDepth,
      maxNodes,
      maxStringLength: snapshot.projection.maxStringLength,
      maxVisited: snapshot.projection.maxVisited,
    },
    complete: projection.complete,
    truncation: projection.truncation,
    counts: projection.counts,
    ...(warnings.length > 0 ? { warnings: [...warnings] } : {}),
    ...(projection.outline === undefined ? {} : { outline: projection.outline }),
    ...(projection.nodes === undefined ? {} : { nodes: projection.nodes }),
    ...(projection.nextOffset === undefined
      ? {}
      : stored
        ? { next: runtime.state.observations.cursor({ kind: 'snapshot', offset: projection.nextOffset, sampleId: snapshot.sample.id }) }
        : { continuationUnavailable: 'cache-limit' as const }),
  };
  return result;
}

export const observeOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'read',
  input: observeInput,
  name: 'observe',
  output: observeOutput,
  summary: 'Reads a bounded outline of the window, or of an element inside it. Elements carry references other operations accept.',
  run: (input, runtime) => observeWindow(runtime, input),
  summarize(input, output) {
    const parsed = observeOutput.safeParse(output);
    const result = parsed.success ? parsed.data : undefined;
    return {
      format: input.format,
      scoped: input.within !== undefined,
      view: input.view,
      ...(result ? { complete: result.complete, emitted: result.counts.emitted, visited: result.counts.visited } : {}),
    };
  },
});

export const observeDeltaOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'read',
  input: observeDeltaInput,
  name: 'observeDelta',
  output: observeDeltaOutput,
  summary: 'Takes a fresh bounded sample and compares it with a retained matching observation; incomplete samples never report removals.',
  async run(input, runtime) {
    const base = runtime.state.observations.get(input.since);
    const { since, ...options } = input;
    const captured = await captureObservation(runtime, options, base ? [since] : [], base);
    if (!base) {
      return {
        mode: 'fresh',
        snapshot: captured.result!,
        reset: { baseSample: since, reason: 'base-expired' },
      };
    }
    if (!captured.result) {
      const sequence = Number(captured.snapshot.sample.id.slice(1));
      // The stored copy is the one a continuation reads, so projecting it once serves every page.
      const current = (captured.stored && runtime.state.observations.get(captured.snapshot.sample.id)) || captured.snapshot;
      return await deltaPage(
        runtime,
        base,
        current,
        input.budget.maxNodes,
        input.budget.maxBytes,
        0,
        sequence,
        captured.root,
        captured.stored,
      );
    }
    return {
      mode: 'fresh',
      snapshot: captured.result,
      reset: { baseSample: since, reason: 'basis-mismatch' },
    };
  },
  summarize(input, output) {
    const result = observeDeltaOutput.safeParse(output);
    return {
      base: input.since,
      ...(result.success && result.data.mode === 'delta'
        ? { complete: result.data.complete, emitted: result.data.counts.emitted }
        : { fresh: true }),
    };
  },
});

export const observePageOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'read',
  input: observePageInput,
  name: 'observePage',
  output: observePageOutput,
  summary: 'Reads the next page of a retained immutable observation or delta without taking a new sample.',
  async run(input, runtime) {
    const cursor = runtime.state.observations.readCursor(input.cursor);
    if (!cursor) {
      throw expiredCursorError();
    }
    const snapshot = runtime.state.observations.get(cursor.sampleId);
    if (!snapshot) {
      throw expiredCursorError();
    }
    const stale = runtime.state.observations.dropOtherEpoch(runtime.state.incarnation, runtime.previewGeneration());
    runtime.state.ledger.queue(stale);
    if (snapshot.sample.epoch.incarnation !== runtime.state.incarnation || snapshot.sample.epoch.region !== runtime.previewGeneration()) {
      await flushLedger(runtime);
      throw expiredCursorError();
    }
    if (cursor.kind === 'snapshot') {
      if (cursor.offset > snapshot.observation.nodes.length) {
        throw expiredCursorError();
      }
      const sequence = runtime.state.nextSample();
      const projection = project({
        budgets: input.budget,
        format: snapshot.projection.format,
        observation: snapshot.observation,
        offset: cursor.offset,
        refs: refsForSnapshot(runtime, snapshot, sequence),
        shown: snapshot.projection.shown,
        view: snapshot.projection.view,
      });
      runtime.state.ledger.queue(runtime.state.refs.evict(sequence, runtime.previewGeneration()));
      const warnings = await flushLedger(runtime);
      return snapshotResult(
        runtime,
        snapshot,
        projection,
        snapshot.observation.unsupportedFacts.filter((fact) => snapshot.projection.shown.includes(fact)),
        warnings,
        input.budget.maxBytes,
        input.budget.maxNodes,
        true,
      );
    }
    const base = runtime.state.observations.get(cursor.baseSampleId);
    if (!base || base.scopeKey !== snapshot.scopeKey) {
      throw expiredCursorError();
    }
    const sequence = runtime.state.nextSample();
    const root = snapshot.observation.nodes[0];
    const rootRef = root ? issueForSnapshot(runtime, snapshot, root, sequence) : undefined;
    runtime.state.ledger.queue(runtime.state.refs.evict(sequence, runtime.previewGeneration()));
    const warnings = await flushLedger(runtime);
    return await deltaPage(
      runtime,
      base,
      snapshot,
      input.budget.maxNodes,
      input.budget.maxBytes,
      cursor.offset,
      sequence,
      rootRef,
      true,
      warnings,
    );
  },
  summarize(_input, output) {
    return { cursor: true, ...(observePageOutput.safeParse(output).success ? { page: true } : {}) };
  },
});

type DeltaCandidate = {
  element: ProjectedElement;
  kind: 'added' | 'changed' | 'removed';
  node: NativeObservedNode;
  source: ObservationSnapshot;
};

/**
 * A change names its element by reference. A removed element is gone, so it gets no new reference: it keeps the one the
 * session already holds, and has none otherwise. Issuing one would spend table capacity and evict held references.
 */
function deltaElement(
  runtime: OperationRuntime,
  candidate: DeltaCandidate,
  sequence: number,
): z.infer<typeof deltaChangeSchema>['element'] {
  const { ref: _canonical, ...element } = candidate.element;
  const ref =
    candidate.kind === 'removed'
      ? runtime.state.refs.peek(candidate.node.id)
      : issueForSnapshot(runtime, candidate.source, candidate.node, sequence);
  return { ...(ref === undefined ? {} : { ref }), ...element };
}

async function deltaPage(
  runtime: OperationRuntime,
  base: ObservationSnapshot,
  current: ObservationSnapshot,
  maxNodes: number,
  maxBytes: number,
  offset: number,
  sequence: number,
  sampleRoot: string | undefined,
  stored: boolean,
  warnings: readonly { code: 'release-failed'; pending: number }[] = [],
): Promise<z.infer<typeof deltaResultSchema>> {
  const previous = canonicalProjection(base);
  const next = canonicalProjection(current);
  const completeBasis = base.observation.complete && current.observation.complete && previous.complete && next.complete;
  const previousById = new Map(previous.items.map((item) => [item.id, item]));
  const nextById = new Map(next.items.map((item) => [item.id, item]));
  const candidates: DeltaCandidate[] = [];
  for (const item of next.items) {
    const old = previousById.get(item.id);
    const kind = old === undefined ? 'added' : old.signature === item.signature ? undefined : 'changed';
    if (kind) {
      candidates.push({ element: item.element, kind, node: item.node, source: current });
    }
  }
  if (completeBasis) {
    for (const item of previous.items) {
      if (!nextById.has(item.id)) {
        candidates.push({ element: item.element, kind: 'removed', node: item.node, source: base });
      }
    }
  }

  const page: z.infer<typeof deltaChangeSchema>[] = [];
  let bytes = -1;
  let stop: 'maxBytes' | 'maxNodes' | undefined;
  for (let index = offset; index < candidates.length; index += 1) {
    if (page.length >= maxNodes) {
      stop = 'maxNodes';
      break;
    }
    const candidate = candidates[index];
    const change = { change: candidate.kind, element: deltaElement(runtime, candidate, sequence) };
    const size = Buffer.byteLength(JSON.stringify(change), 'utf8') + 1;
    if (bytes + size > maxBytes) {
      stop = 'maxBytes';
      break;
    }
    bytes += size;
    page.push(change);
  }
  const nextOffset = offset + page.length;
  const truncation: z.infer<typeof truncationSchema>[] = [...base.observation.truncation, ...current.observation.truncation];
  if (stop) {
    truncation.push({
      limit: stop === 'maxNodes' ? maxNodes : maxBytes,
      omitted: candidates.length - nextOffset,
      reason: stop,
    });
  }
  const result: z.infer<typeof deltaResultSchema> = {
    mode: 'delta',
    sample: { ...current.sample, ...(sampleRoot === undefined ? {} : { root: sampleRoot }) },
    baseSample: base.sample.id,
    complete: completeBasis && nextOffset === candidates.length,
    removalsSuppressed: !completeBasis,
    changes: page,
    counts: {
      added: candidates.filter((candidate) => candidate.kind === 'added').length,
      changed: candidates.filter((candidate) => candidate.kind === 'changed').length,
      removed: candidates.filter((candidate) => candidate.kind === 'removed').length,
      emitted: page.length,
      omitted: candidates.length - nextOffset,
      bytes: Math.max(0, bytes),
    },
    truncation,
    ...(warnings.length > 0 ? { warnings: [...warnings] } : {}),
  };
  if (nextOffset < candidates.length) {
    if (stored && runtime.state.observations.get(base.sample.id) && runtime.state.observations.get(current.sample.id)) {
      result.next = runtime.state.observations.cursor({
        baseSampleId: base.sample.id,
        kind: 'delta',
        offset: nextOffset,
        sampleId: current.sample.id,
      });
    } else {
      result.continuationUnavailable = 'cache-limit';
    }
  }
  runtime.state.ledger.queue(runtime.state.refs.evict(sequence, runtime.previewGeneration()));
  const releaseWarnings = await flushLedger(runtime);
  if (releaseWarnings.length > 0) {
    result.warnings = [...(result.warnings ?? []), ...releaseWarnings];
  }
  return result;
}

type CanonicalProjection = {
  complete: boolean;
  items: { element: ProjectedElement; id: string; node: NativeObservedNode; signature: string }[];
};

// Snapshots are immutable, so one projection serves every page of every delta that reads the snapshot.
const canonicalProjections = new WeakMap<ObservationSnapshot, CanonicalProjection>();

function canonicalProjection(snapshot: ObservationSnapshot): CanonicalProjection {
  const cached = canonicalProjections.get(snapshot);
  if (cached) {
    return cached;
  }
  const nodeById = new Map(snapshot.observation.nodes.map((node) => [node.id, node]));
  const projection = project({
    budgets: { maxBytes: 16 * 1024 * 1024, maxNodes: 5_000 },
    format: 'nodes',
    observation: snapshot.observation,
    refs: {
      assign: (nodes) => nodes.map((node) => node.id),
      maxLength: () => 1,
    },
    shown: snapshot.projection.shown,
    view: snapshot.projection.view,
  });
  const items = (projection.nodes ?? []).flatMap((element) => {
    const node = nodeById.get(element.ref);
    if (!node) {
      return [];
    }
    const { ref: _ref, ...visible } = element;
    const signature = JSON.stringify({ ...visible, parentId: node.parentId, scope: node.scope });
    return [{ element, id: node.id, node, signature }];
  });
  const canonical = { complete: projection.complete && new Set(items.map((item) => item.id)).size === items.length, items };
  canonicalProjections.set(snapshot, canonical);
  return canonical;
}

function scopeKey(
  sample: ObservationSnapshot['sample'],
  rootId: string | undefined,
  windowId: string,
  input: ObserveOptions,
  shown: readonly NativeObserveFact[],
): string {
  return JSON.stringify({
    epoch: sample.epoch,
    format: input.format,
    maxDepth: input.budget.maxDepth,
    maxStringLength: input.budget.maxStringLength,
    maxVisited: input.budget.maxVisited,
    rootId: rootId ?? null,
    shown,
    scope: sample.scope,
    view: input.view,
    windowId,
  });
}

function refsForSnapshot(runtime: OperationRuntime, snapshot: ObservationSnapshot, sequence: number): ProjectionRefs {
  return {
    assign: (nodes) => nodes.map((node) => issueForSnapshot(runtime, snapshot, node, sequence)),
    maxLength: (count) => runtime.state.refs.maxLength(count),
  };
}

function issueForSnapshot(runtime: OperationRuntime, snapshot: ObservationSnapshot, node: NativeObservedNode, sequence: number): string {
  return runtime.state.refs.issue(
    {
      nativeId: node.id,
      previewGeneration: snapshot.sample.epoch.region,
      scope: node.scope,
      windowId: snapshot.windowId,
    },
    sequence,
  );
}

function expiredCursorError(): Error {
  return operationError(
    'invalid argument',
    'observation-cursor-expired',
    'The observation continuation is no longer available; take a fresh observation.',
  );
}
