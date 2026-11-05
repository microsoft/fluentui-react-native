import { randomUUID } from 'node:crypto';

import type { OperationCurrentStory, OperationStories } from '../operations/runtime.js';
import { WebDriverError } from '../protocol/errors.js';
import { attachFailureEffect, readFailureEffect } from '../protocol/settlement.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { StoryOrchestrator, StoryReadyResult, StorySelectionRequest } from '../storybook.js';
import type { DesktopSession, SessionManager } from './SessionManager.js';

export type StoryChange = 'reset' | 'select';

const markerPollMs = 25;

/**
 * Selects or resets a story and waits until the native story root shows it. The preview region expires first and the
 * session forgets its story until the change is confirmed. An uncertain failure quarantines the target: a delayed
 * remote render must not race a subsequent selection or input.
 */
export async function changeStory(
  session: DesktopSession,
  sessions: SessionManager,
  change: StoryChange,
  request: StorySelectionRequest,
): Promise<{ result: StoryReadyResult; verified: boolean }> {
  const orchestrator = requireOrchestrator(session);
  return sessions.runMutation(session, 'Changing Storybook context', async () => {
    const deadline = Date.now() + session.desktopTimeouts.storyRender;
    sessions.invalidatePreview(session);
    session.story = null;
    try {
      const result = await withCommandTimeout(
        () => (change === 'reset' ? orchestrator.resetStory(request) : orchestrator.selectStory(request)),
        remainingTime(deadline),
        'Changing Storybook context',
        { signal: session.commandAbortController.signal },
      );
      const verified = await verifyStoryMarker(session, result, deadline);
      session.story = result;
      return { result, verified };
    } catch (error) {
      // Runtime failures can contain application text; settlement records must contain only a fixed description.
      throw attachFailureEffect(
        new WebDriverError(error instanceof WebDriverError ? error.code : 'unknown error', 'Storybook context did not settle.'),
        readFailureEffect(error),
      );
    }
  });
}

/** The operation layer's view of the session's stories, or undefined when the target renders none. */
export function createOperationStories(
  session: DesktopSession,
  sessions: SessionManager,
  signal: AbortSignal,
): OperationStories | undefined {
  const orchestrator = session.target.storyOrchestrator;
  if (!orchestrator) {
    return undefined;
  }
  const requestSignal = () => AbortSignal.any([signal, session.commandAbortController.signal]);
  return {
    async catalog(callSignal) {
      const manifest = await withCommandTimeout(
        () => orchestrator.getManifest(),
        session.desktopTimeouts.nativeCommand,
        'Reading the Storybook manifest',
        { signal: AbortSignal.any([callSignal, requestSignal()]) },
      );
      return manifest.entries;
    },
    current: (callSignal) => readCurrentStory(session, sessions, AbortSignal.any([callSignal, requestSignal()])),
    async change(change, storyId) {
      const { verified } = await changeStory(session, sessions, change, { requestId: randomUUID(), runId: randomUUID(), storyId });
      return { storyId, verification: verified ? 'marker' : 'none' };
    },
  };
}

/**
 * Reads the selected story and checks it against the rendered story root. Another client, such as the Storybook UI,
 * can change the story without this session: a root that shows a different story proves it, so the session forgets
 * its story and expires the preview. A root it cannot find proves nothing, because the current window may be another.
 */
async function readCurrentStory(session: DesktopSession, sessions: SessionManager, signal: AbortSignal): Promise<OperationCurrentStory> {
  const story = session.story;
  if (!story) {
    return {};
  }
  const testId = session.target.storyRootTestId;
  if (!testId) {
    return { story: { storyId: story.storyId, verification: 'none' } };
  }
  const markers = session.currentWindowId ? await readMarkers(session, testId, signal) : [];
  if (markers.some((marker) => matchesStoryMarker(marker, story))) {
    return { story: { storyId: story.storyId, verification: 'marker' } };
  }
  if (markers.some((marker) => parseStoryMarker(marker) !== undefined) && session.story === story) {
    sessions.invalidatePreview(session);
    session.story = null;
    return { changed: true };
  }
  return { story: { storyId: story.storyId, verification: 'unconfirmed' } };
}

/** Polls the story root until it shows `expected`. Returns false when the target has no native story root. */
async function verifyStoryMarker(session: DesktopSession, expected: StoryReadyResult, deadline: number): Promise<boolean> {
  const testId = session.target.storyRootTestId;
  if (!testId) {
    return false;
  }
  do {
    const markers = await readMarkers(session, testId, session.commandAbortController.signal);
    if (markers.some((marker) => matchesStoryMarker(marker, expected))) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, markerPollMs));
  } while (Date.now() <= deadline);
  throw new WebDriverError('timeout', `The native Storybook marker did not confirm story "${expected.storyId}" run "${expected.runId}".`);
}

async function readMarkers(session: DesktopSession, testId: string, signal: AbortSignal): Promise<string[]> {
  const matches = await withCommandTimeout(
    (commandSignal) =>
      session.target.host.find({ windowId: session.currentWindowId }, { strategy: 'accessibility id', value: testId }, commandSignal),
    session.desktopTimeouts.nativeCommand,
    'Finding the native Storybook story marker',
    { signal },
  );
  return matches.flatMap((marker) => {
    const value = marker.name ?? marker.value ?? marker.text;
    return value ? [value] : [];
  });
}

function parseStoryMarker(value: string): Record<string, unknown> | undefined {
  try {
    const marker: unknown = JSON.parse(value);
    return typeof marker === 'object' && marker !== null && typeof (marker as { storyId?: unknown }).storyId === 'string'
      ? (marker as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function matchesStoryMarker(value: string, expected: StoryReadyResult): boolean {
  const marker = parseStoryMarker(value);
  return (
    marker !== undefined &&
    marker.storyId === expected.storyId &&
    marker.runId === expected.runId &&
    marker.previewGeneration === expected.previewGeneration
  );
}

function requireOrchestrator(session: DesktopSession): StoryOrchestrator {
  const orchestrator = session.target.storyOrchestrator;
  if (!orchestrator) {
    throw new WebDriverError('unsupported operation', `Target "${session.target.id}" does not provide Storybook orchestration.`);
  }
  return orchestrator;
}

function remainingTime(deadline: number): number {
  return Math.max(1, deadline - Date.now());
}
