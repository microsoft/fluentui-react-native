const assert = require('node:assert/strict');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const caseTimeoutMs = 120_000;
const cleanupTimeoutMs = 30_000;

function nativeRunnerEnabled(platform, environment) {
  return (
    (platform === 'darwin' || platform === 'win32') &&
    environment.FURN_NATIVE_DRIVER_TEST === '1' &&
    !!environment.FURN_NATIVE_HANDOFF_APP_PATH
  );
}

function nativeRunnerCaptureEnabled(platform, environment) {
  return (platform === 'darwin' || platform === 'win32') && !(environment.FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES ?? '').trim();
}

async function nativeRunnerCapture({ enabled, capture }) {
  if (!enabled) return { status: 'skipped', skipped: true, reason: 'host input policy' };
  const reply = await capture();
  const artifact = reply.content.find(({ type }) => type === 'resource_link');
  return artifact ? { status: 'passed', artifact } : { status: 'unsupported', skipped: true, reason: 'endpoint did not provide capture' };
}

/**
 * @returns {{ endpoint: 'macos' | 'win32', executable: string, args: string[], application: import('@fluentui-react-native/desktop-driver').NativeDesktopApplicationDescriptor, activateId: string, statusId: string }}
 */
function nativeRunnerFixture(platform, applicationPath, title, readyFile, { capture = false, lifetimeMs = caseTimeoutMs + 15_000 } = {}) {
  if (platform === 'darwin') {
    return {
      endpoint: 'macos',
      executable: path.posix.join(applicationPath, 'Contents/MacOS/fixture'),
      args: ['--title', title, '--ready-file', readyFile],
      application: { bundleIdentifier: 'com.microsoft.furn.application-ownership-fixture', windowTitle: title },
      activateId: 'ownership-fixture-increment',
      statusId: 'ownership-fixture-count',
    };
  }
  if (platform !== 'win32' || !path.win32.isAbsolute(applicationPath) || path.win32.extname(applicationPath).toLowerCase() !== '.exe') {
    throw new Error('The Windows native runner requires an explicitly provisioned Win32 fixture executable.');
  }
  return {
    endpoint: 'win32',
    executable: applicationPath,
    args: ['--title', title, '--offscreen', capture ? '0' : '1', '--lifetime-ms', String(lifetimeMs)],
    application: { executablePath: applicationPath, windowTitle: title },
    activateId: '1001',
    statusId: '1004',
  };
}

async function waitForNativeFixture({
  host,
  target,
  fixture,
  statusId,
  onDisposed,
  signal: caseSignal,
  timeoutMs = 60_000,
  intervalMs = 50,
}) {
  const deadline = AbortSignal.timeout(timeoutMs);
  const signal = caseSignal ? AbortSignal.any([caseSignal, deadline]) : deadline;
  let lease;
  try {
    for (;;) {
      if (fixture.pid === undefined || fixture.exitCode !== null || fixture.signalCode !== null)
        throw new Error('The native fixture exited before readiness.');
      if (signal.aborted) throw new Error('The native fixture did not expose its ready control before the deadline.');
      if (!lease) {
        try {
          lease = await host.attach(target, signal);
        } catch (error) {
          if (
            typeof error !== 'object' ||
            error === null ||
            !('code' in error) ||
            (error.code !== 'session not created' && error.code !== 'attach-failed')
          )
            throw error;
        }
      }
      if (lease) {
        assert.equal(lease.processId, fixture.pid, 'readiness must belong to the exact fixture launched by this contract');
        const windows = await host.windows(lease, signal);
        for (const window of windows) {
          if (window.title !== target.host.application.windowTitle) continue;
          const controls = await host.find({ windowId: window.id }, { strategy: 'accessibility id', value: statusId }, signal);
          if (controls.some((control) => control.automationId === statusId && control.name === 'Ready')) return lease;
        }
      }
      await delay(intervalMs, undefined, { signal });
    }
  } finally {
    try {
      if (lease) await host.closeApplication(lease);
    } finally {
      await host.dispose();
      onDisposed?.();
    }
  }
}

