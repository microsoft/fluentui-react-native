import { z } from 'zod';

import { toWebDriverError } from '../protocol/errors.js';
import type { WebDriverError } from '../protocol/errors.js';
import { attachFailureEffect, attachMutationReport, createMutationReport } from '../protocol/settlement.js';
import { asRejection, assertNotQuarantined, rejection } from './act.js';
import { operationError } from './envelope.js';
import { storyPage, storyTextLimits } from './limits.js';
import type { OperationAvailability, OperationCapabilities, OperationRuntime, OperationStories, OperationStoryEntry } from './runtime.js';
import { registerOperation } from './runtime.js';
import { budgetField, truncationSchema } from './shapes.js';
import { clipText, neutralizeText, safeToken } from './text.js';

function requireStoryCapability(capabilities: OperationCapabilities): OperationAvailability {
  return capabilities.stories ? { available: true } : { available: false, reason: 'stories-unsupported' };
}

function requireStories(runtime: OperationRuntime): OperationStories {
  if (!runtime.stories) {
    throw operationError('unsupported operation', 'stories-unsupported', 'This target does not render Storybook stories.');
  }
  return runtime.stories;
}

const storiesInput = z.strictObject({
  filter: z
    .string()
    .min(1)
    .max(storyTextLimits.filter)
    .optional()
    .describe('Only stories whose id, title, or name contains this, ignoring case.'),
  limit: budgetField(storyPage).describe('Most stories returned.'),
  offset: z.int().min(0).max(1_000_000).default(0).describe('Pass next from the previous page.'),
});

const currentStorySchema = z.strictObject({
  storyId: z.string(),
  verification: z
    .enum(['marker', 'none', 'unconfirmed'])
    .describe('marker: the story root confirmed it. unconfirmed: no root in this window. none: the target has no root.'),
});

const storiesOutput = z.strictObject({
  changed: z.literal(true).optional().describe('Another client changed the rendered story, so preview references expired.'),
  current: currentStorySchema.optional().describe('The story this session selected.'),
  complete: z.boolean().describe('True when no matching story after offset was left out; when false, see truncation and next.'),
  entries: z.array(
    z.strictObject({
      clipped: z
        .array(z.enum(['id', 'name', 'tags', 'title']))
        .optional()
        .describe('Fields shown cut. A cut id is not one story accepts.'),
      id: z.string().describe('Pass to story.'),
      name: z.string(),
      tags: z.array(z.string()).optional(),
      title: z.string(),
    }),
  ),
  matched: z.number().describe('Stories that match the filter.'),
  next: z.number().optional().describe('Pass as offset to read the stories that follow.'),
  total: z.number().describe('Stories in the catalog.'),
  truncation: z.array(truncationSchema).describe('Why matching stories after offset were left out; empty when complete is true.'),
});

export type StoriesInput = z.input<typeof storiesInput>;
export type StoriesResult = z.infer<typeof storiesOutput>;

function catalogText(text: string, maxLength: number): { clipped: boolean; text: string } {
  const cut = clipText(neutralizeText(text), maxLength);
  return { clipped: cut.clipped, text: cut.clipped ? `${cut.text}…` : cut.text };
}

function describeEntry(entry: OperationStoryEntry): StoriesResult['entries'][number] {
  const id = catalogText(entry.id, storyTextLimits.id);
  const name = catalogText(entry.name, storyTextLimits.name);
  const title = catalogText(entry.title, storyTextLimits.name);
  const tags = entry.tags.slice(0, storyTextLimits.tags).map((tag) => catalogText(tag, storyTextLimits.tag));
  const clipped = [
    ...(id.clipped ? (['id'] as const) : []),
    ...(name.clipped ? (['name'] as const) : []),
    ...(tags.some((tag) => tag.clipped) || entry.tags.length > tags.length ? (['tags'] as const) : []),
    ...(title.clipped ? (['title'] as const) : []),
  ];
  return {
    ...(clipped.length > 0 ? { clipped } : {}),
    id: id.text,
    name: name.text,
    ...(tags.length > 0 ? { tags: tags.map((tag) => tag.text) } : {}),
    title: title.text,
  };
}

function matchesFilter(entry: OperationStoryEntry, needle: string): boolean {
  return [entry.id, entry.title, entry.name].some((text) => text.toLowerCase().includes(needle));
}

/**
 * Story catalogs come from the build, not from what the application displays, so the content policy does not withhold
 * them. The filter is caller text and stays out of the journal.
 */
