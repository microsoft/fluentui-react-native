import type { NativeObservation, NativeObservedNode, NativeObserveFact } from '../host/types.js';
import { indexParents, inDocumentOrder } from './tree.js';

/**
 * What `find` matches on. `role` and the `...Contains` forms ignore case; `name`, `automationId`, and `text` compare
 * exactly. A node that does not report a field fails every predicate on it, so text a provider withholds, such as a
 * secure field's, never matches and a search cannot be used to probe it. `text` is the sample's `text` fact, not
 * `value`.
 */
export type FindPredicates = {
  automationId?: string;
  name?: string;
  nameContains?: string;
  role?: string;
  text?: string;
  textContains?: string;
};

/** `possible` means a field was cut to its budget and the cut part could still decide the match. */
export type Verdict = 'no' | 'possible' | 'yes';

export type FindOutcome = 'inconclusive' | 'multiple' | 'none' | 'unique';

export type InconclusiveReason = 'clipped' | 'incomplete' | 'unsupported-fact';

export type FindClassification = {
  /** Nodes that definitely match, in document order. */
  definite: number[];
  outcome: FindOutcome;
  /** Nodes that might match because a field was cut, in document order. */
  possible: number[];
  reasons: InconclusiveReason[];
};

export function hasPredicate(predicates: FindPredicates): boolean {
  return Object.values(predicates).some((value) => value !== undefined);
}

/** The native facts a search must read to evaluate its predicates; name, role, and automation id are always read. */
export function factsNeeded(predicates: FindPredicates): NativeObserveFact[] {
  return predicates.text !== undefined || predicates.textContains !== undefined ? ['text'] : [];
}

function exactVerdict(value: string | undefined, clipped: boolean, needle: string): Verdict {
  if (value === undefined) {
    return 'no';
  }
  if (!clipped) {
    return value === needle ? 'yes' : 'no';
  }
  // The real string is longer than the part kept, so it can equal the needle only by continuing past it.
  return needle.length > value.length && needle.startsWith(value) ? 'possible' : 'no';
}

function containsVerdict(value: string | undefined, clipped: boolean, needleLower: string): Verdict {
  if (value === undefined) {
    return 'no';
  }
  if (value.toLowerCase().includes(needleLower)) {
    return 'yes';
  }
  return clipped ? 'possible' : 'no';
}

function combine(verdicts: readonly Verdict[]): Verdict {
  if (verdicts.includes('no')) {
    return 'no';
  }
  return verdicts.includes('possible') ? 'possible' : 'yes';
}

export type CompiledPredicates = {
  automationId?: string;
  name?: string;
  nameContainsLower?: string;
  roleLower?: string;
  text?: string;
  textContainsLower?: string;
};

export function compilePredicates(predicates: FindPredicates): CompiledPredicates {
  return {
    automationId: predicates.automationId,
    name: predicates.name,
    nameContainsLower: predicates.nameContains?.toLowerCase(),
    roleLower: predicates.role?.toLowerCase(),
    text: predicates.text,
    textContainsLower: predicates.textContains?.toLowerCase(),
  };
}

/** Evaluates one node against every predicate. Any definite miss is a miss; a cut field can leave a match open. */
export function verdictFor(node: NativeObservedNode, predicates: CompiledPredicates): Verdict {
  const clipped = new Set(node.clipped);
  const verdicts: Verdict[] = [];
  if (predicates.roleLower !== undefined) {
    verdicts.push(node.role.toLowerCase() === predicates.roleLower ? 'yes' : 'no');
  }
  if (predicates.name !== undefined) {
    verdicts.push(exactVerdict(node.name, clipped.has('name'), predicates.name));
  }
  if (predicates.nameContainsLower !== undefined) {
    verdicts.push(containsVerdict(node.name, clipped.has('name'), predicates.nameContainsLower));
  }
  if (predicates.automationId !== undefined) {
    verdicts.push(exactVerdict(node.automationId, clipped.has('automationId'), predicates.automationId));
  }
  if (predicates.text !== undefined) {
    verdicts.push(exactVerdict(node.text, clipped.has('text'), predicates.text));
  }
  if (predicates.textContainsLower !== undefined) {
    verdicts.push(containsVerdict(node.text, clipped.has('text'), predicates.textContainsLower));
  }
  return combine(verdicts);
}

/**
 * Decides whether a sample proves how many elements match. Uniqueness is claimed only when the whole subtree was
 * observed and no cut field could hide a second match; two definite matches prove `multiple` even from a partial
 * sample. Anything else is `inconclusive`, with the reasons, rather than a guess an agent would act on.
 *
 * `includeRoot` is false when the search is inside an element, which is the root of the sample but not a result.
 */
export function classify(observation: NativeObservation, predicates: FindPredicates, includeRoot: boolean): FindClassification {
  const unsupported = factsNeeded(predicates).filter((fact) => observation.unsupportedFacts.includes(fact));
  if (unsupported.length > 0) {
    return { definite: [], outcome: 'inconclusive', possible: [], reasons: ['unsupported-fact'] };
  }
  const compiled = compilePredicates(predicates);
  const definite: number[] = [];
  const possible: number[] = [];
  for (const [index, node] of observation.nodes.entries()) {
    if (index === 0 && !includeRoot) {
      continue;
    }
    const verdict = verdictFor(node, compiled);
    if (verdict === 'yes') {
      definite.push(index);
    } else if (verdict === 'possible') {
      possible.push(index);
    }
  }
  const parents = indexParents(observation.nodes);
  const ordered = { definite: inDocumentOrder(definite, parents), possible: inDocumentOrder(possible, parents) };

  if (ordered.definite.length >= 2) {
    return { ...ordered, outcome: 'multiple', reasons: [] };
  }
  if (observation.complete && ordered.possible.length === 0) {
    return { ...ordered, outcome: ordered.definite.length === 1 ? 'unique' : 'none', reasons: [] };
  }
  const reasons: InconclusiveReason[] = [];
  if (!observation.complete) {
    reasons.push('incomplete');
  }
  if (ordered.possible.length > 0) {
    reasons.push('clipped');
  }
  return { ...ordered, outcome: 'inconclusive', reasons };
}
