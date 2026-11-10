import { z } from 'zod';

import type { OperationBudget } from './limits.js';
import { observeFacts } from './projection.js';
import { maxReferenceLength, parseReference } from './refs.js';

/** An integer budget with its range and default, so the schema and the service read the same limits. */
export function budgetField(budget: OperationBudget) {
  return z.int().min(budget.floor).max(budget.ceiling).default(budget.default);
}

/**
 * Output shapes that more than one operation returns. Outputs are strict here so tests catch a stray field, and the
 * catalog opens them (`registry.ts`): a result may gain optional fields within a schema version, so consumers must
 * ignore fields they do not know.
 */

export const factSchema = z.enum(observeFacts);

/**
 * An element reference as callers send it. The grammar is checked here, so text that is not a reference never reaches
 * an operation, its journal entry, or an error message. The failure keeps the reason `ref-malformed`, which an agent
 * can tell apart from a reference that was well formed and has expired.
 */
export const referenceSchema = z
  .string()
  .min(1)
  .max(maxReferenceLength)
  .superRefine((value, context) => {
    if (parseReference(value) === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'Not an element reference. Pass one exactly as a result showed it.',
        params: { reason: 'ref-malformed' },
      });
    }
  });

/** A sample id as callers cite it: `o` and the sample's sequence number. */
export const sampleIdSchema = z.string().regex(/^o[1-9][0-9]{0,9}$/, 'A sample id is "o" followed by a number, as a result showed it.');

export const sampleSchema = z.strictObject({
  capturedAt: z.string().describe('ISO time the provider answered.'),
  elapsedMs: z.number().describe('Provider time spent walking the tree.'),
  epoch: z.strictObject({
    incarnation: z.number().describe('Session-local reference generation. An application restart requires a new session.'),
    region: z.number().describe('Changes when the replaceable preview region is swapped; references into it expire.'),
  }),
  id: z.string().describe('Names this sample. Later operations that act on what it showed cite it.'),
  root: z.string().optional().describe('Reference of the element the sample is rooted at.'),
  scope: z.enum(['element', 'window']).describe('`element` when the observation was inside a reference.'),
  window: z.string(),
});

export const truncationSchema = z.strictObject({
  limit: z.number().optional(),
  omitted: z.number().optional().describe('Items the size or page limits left out, or the journal no longer holds.'),
  reason: z.enum(['bytes', 'deadline', 'depth', 'dropped', 'limit', 'maxBytes', 'maxNodes', 'references', 'unreadable', 'visited']),
  unvisited: z.number().optional().describe('At least this many elements exist that were not visited.'),
});

export const warningSchema = z.strictObject({
  code: z.literal('release-failed').describe('Provider records could not be released; they are retried next time.'),
  pending: z.number(),
});

export type OperationWarning = z.infer<typeof warningSchema>;
export type SampleInfo = z.infer<typeof sampleSchema>;
export type Truncation = z.infer<typeof truncationSchema>;