export const storiesOperation = registerOperation({
  availability: requireStoryCapability,
  effect: 'read',
  input: storiesInput,
  name: 'stories',
  output: storiesOutput,
  summary: "Lists the target's Storybook stories and the story this session selected, checked against what is rendered.",
  async run(input, runtime) {
    const stories = requireStories(runtime);
    const current = await stories.current(runtime.signal);
    const catalog = await stories.catalog(runtime.signal);
    const needle = input.filter?.toLowerCase();
    const matching = needle === undefined ? catalog : catalog.filter((entry) => matchesFilter(entry, needle));
    const page = matching.slice(input.offset, input.offset + input.limit);
    const end = input.offset + page.length;
    const more = page.length > 0 && end < matching.length;
    return {
      ...(current.changed ? { changed: true as const } : {}),
      complete: !more,
      ...(current.story ? { current: current.story } : {}),
      entries: page.map(describeEntry),
      matched: matching.length,
      ...(more ? { next: end } : {}),
      total: catalog.length,
      truncation: more ? [{ limit: input.limit, omitted: matching.length - end, reason: 'limit' as const }] : [],
    };
  },
  summarize(input, output) {
    return {
      filtered: input.filter !== undefined,
      offset: input.offset,
      ...(output ? { matched: output.matched, returned: output.entries.length, ...(output.changed ? { changed: true } : {}) } : {}),
    };
  },
});

const storyInput = z.strictObject({
  action: z.enum(['select', 'reset']).default('select').describe('reset renders the story again from its initial state.'),
  storyId: z.string().min(1).max(storyTextLimits.id).describe('A story id as stories listed it.'),
});

const storyOutput = z.strictObject({
  action: z.enum(['reset', 'select']),
  disposition: z.literal('applied'),
  region: z.number().describe('The preview region now; references from earlier regions expired.'),
  storyId: z.string(),
  verification: z.enum(['marker', 'none']).describe('marker: the story root confirmed it. none: the target cannot confirm it.'),
});

export type StoryInput = z.input<typeof storyInput>;
export type StoryResult = z.infer<typeof storyOutput>;

/**
 * A change that was dispatched and not confirmed. The preview may show the old story, the new one, or a render error,
 * so the result is indeterminate. The runtime fences uncertain context mutations with the target quarantine.
 * The words are fixed: the cause can quote a story's render error, and an agent reads errors as instructions.
 */
function storyNotReady(runtime: OperationRuntime, error: unknown): WebDriverError {
  const converted = toWebDriverError(error);
  if (converted.data?.reason === 'bridge-unavailable' || converted.data?.reason === 'relaunch-required') {
    const report = createMutationReport(error, runtime.quarantined());
    attachFailureEffect(converted, report.effect);
    return attachMutationReport(converted, report);
  }
  const failure = operationError(
    toWebDriverError(error).code === 'timeout' ? 'timeout' : 'unknown error',
    'story-not-ready',
    'The story did not confirm that it rendered, so what the preview shows is unknown. Check quarantine status before further mutations.',
  );
  const report = createMutationReport(error, runtime.quarantined());
  attachFailureEffect(failure, report.effect);
  return attachMutationReport(failure, report);
}

export const storyOperation = registerOperation({
  availability: requireStoryCapability,
  effect: 'mutate',
  input: storyInput,
  name: 'story',
  output: storyOutput,
  summary:
    'Selects or resets a Storybook story and waits until it renders, expiring preview references. Repeating a requestId returns the first outcome.',
  async run(input, runtime) {
    const stories = requireStories(runtime);
    assertNotQuarantined(runtime);
    let known: boolean;
    try {
      known = (await stories.catalog(runtime.signal)).some(({ id }) => id === input.storyId);
    } catch (error) {
      throw asRejection(runtime, error);
    }
    if (!known) {
      throw rejection(runtime, 'invalid argument', 'story-unknown', 'The catalog has no story with that id. List them with stories.');
    }
    if (runtime.signal.aborted) {
      throw rejection(runtime, 'unknown error', 'cancelled', 'The request was cancelled before anything was dispatched.');
    }
    assertNotQuarantined(runtime);
    let changed: Awaited<ReturnType<OperationStories['change']>>;
    try {
      changed = await stories.change(input.action, input.storyId);
    } catch (error) {
      throw storyNotReady(runtime, error);
    }
    return {
      action: input.action,
      disposition: 'applied' as const,
      region: runtime.previewGeneration(),
      storyId: changed.storyId,
      verification: changed.verification,
    };
  },
  summarize(input, output) {
    return {
      action: input.action,
      ...(output ? { storyId: safeToken(output.storyId, 128), verification: output.verification } : {}),
    };
  },
});
