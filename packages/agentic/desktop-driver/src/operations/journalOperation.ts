import { z } from 'zod';

import { journalPage } from './limits.js';
import { registerOperation } from './runtime.js';
import { budgetField, truncationSchema } from './shapes.js';

const journalInput = z.strictObject({
  after: z
    .int()
    .min(0)
    .max(1_000_000_000)
    .default(0)
    .describe('Return entries after this sequence number; pass next from the previous page.'),
  limit: budgetField(journalPage).describe('Most entries returned.'),
});

const entrySchema = z.strictObject({
  sequence: z.number(),
  at: z.string(),
  operation: z.string(),
  requestId: z.string(),
  effect: z.enum(['mutate', 'read']),
  outcome: z.enum(['error', 'ok']),
  durationMs: z.number(),
  error: z.strictObject({ code: z.string(), reason: z.string().optional() }).optional(),
  summary: z.record(z.string(), z.union([z.boolean(), z.number(), z.string(), z.null()])).optional(),
});

const journalOutput = z.strictObject({
  complete: z.boolean().describe('True when the journal holds nothing after the cursor that this result left out.'),
  dropped: z.number().describe('Entries after the cursor that the journal no longer holds.'),
  next: z.number().optional().describe('Pass as after to read the entries that follow.'),
  entries: z.array(entrySchema),
  truncation: z.array(truncationSchema),
});

export type JournalInput = z.input<typeof journalInput>;
export type JournalResult = z.infer<typeof journalOutput>;

export const readJournalOperation = registerOperation({
  availability: () => ({ available: true }),
  effect: 'read',
  input: journalInput,
  journaled: false,
  name: 'journal',
  output: journalOutput,
  summary: 'Lists the operations this session ran, oldest first, without typed text or what applications displayed.',
  async run(input, runtime) {
    const page = runtime.state.journal.read({ after: input.after, limit: input.limit });
    const truncation: JournalResult['truncation'] = [
      ...(page.dropped > 0 ? [{ omitted: page.dropped, reason: 'dropped' as const }] : []),
      ...(page.next === undefined ? [] : [{ limit: input.limit, reason: 'limit' as const }]),
    ];
    return { ...page, complete: truncation.length === 0, truncation };
  },
  summarize() {
    return {};
  },
});