function nativeRunnerRecords(platform, root) {
  return platform === 'win32'
    ? { agentDescriptor: `${path.basename(root)}-agent.json`, runnerDescriptor: `${path.basename(root)}-runner.json` }
    : { privateRoot: path.join(root, 'private'), agentDescriptor: 'agent-connection.json', runnerDescriptor: 'runner-connection.json' };
}

async function removeNativeRunnerDescriptors(storage, descriptors, ownerPid) {
  const removed = [];
  const retained = [];
  for (const name of descriptors) {
    const contents = await storage.read(name);
    if (contents === undefined) continue;
    let record;
    try {
      record = JSON.parse(contents);
    } catch {
      retained.push(name);
      continue;
    }
    if (
      Number.isSafeInteger(ownerPid) &&
      ownerPid > 0 &&
      record?.version === 1 &&
      record.service?.pid === ownerPid &&
      (await storage.remove(name, contents))
    ) {
      removed.push(name);
    } else retained.push(name);
  }
  return { removed, retained };
}

function nativeRunnerExecution(counts, mode) {
  if (mode === 'worker-crash') return { ...counts, accessibilityClick: 'not run (worker crash)', expectedFailure: true };
  assert.equal(counts.executed, 2, 'the native consumer must execute both ownership and accessibility input');
  assert.equal(counts.passed, 2);
  assert.equal(counts.failed, 0);
  assert.equal(counts.skipped, 0, 'required native accessibility input must not be silently skipped');
  return { ...counts, expectedExecuted: 2, accessibilityClick: 'passed' };
}

async function runNativeRunnerCase({
  work,
  shutdown,
  onError,
  onAbort,
  signal,
  timeoutMs = caseTimeoutMs,
  cleanupTimeoutMs: cleanupBudget = cleanupTimeoutMs,
}) {
  const deadline = AbortSignal.timeout(timeoutMs);
  const caseSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
  const stopped = interrupted(caseSignal);
  const abort = () => onAbort?.(caseSignal.reason);
  if (caseSignal.aborted) abort();
  else caseSignal.addEventListener('abort', abort, { once: true });
  // AbortSignal.timeout is unref'd: pending work must stay alive long enough to reach its cleanup deadline.
  const keepAlive = setInterval(() => undefined, timeoutMs + cleanupBudget);
  let aborted = false;
  let cleanupTimedOut = false;
  try {
    try {
      await Promise.race([
        Promise.resolve().then(() => {
          caseSignal.throwIfAborted();
          return work(caseSignal);
        }),
        stopped.promise,
      ]);
    } catch (error) {
      aborted = caseSignal.aborted;
      onError(error);
    } finally {
      stopped.dispose();
      caseSignal.removeEventListener('abort', abort);
    }
  } finally {
    try {
      const cleanupSignal = AbortSignal.timeout(cleanupBudget);
      const cleanupStopped = interrupted(cleanupSignal);
      try {
        await Promise.race([Promise.resolve().then(shutdown), cleanupStopped.promise]);
      } catch (error) {
        cleanupTimedOut = cleanupSignal.aborted;
        onError(error);
      } finally {
        cleanupStopped.dispose();
      }
    } finally {
      clearInterval(keepAlive);
    }
  }
  return { aborted, cleanupTimedOut, timeoutMs, cleanupTimeoutMs: cleanupBudget };
}

function interrupted(signal) {
  let onAbort;
  const promise = new Promise((_, reject) => {
    onAbort = () => reject(signal.reason);
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  });
  return { promise, dispose: () => signal.removeEventListener('abort', onAbort) };
}

module.exports = {
  nativeRunnerEnabled,
  nativeRunnerCaptureEnabled,
  nativeRunnerCapture,
  nativeRunnerFixture,
  waitForNativeFixture,
  nativeRunnerRecords,
  removeNativeRunnerDescriptors,
  nativeRunnerExecution,
  runNativeRunnerCase,
};
