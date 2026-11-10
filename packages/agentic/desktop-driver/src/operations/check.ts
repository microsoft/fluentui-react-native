import { z } from 'zod';

import type { DesktopHostEvent, NativeElementSnapshot, SupportedValue } from '../host/types.js';
import { toWebDriverError } from '../protocol/errors.js';
import { operationError } from './envelope.js';
import { checkPollMs, checkWaitMs, maxExpectedTextLength } from './limits.js';
import { assertContentAllowed, requireBoundedObservation } from './policy.js';
import type { UniquenessProof } from './proofs.js';
import { referenceFailureError } from './refs.js';
import { registerOperation } from './runtime.js';
import type { OperationRuntime } from './runtime.js';
import { flushLedger, interpretFailure } from './sampling.js';
import { searchSelector, selectorKeys, selectorNeedsContent, selectorSchema } from './selector.js';
import type { Selector, SelectorSearch } from './selector.js';
import { budgetField, referenceSchema, warningSchema } from './shapes.js';
import { clipText, neutralizeText } from './text.js';

/** How much of a failed name, value, or text predicate's actual string a result shows. */
const actualTextLength = 120;

const exactText = z.string().max(maxExpectedTextLength);
const partText = z.string().min(1).max(256);
const state = z.boolean().optional();

const stateKeys = ['checked', 'enabled', 'expanded', 'focused', 'selected', 'visible'] as const;
const textKeys = ['name', 'nameContains', 'text', 'textContains', 'value', 'valueContains'] as const;
/** Displayed content, which the operator's content policy governs. Names identify controls and are always readable. */
const contentKeys = new Set<ExpectationKey>(['text', 'textContains', 'value', 'valueContains']);
const expectationKeys = ['present', ...stateKeys, ...textKeys] as const;
type ExpectationKey = (typeof expectationKeys)[number];

const expectation = z
  .strictObject({
    checked: z.union([z.boolean(), z.literal('mixed')]).optional(),
    enabled: state,
    expanded: state,
    focused: state,
    name: exactText.optional().describe('Exact name.'),
    nameContains: partText.optional().describe('Part of the name, any case.'),
    present: z.boolean().optional().describe('false: the referenced element is gone. Alone, with ref only.'),
    selected: state,
    text: exactText.optional().describe('Exact displayed text.'),
    textContains: partText.optional().describe('Part of the text, any case.'),
    value: exactText.optional().describe('Exact value; "" is empty.'),
    valueContains: partText.optional().describe('Part of the value, any case.'),
    visible: state,
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), { message: 'Give at least one expectation.' })
  .refine((input) => input.present !== false || Object.values(input).filter((value) => value !== undefined).length === 1, {
    message: 'present: false stands alone.',
  })
  .refine((input) => input.name === undefined || input.nameContains === undefined, { message: 'Give name or nameContains, not both.' })
  .refine((input) => input.text === undefined || input.textContains === undefined, { message: 'Give text or textContains, not both.' })
  .refine((input) => input.value === undefined || input.valueContains === undefined, { message: 'Give value or valueContains, not both.' });

type Expectation = z.output<typeof expectation>;

const matchCounts = ['none', 'unique', 'some'] as const;

export const checkInput = z
  .strictObject({
    expect: expectation.optional().describe('All must hold. With find, the selector must also match exactly one element.'),
    find: selectorSchema.optional(),
    matches: z.enum(matchCounts).optional().describe('With find, instead of expect: how many elements must match.'),
    ref: referenceSchema.optional(),
    waitMs: budgetField(checkWaitMs).describe('How long to wait for it to hold; 0 checks once.'),
  })
  .refine((input) => (input.ref === undefined) !== (input.find === undefined), { message: 'Give ref or find, not both.' })
  .refine((input) => input.ref === undefined || (input.expect !== undefined && input.matches === undefined), {
    message: 'With ref, give expect and not matches.',
  })
  .refine((input) => input.find === undefined || (input.expect === undefined) !== (input.matches === undefined), {
    message: 'With find, give expect or matches, not both.',
  })
  .refine((input) => input.find === undefined || input.expect?.present === undefined, {
    message: 'present is only for ref; check a selector with matches: none instead.',
  })
  .describe('Give ref with expect, or find with expect or matches.');

export type CheckInput = z.input<typeof checkInput>;
export type CheckOptions = z.output<typeof checkInput>;

const predicateStatus = ['passed', 'failed', 'unsupported'] as const;
type PredicateStatus = (typeof predicateStatus)[number];

