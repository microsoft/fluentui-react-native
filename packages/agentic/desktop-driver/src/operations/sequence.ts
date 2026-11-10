import { z } from 'zod';

import type { MutationReport } from '../protocol/settlement.js';
import { actInput, actOutput, assertActionSupported, assertNotQuarantined, performAction } from './act.js';
import type { ActOptions } from './act.js';
import { checkInput, checkNeedsContent, checkOutput, runCheck } from './check.js';
import type { CheckOptions } from './check.js';
import { operationError, operationFailure } from './envelope.js';
import { checkWaitMs, maxSequenceSteps } from './limits.js';
import { observeInput, observeNeedsContent, observeOutput, observeWindow } from './observe.js';
import { assertContentAllowed, requireBoundedObservation } from './policy.js';
import { registerOperation } from './runtime.js';
import type { OperationRuntime } from './runtime.js';
import { operationSchemaReference } from './schemaReferences.js';
import { selectorNeedsContent } from './selector.js';

const step = z.union([
  z.strictObject({ act: operationSchemaReference(actInput, 'act', 'input') }),
  z.strictObject({ check: operationSchemaReference(checkInput, 'check', 'input') }),
]);

const sequenceInput = z
  .strictObject({
    steps: z
      .array(step)
      .min(1)
      .max(maxSequenceSteps)
      .describe('Each { act } or { check }, run in order. Stops at the first step that fails or check that does not pass.'),
    observe: operationSchemaReference(observeInput, 'observe', 'input')
      .optional()
      .describe('A closing observation, read after the last step that ran.'),
  })
  .refine((input) => totalWaitMs(input.steps) <= checkWaitMs.ceiling, {
    message: `The checks may wait ${checkWaitMs.ceiling} ms in total.`,
  });

export type SequenceInput = z.input<typeof sequenceInput>;
type SequenceOptions = z.output<typeof sequenceInput>;
type Step = { act: ActOptions } | { check: CheckOptions };

const failure = z.strictObject({
  code: z.string(),
  message: z.string(),
  reason: z.string().optional(),
  nativeCode: z.string().optional(),
  mutation: z
    .strictObject({
      disposition: z.enum(['applied', 'indeterminate', 'rejected']),
      effect: z.enum(['applied', 'none', 'partial', 'unknown']),
      quarantined: z.boolean(),
    })
    .optional()
    .describe('What a failed act did. rejected: nothing was dispatched. indeterminate: it may still land.'),
});
type StepFailure = z.infer<typeof failure>;

const sequenceOutput = z.strictObject({
  status: z
    .enum(['completed', 'stopped'])
    .describe('completed: every step ran and every check passed. stopped: one did not, and later steps did not run.'),
  stoppedAt: z.number().optional().describe('Index of the step that stopped the sequence.'),
  steps: z
    .array(
      z.strictObject({
        act: operationSchemaReference(actOutput, 'act', 'output').optional(),
        check: operationSchemaReference(checkOutput, 'check', 'output').optional(),
        error: failure.optional(),
      }),
    )
    .describe('One outcome for each step that ran, in order.'),
  observation: operationSchemaReference(observeOutput, 'observe', 'output').optional(),
  observationError: failure.optional().describe('Why the closing observation could not be read.'),
});

export type SequenceResult = z.infer<typeof sequenceOutput>;
type StepOutcome = SequenceResult['steps'][number];

function totalWaitMs(steps: readonly Step[]): number {
  return steps.reduce((total, entry) => total + ('check' in entry ? entry.check.waitMs : 0), 0);
}

/** A step's failure, reduced exactly as a failed operation's is, so nothing the application displayed rides along. */
function describeFailure(error: unknown): StepFailure {
  const shaped = operationFailure(error, { operation: 'sequence', requestId: '' });
  const { mutation, nativeCode, reason } = shaped.data ?? {};
  return {
    code: shaped.code,
    message: shaped.message,
    ...(typeof reason === 'string' ? { reason } : {}),
    ...(typeof nativeCode === 'string' ? { nativeCode } : {}),
    ...(mutation ? { mutation: mutation as MutationReport } : {}),
  };
}

/** Everything that would refuse the whole request is checked before the first step, so no refusal lands halfway. */
function preflight(runtime: OperationRuntime, input: SequenceOptions): void {
  const actions = input.steps.flatMap((entry) => ('act' in entry ? [entry.act.action] : []));
  if (actions.length > 0) {
    assertNotQuarantined(runtime);
    actions.forEach((action) => assertActionSupported(runtime, action));
  }
  const stepNeedsContent = (entry: Step) =>
    'check' in entry ? checkNeedsContent(entry.check) : entry.act.find !== undefined && selectorNeedsContent(entry.act.find);
  assertContentAllowed(runtime, input.steps.some(stepNeedsContent) || (input.observe !== undefined && observeNeedsContent(input.observe)));
}

async function runStep(runtime: OperationRuntime, entry: Step): Promise<{ outcome: StepOutcome; passed: boolean }> {
  if (runtime.signal.aborted) {
    const cancelled = operationError('unknown error', 'cancelled', 'The request was cancelled before this step ran.');
    return { outcome: { error: describeFailure(cancelled) }, passed: false };
  }
  try {
    if ('act' in entry) {
      return { outcome: { act: await performAction(runtime, entry.act) }, passed: true };
    }
    const result = await runCheck(runtime, entry.check);
    return { outcome: { check: result }, passed: result.status === 'passed' };
  } catch (error) {
    return { outcome: { error: describeFailure(error) }, passed: false };
  }
}

export const sequenceOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'mutate',
  input: sequenceInput,
  name: 'sequence',
  output: sequenceOutput,
  summary:
    'Runs up to 8 act and check steps in one turn, stopping at the first that fails or does not pass, then optionally observes. Not a transaction: steps that ran stay done.',
  async run(input, runtime) {
    preflight(runtime, input);
    const steps: StepOutcome[] = [];
    let stoppedAt: number | undefined;
    for (const [index, entry] of input.steps.entries()) {
      const { outcome, passed } = await runStep(runtime, entry);
      steps.push(outcome);
      if (!passed) {
        stoppedAt = index;
        break;
      }
    }
    let closing: Pick<SequenceResult, 'observation' | 'observationError'> = {};
    if (input.observe && !runtime.signal.aborted) {
      try {
        closing = { observation: await observeWindow(runtime, input.observe) };
      } catch (error) {
        closing = { observationError: describeFailure(error) };
      }
    }
    return {
      status: stoppedAt === undefined ? 'completed' : 'stopped',
      ...(stoppedAt === undefined ? {} : { stoppedAt }),
      steps,
      ...closing,
    };
  },
  summarize(input, output) {
    return {
      observed: input.observe !== undefined,
      steps: input.steps.map((entry) => ('act' in entry ? entry.act.action : 'check')).join(','),
      ...(output ? { status: output.status, ...(output.stoppedAt === undefined ? {} : { stoppedAt: output.stoppedAt }) } : {}),
    };
  },
});
