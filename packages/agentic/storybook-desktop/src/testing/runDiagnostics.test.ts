import { readApplicationIncarnation, readWorkerTimings, summarizeWindowActivity } from './runDiagnostics.js';

test('projects only a bounded application incarnation without retaining injected context', () => {
  const application = { processId: 123, processStartedAt: '2026-11-12T12:00:00.000Z' };
  expect(readApplicationIncarnation({ ...application, nonce: 'private', args: { secret: true } })).toEqual(application);
  expect(readApplicationIncarnation({ ...application, processStartedAt: 'Thu Nov 12 2026 12:00:00 GMT+0000 (private)' })).toEqual(
    application,
  );
  for (const invalid of [
    { ...application, processId: -1 },
    { ...application, processId: 0.5 },
    { ...application, processStartedAt: 'private' },
    { ...application, processStartedAt: ' '.repeat(100) },
    null,
  ]) {
    expect(readApplicationIncarnation(invalid)).toBeUndefined();
  }
});

test('reduces native activity to bounded counters, never window titles or command details', () => {
  const activity = summarizeWindowActivity({
    source: 'AX',
    observing: true,
    eventsTruncated: true,
    events: [
      { ageMs: 1, element: 'private-native-handle', notification: 'AXMainWindowChanged', sequence: 2 },
      { ageMs: 0, element: 'private-native-handle', notification: 'AXWindowCreated', sequence: 3 },
    ],
    commands: [
      { ageMs: 3, command: 'activate', outcome: 'ok', sequence: 5, detail: { method: 'already-frontmost', name: 'private text' } },
      { ageMs: 2, command: 'click', outcome: 'ok', sequence: 6, detail: { method: 'accessibility', args: 'private args' } },
      { ageMs: 1, command: 'find', outcome: 'ok', sequence: 7 },
    ],
    trackedWindows: [{ closed: false, element: 'private-handle', id: 'private-window', primary: true, title: 'private title' }],
  });
  expect(activity).toEqual({
    status: 'observed',
    events: 2,
    observing: true,
    notificationRegistrationFailures: 0,
    applicationActivations: 0,
    applicationDeactivations: 0,
    focusedWindowChanges: 0,
    mainWindowChanges: 1,
    windowsCreated: 1,
    elementsDestroyed: 0,
    activationCommands: 1,
    providerActivations: 2,
    eventsTruncated: true,
    processEventsTruncated: true,
  });
  expect(JSON.stringify(activity)).not.toContain('private');
});

test('activity counters use per-case sequence deltas', () => {
  expect(
    summarizeWindowActivity(
      {
        source: 'AX',
        observing: true,
        eventsTruncated: false,
        events: [
          { ageMs: 1, element: 'window', notification: 'AXMainWindowChanged', sequence: 10 },
          { ageMs: 0, element: 'window', notification: 'AXUIElementDestroyed', sequence: 11 },
        ],
        commands: [
          { ageMs: 2, command: 'activate', outcome: 'ok', sequence: 20 },
          { ageMs: 1, command: 'find', outcome: 'ok', sequence: 21 },
        ],
      },
      { command: 20, event: 10 },
    ),
  ).toMatchObject({
    events: 1,
    mainWindowChanges: 0,
    elementsDestroyed: 1,
    activationCommands: 0,
    eventsTruncated: false,
    processEventsTruncated: false,
  });
});

test.each([false, true])('sequence gaps do not imply case truncation with process history flag %s', (eventsTruncated) => {
  const activity = summarizeWindowActivity(
    {
      source: 'AX',
      observing: true,
      eventsTruncated,
      events: [
        { ageMs: 2, element: 'window', notification: 'AXMainWindowChanged', sequence: 10 },
        { ageMs: 0, element: 'window', notification: 'AXWindowCreated', sequence: 30 },
      ],
      commands: [
        { ageMs: 2, command: 'activate', outcome: 'ok', sequence: 20 },
        { ageMs: 0, command: 'activate', outcome: 'ok', sequence: 40 },
      ],
    },
    { command: 20, event: 10 },
  );
  expect(activity).toMatchObject({
    events: 1,
    windowsCreated: 1,
    activationCommands: 1,
    eventsTruncated: false,
    processEventsTruncated: eventsTruncated,
  });
  expect(activity).not.toHaveProperty('commandsTruncated');
});

test('case event truncation requires lost cursor coverage in a truncated history', () => {
  expect(
    summarizeWindowActivity(
      {
        source: 'AX',
        observing: true,
        eventsTruncated: true,
        events: [{ ageMs: 0, element: 'window', notification: 'AXWindowCreated', sequence: 30 }],
      },
      { command: 20, event: 10 },
    ),
  ).toMatchObject({ eventsTruncated: true, processEventsTruncated: true });
});

test('worker timing projection rejects nonnumeric and unbounded values without retaining extra fields', () => {
  expect(readWorkerTimings({ workerStartupMs: 10, workerBodyMs: 20, nonce: 'private' })).toEqual({
    workerStartupMs: 10,
    workerBodyMs: 20,
  });
  for (const workerBodyMs of [-1, Infinity, NaN, 2_147_483_648, 'private']) {
    expect(readWorkerTimings({ workerBodyMs })).toEqual({});
  }
});