const predicateResult = z.strictObject({
  expect: z.enum(expectationKeys),
  status: z.enum(predicateStatus).describe('unsupported: the provider does not report this for the element.'),
  actual: z
    .union([z.boolean(), z.literal('mixed'), z.string()])
    .optional()
    .describe('What the element showed, for a failed predicate. Long text is cut.'),
  clipped: z.literal(true).optional().describe('actual was cut.'),
});
type PredicateResult = z.infer<typeof predicateResult>;

const evaluationStatus = ['passed', 'failed', 'unsupported', 'inconclusive'] as const;
type EvaluationStatus = (typeof evaluationStatus)[number];

export const checkOutput = z.strictObject({
  status: z
    .enum([...evaluationStatus, 'timed-out'])
    .describe(
      'passed: every expectation held. failed: one did not. unsupported: the provider cannot report one. inconclusive: an incomplete search cannot decide. timed-out: the wait ended first.',
    ),
  last: z.enum(['failed', 'inconclusive']).optional().describe('What the last evaluation found, when the wait timed out.'),
  attempts: z.number().describe('Evaluations made.'),
  elapsedMs: z.number(),
  window: z.string().optional(),
  search: z
    .strictObject({
      outcome: z.enum(['unique', 'multiple', 'none', 'inconclusive']),
      reasons: z.array(z.enum(['clipped', 'incomplete', 'unsupported-fact'])).optional(),
      definite: z.number(),
      possible: z.number(),
      visited: z.number(),
    })
    .optional()
    .describe("The last search's outcome, with find."),
  ref: z.string().optional().describe('With find, the element the last search proved unique.'),
  sample: z.string().optional().describe('The sample that proved ref unique; cite both to act on the element.'),
  predicates: z.array(predicateResult).optional().describe("Each expectation's outcome in the last evaluation."),
  warnings: z.array(warningSchema).optional(),
});

export type CheckResult = z.infer<typeof checkOutput>;

type Evaluation = {
  predicates?: PredicateResult[];
  proof?: UniquenessProof;
  search?: SelectorSearch;
  status: EvaluationStatus;
  /** True when waiting cannot change the outcome: it passed, the provider cannot report a fact, or the element is gone. */
  terminal: boolean;
  window?: string;
};

function supportedState<T>(expected: T, reported: SupportedValue<T>): PredicateResult['status'] {
  if (!reported.supported) {
    return 'unsupported';
  }
  return reported.value === expected ? 'passed' : 'failed';
}

function shownText(text: string): Pick<PredicateResult, 'actual' | 'clipped'> {
  const cut = clipText(text, actualTextLength);
  return { actual: neutralizeText(cut.text), ...(cut.clipped ? { clipped: true as const } : {}) };
}

function compareText(actual: string | undefined, expected: string, partial: boolean): PredicateStatus {
  if (actual === undefined) {
    return 'unsupported';
  }
  return (partial ? actual.toLowerCase().includes(expected.toLowerCase()) : actual === expected) ? 'passed' : 'failed';
}

/** Evaluates every expectation against one fresh read of the element. */
function evaluateSnapshot(expected: Expectation, snapshot: NativeElementSnapshot): PredicateResult[] {
  const results: PredicateResult[] = [];
  for (const key of expectationKeys) {
    const wanted = expected[key];
    if (wanted === undefined) {
      continue;
    }
    if (key === 'present') {
      results.push({ expect: key, status: wanted === true ? 'passed' : 'failed', ...(wanted === true ? {} : { actual: true }) });
      continue;
    }
    if ((stateKeys as readonly string[]).includes(key)) {
      const reported = snapshot[key as (typeof stateKeys)[number]] as SupportedValue<boolean | 'mixed'>;
      const status = supportedState(wanted as boolean | 'mixed', reported);
      results.push({ expect: key, status, ...(status === 'failed' && reported.supported ? { actual: reported.value } : {}) });
      continue;
    }
    const field = key.startsWith('name') ? 'name' : key.startsWith('value') ? 'value' : 'text';
    // An element without a name is unnamed, not unreadable; a missing value or text is one the provider does not report.
    const actual = field === 'name' ? (snapshot.name ?? '') : snapshot[field];
    const status = compareText(actual, wanted as string, key.endsWith('Contains'));
    results.push({ expect: key, status, ...(status === 'failed' && actual !== undefined ? shownText(actual) : {}) });
  }
  return results;
}

function combine(predicates: readonly PredicateResult[]): EvaluationStatus {
  if (predicates.some((predicate) => predicate.status === 'failed')) {
    return 'failed';
  }
  return predicates.some((predicate) => predicate.status === 'unsupported') ? 'unsupported' : 'passed';
}

