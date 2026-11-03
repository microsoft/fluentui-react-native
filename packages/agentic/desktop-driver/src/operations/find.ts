import { z } from 'zod';

import type { NativeObservation } from '../host/types.js';
import { searchBudgets } from './limits.js';
import { classify, factsNeeded, hasPredicate } from './match.js';
import type { FindPredicates } from './match.js';
import { assertContentAllowed, requestsContent, requireBoundedObservation } from './policy.js';
import { registerOperation } from './runtime.js';
import { sampleTree } from './sampling.js';
import { budgetField, referenceSchema, sampleSchema, truncationSchema, warningSchema } from './shapes.js';
import { clipText, neutralizeText, quoteText, safeToken } from './text.js';
import { indexParents } from './tree.js';

/** How much of a match's name and of each ancestor's name a result keeps. Longer names are cut and marked. */
const matchNameLength = 120;
const pathNameLength = 48;
const pathDepth = 3;

const predicate = z.string().min(1).max(256);

const findInput = z
  .strictObject({
    automationId: predicate.optional().describe('Exact automation id.'),
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
    name: predicate.optional().describe('Exact accessible name. Not with nameContains.'),
    nameContains: predicate.optional().describe('Part of the accessible name, ignoring case.'),
    role: predicate.optional().describe('Role, ignoring case, as shown by observe.'),
    text: predicate.optional().describe('Exact displayed text. Not with textContains.'),
    textContains: predicate.optional().describe('Part of the displayed text, ignoring case.'),
    within: referenceSchema.optional().describe('An element reference to search inside, instead of the whole window.'),
  })
  .refine((input) => hasPredicate(predicatesOf(input)), {
    message: 'Give at least one of role, name, nameContains, automationId, text, or textContains.',
  })
  .refine((input) => input.name === undefined || input.nameContains === undefined, { message: 'Give name or nameContains, not both.' })
  .refine((input) => input.text === undefined || input.textContains === undefined, { message: 'Give text or textContains, not both.' })
  .describe('At least one of role, name, nameContains, automationId, text, or textContains is required.');

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
  complete: z.boolean().describe('True when the search read everything it could reach.'),
  truncation: z.array(truncationSchema),
  more: z.number().optional().describe('Candidates beyond limit that were not returned.'),
  warnings: z.array(warningSchema).optional(),
  matches: z.array(matchSchema).describe('Definite matches first, then possible ones, each in document order.'),
});

export type FindResult = z.infer<typeof findOutput>;
type Match = FindResult['matches'][number];

function predicatesOf(input: FindPredicates): FindPredicates {
  return {
    automationId: input.automationId,
    name: input.name,
    nameContains: input.nameContains,
    role: input.role,
    text: input.text,
    textContains: input.textContains,
  };
}

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
    const predicates = predicatesOf(input);
    const facts = factsNeeded(predicates);
    assertContentAllowed(runtime, requestsContent(facts));
    const { budget } = input;
    const sampled = await sampleTree(
      runtime,
      {
        facts,
        limits: {
          deadlineMs: budget.deadlineMs,
          maxDepth: budget.maxDepth,
          maxStringLength: budget.maxStringLength,
          maxVisited: budget.maxVisited,
        },
        within: input.within,
      },
      ({ issue, observation }) => {
        const classification = classify(observation, predicates, input.within === undefined);
        const parents = indexParents(observation.nodes);
        const candidates = [
          ...classification.definite.map((index) => ({ index, match: 'definite' as const })),
          ...classification.possible.map((index) => ({ index, match: 'possible' as const })),
        ];
        const returned = candidates.slice(0, input.limit);
        return {
          classification,
          complete: observation.complete,
          matches: returned.map(({ index, match }) => describeMatch(observation, parents, index, match, issue(observation.nodes[index]))),
          more: candidates.length - returned.length,
          truncation: observation.truncation.map((entry) => ({ ...entry })),
          visited: observation.nodes.length,
        };
      },
    );
    const { classification, complete, matches, more, truncation, visited } = sampled.value;
    return {
      sample: sampled.sample,
      outcome: classification.outcome,
      ...(classification.reasons.length > 0 ? { reasons: classification.reasons } : {}),
      counts: { definite: classification.definite.length, possible: classification.possible.length, visited },
      complete,
      truncation,
      ...(more > 0 ? { more } : {}),
      ...(sampled.warnings.length > 0 ? { warnings: sampled.warnings } : {}),
      matches,
    };
  },
  summarize(input, output) {
    // Predicate values can quote what an application displayed or what a caller typed, so only their names are kept.
    const given = Object.entries(predicatesOf(input))
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key)
      .join(',');
    return {
      by: given,
      scoped: input.within !== undefined,
      ...(output
        ? { complete: output.complete, definite: output.counts.definite, outcome: output.outcome, visited: output.counts.visited }
        : {}),
    };
  },
});
