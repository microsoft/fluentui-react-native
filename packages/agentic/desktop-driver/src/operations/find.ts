import { z } from 'zod';

import type { NativeObservation } from '../host/types.js';
import { searchBudgets } from './limits.js';
import { requireBoundedObservation } from './policy.js';
import { registerOperation } from './runtime.js';
import { searchSelector, selectorFields, selectorKeys, selectorRequirement, withSelectorRules } from './selector.js';
import { budgetField, sampleSchema, truncationSchema, warningSchema } from './shapes.js';
import { clipText, neutralizeText, quoteText, safeToken } from './text.js';
import { indexParents } from './tree.js';

/** How much of a match's name and of each ancestor's name a result keeps. Longer names are cut and marked. */
const matchNameLength = 120;
const pathNameLength = 48;
const pathDepth = 3;

const findInput = withSelectorRules(
  z.strictObject({
    ...selectorFields,
    budget: z
      .strictObject({
        deadlineMs: budgetField(searchBudgets.deadlineMs).describe('Milliseconds the application may take.'),
        maxDepth: budgetField(searchBudgets.maxDepth).describe('Deepest level searched below the root.'),
        maxStringLength: budgetField(searchBudgets.maxStringLength).describe('Longest name or text compared; longer is cut.'),
        maxVisited: budgetField(searchBudgets.maxVisited).describe('Most elements read from the application.'),
      })
      .prefault({})
      .describe('Search limits. A search that hits one can prove at most that matches exist.'),
    limit: budgetField(searchBudgets.limit).describe('Most matches returned.'),
  }),
).describe(selectorRequirement);

export type FindInput = z.input<typeof findInput>;

const matchSchema = z.strictObject({
  ref: z.string().describe('Reference to use with other operations.'),
  role: z.string(),
  name: z.string().optional(),
  automationId: z.string().optional(),
  path: z.array(z.string()).optional().describe('Nearest named ancestors, outermost first.'),
  match: z.enum(['definite', 'possible']).describe('possible: a cut name or text could still decide the match.'),
  clipped: z.array(z.string()).optional().describe('Fields shown cut.'),
});

const findOutput = z.strictObject({
  sample: sampleSchema,
  outcome: z
    .enum(['unique', 'multiple', 'none', 'inconclusive'])
    .describe('unique and none are proven by a complete search; multiple needs two definite matches; anything else is inconclusive.'),
  reasons: z
    .array(z.enum(['clipped', 'incomplete', 'unsupported-fact']))
    .optional()
    .describe('Why the outcome is inconclusive.'),
  counts: z.strictObject({
    definite: z.number(),
    possible: z.number(),
    visited: z.number().describe('Elements read from the application.'),
  }),
  complete: z.boolean().describe('True when the search read everything it could reach and every match was returned.'),
  truncation: z.array(truncationSchema),
  more: z.number().optional().describe('Candidates beyond limit that were not returned.'),
  warnings: z.array(warningSchema).optional(),
  matches: z.array(matchSchema).describe('Definite matches first, then possible ones, each in document order.'),
});

export type FindResult = z.infer<typeof findOutput>;
type Match = FindResult['matches'][number];

function hasContent(value: string | undefined): value is string {
  return value !== undefined && value.trim().length > 0;
}

/** Names the nearest named ancestors, so two matches with the same name can be told apart by where they sit. */
function ancestorPath(observation: NativeObservation, parents: readonly number[], index: number): string[] {
  const path: string[] = [];
  for (let at = parents[index]; at >= 0 && path.length < pathDepth; at = parents[at]) {
    const ancestor = observation.nodes[at];
    if (hasContent(ancestor.name)) {
      const cut = clipText(ancestor.name, pathNameLength);
      const clipped = cut.clipped || (ancestor.clipped?.includes('name') ?? false);
      path.push(`${safeToken(ancestor.role)} ${quoteText(cut.text, clipped)}`);
    }
  }
  return path.reverse();
}

function describeMatch(
  observation: NativeObservation,
  parents: readonly number[],
  index: number,
  match: Match['match'],
  ref: string,
): Match {
  const node = observation.nodes[index];
  const clipped: string[] = [];
  const entry: Match = { ref, role: safeToken(node.role), match };
  if (hasContent(node.name)) {
    const cut = clipText(node.name, matchNameLength);
    entry.name = neutralizeText(cut.text);
    if (cut.clipped || node.clipped?.includes('name')) {
      clipped.push('name');
    }
  }
  if (hasContent(node.automationId)) {
    const cut = clipText(node.automationId, matchNameLength);
    entry.automationId = neutralizeText(cut.text);
    if (cut.clipped || node.clipped?.includes('automationId')) {
      clipped.push('automationId');
    }
  }
  const path = ancestorPath(observation, parents, index);
  if (path.length > 0) {
    entry.path = path;
  }
  if (clipped.length > 0) {
    entry.clipped = clipped;
  }
  return entry;
}

export const findElementsOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'read',
  input: findInput,
  name: 'find',
  output: findOutput,
  summary:
    'Searches the window, or an element inside it, and states whether the match is unique. Matches carry references other operations accept.',
  async run(input, runtime) {
    const { budget } = input;
    const sampled = await searchSelector(runtime, input, {
      issueUnique: true,
      limits: {
        deadlineMs: budget.deadlineMs,
        maxDepth: budget.maxDepth,
        maxStringLength: budget.maxStringLength,
        maxVisited: budget.maxVisited,
      },
      use: ({ issue, observation }, { classification }) => {
        const parents = indexParents(observation.nodes);
        const candidates = [
          ...classification.definite.map((index) => ({ index, match: 'definite' as const })),
          ...classification.possible.map((index) => ({ index, match: 'possible' as const })),
        ];
        const returned = candidates.slice(0, input.limit);
        return {
          matches: returned.map(({ index, match }) => describeMatch(observation, parents, index, match, issue(observation.nodes[index]))),
          more: candidates.length - returned.length,
          truncation: observation.truncation.map((entry) => ({ ...entry })),
        };
      },
    });
    const { classification, complete, extra, proof, visited } = sampled.value;
    if (proof) {
      runtime.state.proofs.record(proof);
    }
    const { matches, more, truncation: cut } = extra!;
    const truncation: FindResult['truncation'] = more > 0 ? [...cut, { limit: input.limit, omitted: more, reason: 'limit' }] : cut;
    return {
      sample: sampled.sample,
      outcome: classification.outcome,
      ...(classification.reasons.length > 0 ? { reasons: classification.reasons } : {}),
      counts: { definite: classification.definite.length, possible: classification.possible.length, visited },
      complete: complete && more === 0,
      truncation,
      ...(more > 0 ? { more } : {}),
      ...(sampled.warnings.length > 0 ? { warnings: sampled.warnings } : {}),
      matches,
    };
  },
  summarize(input, output) {
    return {
      by: selectorKeys(input),
      scoped: input.within !== undefined,
      ...(output
        ? { complete: output.complete, definite: output.counts.definite, outcome: output.outcome, visited: output.counts.visited }
        : {}),
    };
  },
});