/** A fresh read of an element; no snapshot means the element is gone. */
type Read = { snapshot?: NativeElementSnapshot; window?: string };

/**
 * Reads the referenced element afresh. The element is gone only when the provider says so or its preview region was
 * replaced; a reference the table merely forgot proves nothing, so it fails like any unusable reference.
 */
async function readReference(runtime: OperationRuntime, reference: string): Promise<Read> {
  const resolution = runtime.state.refs.resolve(reference, runtime.previewGeneration());
  if (resolution.ok === false) {
    if (resolution.failure === 'region-changed') {
      return {};
    }
    throw referenceFailureError(resolution.failure, reference);
  }
  const { entry } = resolution;
  try {
    const snapshot = await runtime.command('Reading the element to check it', (signal) => runtime.host.snapshot(entry.nativeId, signal));
    return { snapshot, window: entry.windowId };
  } catch (error) {
    const interpreted = interpretFailure(runtime, { windowId: entry.windowId, within: reference }, error);
    const { code } = toWebDriverError(interpreted);
    if (code === 'stale element reference' || code === 'no such window') {
      return { window: entry.windowId };
    }
    throw interpreted;
  }
}

async function evaluateReference(runtime: OperationRuntime, reference: string, expected: Expectation): Promise<Evaluation> {
  const { snapshot, window } = await readReference(runtime, reference);
  if (!snapshot) {
    const gonePasses = expected.present === false;
    return {
      predicates: [{ expect: 'present', status: gonePasses ? 'passed' : 'failed', ...(gonePasses ? {} : { actual: false }) }],
      status: gonePasses ? 'passed' : 'failed',
      // A reference is never reissued, so a gone element stays gone.
      terminal: true,
      ...(window === undefined ? {} : { window }),
    };
  }
  const predicates = evaluateSnapshot(expected, snapshot);
  const status = combine(predicates);
  return { predicates, status, terminal: status !== 'failed', window };
}

/**
 * Whether a search's outcome satisfies a required match count, cannot, or cannot yet say. `none` is proven only by a
 * complete search, and two definite matches prove more than one even from a partial one.
 */
function countStatus(search: SelectorSearch, required: (typeof matchCounts)[number]): EvaluationStatus {
  const { definite, outcome } = search.classification;
  switch (required) {
    case 'none':
      return outcome === 'none' ? 'passed' : definite.length > 0 ? 'failed' : 'inconclusive';
    case 'some':
      return definite.length > 0 ? 'passed' : outcome === 'none' ? 'failed' : 'inconclusive';
    case 'unique':
      return outcome === 'unique' ? 'passed' : outcome === 'multiple' || outcome === 'none' ? 'failed' : 'inconclusive';
  }
}

async function evaluateSelector(runtime: OperationRuntime, input: CheckOptions & { find: Selector }): Promise<Evaluation> {
  const sampled = await searchSelector(runtime, input.find, { issueUnique: input.expect !== undefined || input.matches === 'unique' });
  const search = sampled.value;
  const base = { search, window: sampled.sample.window };
  // A fact the provider does not read at all is not one a later search will find.
  if (search.classification.reasons.includes('unsupported-fact')) {
    return { ...base, status: 'unsupported', terminal: true };
  }
  if (input.matches !== undefined) {
    const status = countStatus(search, input.matches);
    return { ...base, ...(search.proof ? { proof: search.proof } : {}), status, terminal: status === 'passed' };
  }
  const status = countStatus(search, 'unique');
  if (status !== 'passed' || !search.proof) {
    return { ...base, status, terminal: false };
  }
  const { snapshot } = await readReference(runtime, search.proof.reference);
  if (!snapshot) {
    // The match went between the search and the read; the next search may find its replacement.
    return { ...base, status: 'inconclusive', terminal: false };
  }
  const predicates = evaluateSnapshot(input.expect!, snapshot);
  const combined = combine(predicates);
  return { ...base, predicates, proof: search.proof, status: combined, terminal: combined !== 'failed' };
}

/**
 * Wakes a pause early when the host reports a change to the checked window or its application. Events are advisory:
 * they only bring the next authoritative read forward and never satisfy a check. It subscribes before the first read, so
 * a change between that read and the pause is not missed.
 */
