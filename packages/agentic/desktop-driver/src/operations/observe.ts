import { z } from 'zod';

import { observationBudgets } from './limits.js';
import { assertContentAllowed, requestsContent, requireBoundedObservation } from './policy.js';
import { defaultObservedFacts, nativeFacts, observeFacts, project, shownFacts } from './projection.js';
import { registerOperation } from './runtime.js';
import type { OperationRuntime } from './runtime.js';
import { sampleTree } from './sampling.js';
import { budgetField, factSchema, referenceSchema, sampleSchema, truncationSchema, warningSchema } from './shapes.js';

const viewSchema = z.enum(['interactive', 'content', 'all']);

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
  complete: z.boolean().describe('True when nothing the view selects was left out.'),
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
});

export type ObserveInput = z.input<typeof observeInput>;
export type ObserveResult = z.infer<typeof observeOutput>;
export type ObserveOptions = z.output<typeof observeInput>;

/** True when the observation would show displayed content, which the operator's content policy governs. */
export function observeNeedsContent(input: ObserveOptions): boolean {
  return requestsContent(shownFacts(input.view, input.facts ?? defaultObservedFacts));
}

/** Reads one bounded observation. Shared by `observe` and by the closing observation of `sequence`. */
export async function observeWindow(runtime: OperationRuntime, input: ObserveOptions): Promise<ObserveResult> {
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
    ({ observation, refs }) => ({
      projection: project({ budgets: { maxBytes: budget.maxBytes, maxNodes: budget.maxNodes }, format, observation, refs, shown, view }),
      unsupportedFacts: observation.unsupportedFacts.filter((fact) => shown.includes(fact)),
    }),
  );
  const { projection, unsupportedFacts } = sampled.value;
  return {
    sample: projection.root === undefined ? sampled.sample : { ...sampled.sample, root: projection.root },
    view,
    facts: shown,
    unsupportedFacts,
    budgets: { ...budget, deadlineMs: sampled.deadlineMs },
    complete: projection.complete,
    truncation: projection.truncation,
    counts: projection.counts,
    ...(sampled.warnings.length > 0 ? { warnings: sampled.warnings } : {}),
    ...(projection.outline === undefined ? {} : { outline: projection.outline }),
    ...(projection.nodes === undefined ? {} : { nodes: projection.nodes }),
  };
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
    return {
      format: input.format,
      scoped: input.within !== undefined,
      view: input.view,
      ...(output ? { complete: output.complete, emitted: output.counts.emitted, visited: output.counts.visited } : {}),
    };
  },
});
