import { z } from 'zod';

import { searchBudgets } from './limits.js';
import { classify, factsNeeded, hasPredicate } from './match.js';
import type { FindClassification, FindPredicates } from './match.js';
import { assertContentAllowed, requestsContent } from './policy.js';
import { fingerprintOf } from './proofs.js';
import type { UniquenessProof } from './proofs.js';
import type { OperationRuntime } from './runtime.js';
import { sampleTree } from './sampling.js';
import type { Sampled, SamplingContext, WalkLimits } from './sampling.js';
import { referenceSchema } from './shapes.js';

const predicate = z.string().min(1).max(256);

/** The fields that pick elements out of a window, shared by `find` and by every operation that accepts a selector. */
export const selectorFields = {
  automationId: predicate.optional().describe('Exact automation id.'),
  name: predicate.optional().describe('Exact accessible name. Not with nameContains.'),
  nameContains: predicate.optional().describe('Part of the accessible name, ignoring case.'),
  role: predicate.optional().describe('Role, ignoring case, as shown by observe.'),
  text: predicate.optional().describe('Exact displayed text. Not with textContains.'),
  textContains: predicate.optional().describe('Part of the displayed text, ignoring case.'),
  within: referenceSchema.optional().describe('An element reference to search inside, instead of the whole window.'),
};

export type Selector = FindPredicates & { within?: string };

export const selectorRequirement = 'At least one of role, name, nameContains, automationId, text, or textContains is required.';

export function predicatesOf(input: FindPredicates): FindPredicates {
  return {
    automationId: input.automationId,
    name: input.name,
    nameContains: input.nameContains,
    role: input.role,
    text: input.text,
    textContains: input.textContains,
  };
}

/** True when the selector compares text an application displays, which the operator's content policy governs. */
export function selectorNeedsContent(selector: FindPredicates): boolean {
  return requestsContent(factsNeeded(predicatesOf(selector)));
}

/**
 * Names the predicates a selector gives, for a journal summary. Predicate values can quote what an application
 * displayed or what a caller typed, so only their names are kept.
 */
export function selectorKeys(selector: FindPredicates): string {
  return Object.entries(predicatesOf(selector))
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key)
    .join(',');
}

/** Adds the rules every selector obeys: at least one predicate, and never the exact and partial form of one field together. */
export function withSelectorRules<S extends z.ZodType<Selector>>(schema: S): S {
  return schema
    .refine((input: Selector) => hasPredicate(predicatesOf(input)), {
      message: 'Give at least one of role, name, nameContains, automationId, text, or textContains.',
    })
    .refine((input: Selector) => input.name === undefined || input.nameContains === undefined, {
      message: 'Give name or nameContains, not both.',
    })
    .refine((input: Selector) => input.text === undefined || input.textContains === undefined, {
      message: 'Give text or textContains, not both.',
    });
}

/**
 * A selector nested in another operation's input. Its fields mean what `find` documents, so they are described once
 * here rather than repeated in every catalog entry that accepts one.
 */
export const selectorSchema = withSelectorRules(
  z.strictObject({
    automationId: predicate.optional(),
    name: predicate.optional(),
    nameContains: predicate.optional(),
    role: predicate.optional(),
    text: predicate.optional(),
    textContains: predicate.optional(),
    within: referenceSchema.optional(),
  }),
).describe('Fields as in find; at least one of role, name, nameContains, automationId, text, or textContains.');

/** The walk an operation's selector search uses: the same as `find` with its default budgets. */
const defaultSearchLimits: WalkLimits = {
  deadlineMs: searchBudgets.deadlineMs.default,
  maxDepth: searchBudgets.maxDepth.default,
  maxStringLength: searchBudgets.maxStringLength.default,
  maxVisited: searchBudgets.maxVisited.default,
};

export type SelectorSearch = {
  classification: FindClassification;
  complete: boolean;
  /**
   * The proof of the unique match, whose reference is issued, when the caller asked for it and the search proved the
   * match unique. The caller records it, so a search repeated while waiting does not push older proofs out.
   */
  proof?: UniquenessProof;
  visited: number;
};

/**
 * Searches for a selector's matches with `find`'s rules, and only `find`'s rules: uniqueness is proven by a complete
 * search, never assumed. When `issueUnique` is set and the match is unique, its reference is issued and the result
 * carries the proof, which `act` accepts exactly as it accepts a `find` result once the caller records it.
 */
export async function searchSelector<T = SelectorSearch>(
  runtime: OperationRuntime,
  selector: Selector,
  options: {
    issueUnique: boolean;
    limits?: WalkLimits;
    /** Extra work on the sample while its records are still held, such as describing matches. */
    use?: (context: SamplingContext, search: SelectorSearch) => T;
  },
): Promise<Sampled<SelectorSearch & { extra?: T }>> {
  const predicates = predicatesOf(selector);
  const facts = factsNeeded(predicates);
  assertContentAllowed(runtime, requestsContent(facts));
  let proven: Omit<UniquenessProof, 'sample'> | undefined;
  const sampled = await sampleTree(
    runtime,
    { facts, limits: options.limits ?? defaultSearchLimits, within: selector.within },
    (context) => {
      const { observation } = context;
      const classification = classify(observation, predicates, selector.within === undefined);
      const node = classification.outcome === 'unique' ? observation.nodes[classification.definite[0]] : undefined;
      if (node && options.issueUnique) {
        proven = { fingerprint: fingerprintOf(node), nativeId: node.id, reference: context.issue(node) };
      }
      const search: SelectorSearch = { classification, complete: observation.complete, visited: observation.nodes.length };
      return options.use ? { ...search, extra: options.use(context, search) } : search;
    },
  );
  return proven ? { ...sampled, value: { ...sampled.value, proof: { ...proven, sample: sampled.sample.id } } } : sampled;
}
