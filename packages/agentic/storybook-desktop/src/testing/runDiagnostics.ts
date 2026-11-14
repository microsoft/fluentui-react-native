import type { DesktopSessionClient } from '@fluentui-react-native/desktop-driver/client';

type WindowLog = Awaited<ReturnType<DesktopSessionClient['getWindowEvents']>>;
export type WdioCaseDiagnostics = {
  phases: Partial<
    Record<
      | 'sessionAttachMs'
      | 'manifestMs'
      | 'policyMs'
      | 'navigationMs'
      | 'preparationMs'
      | 'httpMs'
      | 'runtimeReadyMs'
      | 'nativeVerificationMs'
      | 'workerMs'
      | 'workerStartupMs'
      | 'workerBodyMs'
      | 'workerSettlementMs'
      | 'receiptsMs'
      | 'cleanupMs'
      | 'activityReadMs',
      number
    >
  >;
  lifecycle?: {
    contextGeneration: number;
    nativeMarkerPolls?: number;
    authenticatedHellos?: number;
    bridgeConnections?: number;
    /** A hello answers a challenge, not necessarily a JS initialization. No runtime protocol is added to observe it. */
    jsInitializations: 'not-observed';
    application?: { processId: number; processStartedAt: string };
  };
  windowActivity?: WindowActivity;
};

export type WdioWorkerTimings = { workerStartupMs?: number; workerBodyMs?: number };

export function readApplicationIncarnation(value: unknown): { processId: number; processStartedAt: string } | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const { processId, processStartedAt } = value as Record<string, unknown>;
  if (
    typeof processId !== 'number' ||
    !Number.isSafeInteger(processId) ||
    processId <= 0 ||
    typeof processStartedAt !== 'string' ||
    processStartedAt.length > 64 ||
    !Number.isFinite(Date.parse(processStartedAt))
  ) {
    return undefined;
  }
  return { processId, processStartedAt: new Date(processStartedAt).toISOString() };
}

export function readWorkerTimings(value: unknown): WdioWorkerTimings {
  const timings: WdioWorkerTimings = {};
  if (!value || typeof value !== 'object') return timings;
  for (const key of ['workerStartupMs', 'workerBodyMs'] as const) {
    const duration = (value as Record<string, unknown>)[key];
    if (typeof duration === 'number' && Number.isFinite(duration) && duration >= 0 && duration <= 2_147_483_647) timings[key] = duration;
  }
  return timings;
}

export type WindowActivityCursor = { command: number; event: number };
export type WindowActivity =
  | { status: 'not-supported' | 'unavailable' }
  | {
      status: 'observed';
      events: number;
      observing: boolean;
      notificationRegistrationFailures: number;
      applicationActivations: number;
      applicationDeactivations: number;
      focusedWindowChanges: number;
      mainWindowChanges: number;
      windowsCreated: number;
      elementsDestroyed: number;
      activationCommands: number;
      providerActivations: number;
      eventsTruncated: boolean;
      processEventsTruncated: boolean;
    };

export function windowActivityCursor(log: WindowLog): WindowActivityCursor {
  return { command: log.commands?.at(-1)?.sequence ?? 0, event: log.events.at(-1)?.sequence ?? 0 };
}

/** Project only fixed counters; the native log also contains application text and must not enter the run report. */
export function summarizeWindowActivity(log: WindowLog, since: WindowActivityCursor = { command: 0, event: 0 }): WindowActivity {
  const commands = (log.commands ?? []).slice(-1024).filter(({ sequence }) => sequence > since.command);
  const retainedEvents = log.events.slice(-1024);
  const events = retainedEvents.filter(({ sequence }) => sequence > since.event);
  return {
    status: 'observed',
    events: events.length,
    observing: log.observing,
    notificationRegistrationFailures: log.registrationFailures?.length ?? 0,
    applicationActivations: events.filter(({ notification }) => notification === 'AXApplicationActivated').length,
    applicationDeactivations: events.filter(({ notification }) => notification === 'AXApplicationDeactivated').length,
    focusedWindowChanges: events.filter(({ notification }) => notification === 'AXFocusedWindowChanged').length,
    mainWindowChanges: events.filter(({ notification }) => notification === 'AXMainWindowChanged').length,
    windowsCreated: events.filter(({ notification }) => notification === 'AXWindowCreated').length,
    elementsDestroyed: events.filter(({ notification }) => notification === 'AXUIElementDestroyed').length,
    activationCommands: commands.filter(({ command }) => command === 'activate').length,
    providerActivations: commands.filter(({ detail }) =>
      ['already-frontmost', 'accessibility', 'workspace', 'accessibility+workspace'].includes(String(detail?.method)),
    ).length,
    eventsTruncated: (log.eventsTruncated || retainedEvents.length < log.events.length) && (retainedEvents[0]?.sequence ?? 0) > since.event,
    processEventsTruncated: log.eventsTruncated,
  };
}