function watchHost(runtime: OperationRuntime, window: () => string | undefined) {
  let changed = false;
  let wake: (() => void) | undefined;
  const relevant = (event: DesktopHostEvent) => {
    const watched = window();
    return event.type === 'application-exited' || event.type === 'window-opened' || watched === undefined || event.windowId === watched;
  };
  const unsubscribe = runtime.host.subscribe?.((event) => {
    if (relevant(event)) {
      changed = true;
      wake?.();
    }
  });
  return {
    dispose(): void {
      unsubscribe?.();
    },
    pause(ms: number, minimumMs: number): Promise<void> {
      const earliest = Date.now() + Math.min(ms, minimumMs);
      return new Promise((resolve) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const done = () => {
          clearTimeout(timer);
          runtime.signal.removeEventListener('abort', done);
          wake = undefined;
          changed = false;
          resolve();
        };
        // A change ends the pause, but not before the minimum has passed since the evaluation that came before it.
        const early = () => {
          clearTimeout(timer);
          timer = setTimeout(done, Math.max(0, earliest - Date.now()));
        };
        timer = setTimeout(done, ms);
        wake = early;
        if (changed) {
          early();
        }
        runtime.signal.addEventListener('abort', done, { once: true });
      });
    },
  };
}

function cancelledError() {
  return operationError('unknown error', 'cancelled', 'The request was cancelled while the check waited.');
}

function evaluate(runtime: OperationRuntime, input: CheckOptions): Promise<Evaluation> {
  return input.find ? evaluateSelector(runtime, { ...input, find: input.find }) : evaluateReference(runtime, input.ref!, input.expect!);
}

/** True when the check searches or compares displayed content, which the operator's content policy governs. */
export function checkNeedsContent(input: CheckOptions): boolean {
  return (
    (input.find !== undefined && selectorNeedsContent(input.find)) ||
    expectationKeys.some((key) => contentKeys.has(key) && input.expect?.[key] !== undefined)
  );
}

/** Evaluates one check, waiting as asked. Shared by `check` and by the check steps of `sequence`. */
export async function runCheck(runtime: OperationRuntime, input: CheckOptions): Promise<CheckResult> {
  assertContentAllowed(runtime, checkNeedsContent(input));
  const startedAt = Date.now();
  const deadline = startedAt + input.waitMs;
  let evaluation: Evaluation | undefined;
  const watcher = watchHost(runtime, () => evaluation?.window);
  let attempts = 0;
  let timedOut = false;
  try {
    for (let pauseMs: number = checkPollMs.first; ; pauseMs = Math.min(checkPollMs.longest, pauseMs * 2)) {
      attempts += 1;
      const evaluationStartedAt = Date.now();
      evaluation = await evaluate(runtime, input);
      const evaluationMs = Date.now() - evaluationStartedAt;
      if (evaluation.terminal || input.waitMs === 0) {
        break;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        timedOut = true;
        break;
      }
      await watcher.pause(Math.min(pauseMs, remaining), Math.max(checkPollMs.minimum, evaluationMs));
      if (runtime.signal.aborted) {
        throw cancelledError();
      }
    }
  } finally {
    watcher.dispose();
  }
  if (evaluation.proof) {
    runtime.state.proofs.record(evaluation.proof);
  }
  const warnings = await flushLedger(runtime);
  const { classification } = evaluation.search ?? {};
  return {
    status: timedOut ? 'timed-out' : evaluation.status,
    ...(timedOut ? { last: evaluation.status as 'failed' | 'inconclusive' } : {}),
    attempts,
    elapsedMs: Date.now() - startedAt,
    ...(evaluation.window === undefined ? {} : { window: evaluation.window }),
    ...(evaluation.search && classification
      ? {
          search: {
            outcome: classification.outcome,
            ...(classification.reasons.length > 0 ? { reasons: classification.reasons } : {}),
            definite: classification.definite.length,
            possible: classification.possible.length,
            visited: evaluation.search.visited,
          },
        }
      : {}),
    ...(evaluation.proof ? { ref: evaluation.proof.reference, sample: evaluation.proof.sample } : {}),
    ...(evaluation.predicates ? { predicates: evaluation.predicates } : {}),
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}

export const checkOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'read',
  input: checkInput,
  name: 'check',
  output: checkOutput,
  summary:
    'Checks that an element shows a state, name, value, or text, or that a selector matches none, one, or some elements, optionally waiting. A completed action does not by itself pass a check.',
  run: (input, runtime) => runCheck(runtime, input),
  summarize(input, output) {
    // Expected names, values, and text can quote what an application displayed, so only the expectation names are kept.
    return {
      ...(input.expect ? { expect: expectationKeys.filter((key) => input.expect![key] !== undefined).join(',') } : {}),
      ...(input.find ? { by: selectorKeys(input.find) } : { ref: input.ref! }),
      ...(input.matches ? { matches: input.matches } : {}),
      waitMs: input.waitMs,
      ...(output ? { attempts: output.attempts, status: output.status } : {}),
    };
  },
});
