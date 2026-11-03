import { z } from 'zod';

import type { OperationBudget } from './limits.js';
import { observeFacts } from './projection.js';

/** An integer budget with its range and default, so the schema and the service read the same limits. */
export function budgetField(budget: OperationBudget) {
  return z.int().min(budget.floor).max(budget.ceiling).default(budget.default);
}

/**
 * Output shapes that more than one operation returns. Outputs are strict here so tests catch a stray field, and the
 * catalog opens them (`catalog.ts`): a result may gain optional fields within a schema version, so consumers must
 * ignore fields they do not know.
 */

export const factSchema = z.enum(observeFacts);

/** An element reference as callers send it. The reference table owns the grammar; this only bounds the input. */
export const referenceSchema = z.string().min(1).max(32);

export const sampleSchema = z.strictObject({
  capturedAt: z.string().describe('ISO time the provider answered.'),
  elapsedMs: z.number().describe('Provider time spent walking the tree.'),
  epoch: z.strictObject({
    incarnation: z.number().describe('Changes when the application restarts; earlier references stop resolving.'),
    region: z.number().describe('Changes when the replaceable preview region is swapped; references into it expire.'),
  }),
  id: z.string().describe('Names this sample. Later operations that act on what it showed cite it.'),
  root: z.string().optional().describe('Reference of the element the sample is rooted at.'),
  scope: z.enum(['element', 'window']).describe('`element` when the observation was inside a reference.'),
  window: z.string(),
});

export const truncationSchema = z.strictObject({
  limit: z.number().optional(),
  omitted: z.number().optional().describe('Matching elements the size limits left out.'),
  reason: z.enum(['bytes', 'deadline', 'depth', 'maxBytes', 'maxNodes', 'references', 'unreadable', 'visited']),
  unvisited: z.number().optional().describe('At least this many elements exist that were not visited.'),
});

export const warningSchema = z.strictObject({
  code: z.literal('release-failed').describe('Provider records could not be released; they are retried next time.'),
  pending: z.number(),
});

export type OperationWarning = z.infer<typeof warningSchema>;
export type SampleInfo = z.infer<typeof sampleSchema>;
export type Truncation = z.infer<typeof truncationSchema>;
