const assert = require('node:assert/strict');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

function nativeRunnerEnabled(platform, environment) {
  return (
    (platform === 'darwin' || platform === 'win32') &&
    environment.FURN_NATIVE_DRIVER_TEST === '1' &&
    !!environment.FURN_NATIVE_HANDOFF_APP_PATH
  );
}

function nativeRunnerCaptureEnabled(platform, environment) {
  return platform !== 'win32' || !(environment.FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES ?? '').trim();
}

/**
 * @returns {{ endpoint: 'macos' | 'win32', executable: string, args: string[], application: import('@fluentui-react-native/desktop-driver').NativeDesktopApplicationDescriptor, activateId: string, statusId: string }}
 */
function nativeRunnerFixture(platform, applicationPath, title, readyFile, { capture = false } = {}) {
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
    args: ['--title', title, '--offscreen', capture ? '0' : '1'],
    application: { executablePath: applicationPath, windowTitle: title },
    activateId: '1001',
    statusId: '1004',
  };
}

async function waitForNativeFixture({ host, target, fixture, statusId, onDisposed, timeoutMs = 60_000, intervalMs = 50 }) {
  const signal = AbortSignal.timeout(timeoutMs);
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
      await delay(intervalMs);
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

module.exports = { nativeRunnerEnabled, nativeRunnerCaptureEnabled, nativeRunnerFixture, waitForNativeFixture };
