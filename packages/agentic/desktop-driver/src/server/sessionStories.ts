import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

import type { OperationCurrentStory, OperationStories } from '../operations/runtime.js';
import { HostStaleError, WebDriverError } from '../protocol/errors.js';
import { attachFailureEffect, readFailureEffect } from '../protocol/settlement.js';
import { withCommandTimeout } from '../protocol/timeouts.js';
import type { StoryOrchestrator, StoryReadyResult, StorySelectionDiagnostics, StorySelectionRequest } from '../storybook.js';
import { matchesStoryMarker, parseStoryMarker, StoryBridgeUnavailableError } from '../storybook.js';
import type { DesktopSession, SessionManager } from './SessionManager.js';

export type StoryChange = 'reset' | 'select';

const markerPollMs = 25;
const unavailableContexts = new WeakSet<DesktopSession>();

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
    sessions.invalidatePreview(session);
    session.story = null;
    try {
      return await withCommandTimeout(
        async (signal) => {
          const diagnostics: StorySelectionDiagnostics = {};
          const context = { lifetimeId: session.id, signal, diagnostics };
          const result = await (change === 'reset'
            ? orchestrator.resetStory(request, context)
            : orchestrator.selectStory(request, context));
          if (
            result.storyId !== request.storyId ||
            result.runId !== request.runId ||
            (result.requestId !== undefined && result.requestId !== request.requestId)
          ) {
            throw new WebDriverError('unknown error', 'Storybook returned readiness for a different selection.');
          }
          const started = performance.now();
          const verified = await verifyStoryMarker(session, result, signal, diagnostics);
          diagnostics.nativeVerificationMs = performance.now() - started;
          signal.throwIfAborted();
          unavailableContexts.delete(session);
          session.story = result;
          const observations: NonNullable<StoryReadyResult['diagnostics']> = {};
          for (const key of [
            'preparationMs',
            'httpMs',
            'runtimeReadyMs',
            'nativeVerificationMs',
            'nativeMarkerPolls',
            'authenticatedHellos',
            'bridgeConnections',
          ] as const) {
            const value = diagnostics[key];
            if (typeof value === 'number' && Number.isFinite(value) && value >= 0) observations[key] = value;
          }
          const { processId, processStartedAt } = session.lease;
          if (
            Number.isSafeInteger(processId) &&
            processId! > 0 &&
            processStartedAt &&
            processStartedAt.length <= 64 &&
            Number.isFinite(Date.parse(processStartedAt))
          ) {
            observations.application = { processId: processId!, processStartedAt: new Date(processStartedAt).toISOString() };
          }
          return { result: { ...result, diagnostics: observations }, verified };
        },
        session.desktopTimeouts.storyRender,
        'Changing Storybook context',
        { signal: session.commandAbortController.signal },
      );
    } catch (error) {
      // Runtime failures can contain application text; settlement records must contain only a fixed description.
      throw attachFailureEffect(
        new WebDriverError(
          error instanceof WebDriverError ? error.code : 'unknown error',
          'Storybook context did not settle.',
          error instanceof StoryBridgeUnavailableError ? error.data : undefined,
        ),
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
        (signal) => orchestrator.getManifest({ lifetimeId: session.id, signal }),
        session.desktopTimeouts.nativeCommand,
        'Reading the Storybook manifest',
        { signal: AbortSignal.any([callSignal, requestSignal()]) },
      );
      return manifest.entries.map(({ id, name, tags, title }) => ({ id, name, tags, title }));
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
export async function readCurrentStory(
  session: DesktopSession,
  sessions: SessionManager,
  signal: AbortSignal,
): Promise<OperationCurrentStory> {
  const story = session.story;
  if (!story) {
    return unavailableContexts.has(session) ? { unavailable: true } : {};
  }
  const current = await withCommandTimeout(
    (signal) => requireOrchestrator(session).getCurrentStory({ lifetimeId: session.id, signal }),
    session.desktopTimeouts.nativeCommand,
    'Checking the Storybook context epoch',
    { signal },
  );
  if (!current || !matchesStoryMarker(JSON.stringify(current), story)) {
    unavailableContexts.add(session);
    sessions.invalidatePreview(session);
    session.story = null;
    return { changed: true };
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
    unavailableContexts.add(session);
    sessions.invalidatePreview(session);
    session.story = null;
    return { changed: true };
  }
  return { story: { storyId: story.storyId, verification: 'unconfirmed' } };
}

export async function assertStoryContext(session: DesktopSession, sessions: SessionManager): Promise<void> {
  const current = await readCurrentStory(session, sessions, session.commandAbortController.signal);
  if (current.changed || current.unavailable || current.story?.verification === 'unconfirmed') {
    throw attachFailureEffect(
      new WebDriverError('stale element reference', 'The Storybook preview context is stale.', {
        reason: 'story-context-stale',
      }),
      'none',
    );
  }
}

/** Polls the story root until it shows `expected`. Returns false when the target has no native story root. */
async function verifyStoryMarker(
  session: DesktopSession,
  expected: StoryReadyResult,
  signal: AbortSignal,
  diagnostics?: StorySelectionDiagnostics,
): Promise<boolean> {
  const testId = session.target.storyRootTestId;
  if (!testId) {
    if (expected.markerVersion === 1) {
      throw new WebDriverError('unknown error', 'Versioned Storybook readiness requires a native story-root marker.');
    }
    return false;
  }
  for (;;) {
    signal.throwIfAborted();
    if (diagnostics) diagnostics.nativeMarkerPolls = (diagnostics.nativeMarkerPolls ?? 0) + 1;
    const markers = await readMarkers(session, testId, signal);
    if (markers.some((marker) => matchesStoryMarker(marker, expected))) {
      return true;
    }
    await delay(markerPollMs, undefined, { signal });
  }
}

/**
 * Reads the story-root markers of the session. The root normally lives in the main window, and a session can be
 * working in another one, so the current window is searched first and then every other window the application has.
 */
async function readMarkers(session: DesktopSession, testId: string, signal: AbortSignal): Promise<string[]> {
  const findIn = async (windowId: string): Promise<string[]> => {
    const matches = await withCommandTimeout(
      (commandSignal) => session.target.host.find({ windowId }, { strategy: 'accessibility id', value: testId }, commandSignal),
      session.desktopTimeouts.nativeCommand,
      'Finding the native Storybook story marker',
      { signal },
    );
    return matches.flatMap((marker) => {
      const value = marker.name ?? marker.value ?? marker.text;
      return value ? [value] : [];
    });
  };
  const current = session.currentWindowId ? await findIn(session.currentWindowId) : [];
  if (current.length > 0) {
    return current;
  }
  const windows = await withCommandTimeout(
    (commandSignal) => session.target.host.windows(session.lease, commandSignal),
    session.desktopTimeouts.nativeCommand,
    'Reading application windows for the native Storybook story marker',
    { signal },
  );
  for (const { id } of windows) {
    if (id === session.currentWindowId) {
      continue;
    }
    // A window that closed while the others were searched has no marker to contribute.
    const markers = await findIn(id).catch((error: unknown) => {
      if (error instanceof HostStaleError) {
        return [];
      }
      throw error;
    });
    if (markers.length > 0) {
      return markers;
    }
  }
  return [];
}

function requireOrchestrator(session: DesktopSession): StoryOrchestrator {
  const orchestrator = session.target.storyOrchestrator;
  if (!orchestrator) {
    throw new WebDriverError('unsupported operation', `Target "${session.target.id}" does not provide Storybook orchestration.`);
  }
  return orchestrator;
}
