const fs = require('node:fs');

function publishReady(readyPath, value) {
  const pending = `${readyPath}.pending`;
  fs.writeFileSync(pending, JSON.stringify(value), { flag: 'wx' });
  fs.renameSync(pending, readyPath);
}

async function waitForParent() {
  process.stdin.resume();
  await new Promise((resolve) => process.stdin.once('end', resolve));
}

async function main() {
  const [requestPath, readyPath] = process.argv.slice(2);
  const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
  const { NativeDesktopHost } = await import('@fluentui-react-native/desktop-driver');
  const { describeWindowsService } = await import('@fluentui-react-native/desktop-driver/authority');
  const { createDesktopApplicationHost, captureDesktopApplicationIdentity } =
    await import('@fluentui-react-native/desktop-test/application-ownership');
  const { createDesktopWorkloadClaim, recoverWindowsDesktopWorkloadClaim } = await import('@fluentui-react-native/desktop-test/ownership');
  const owner = await describeWindowsService({ artifact: request.artifact, pid: process.pid });
  if (request.operation === 'interrupt-recovery') {
    const native = new NativeDesktopHost({
      artifact: request.artifact,
      application: request.target.host.application,
      endpoint: request.target.endpoint,
    });
    try {
      await recoverWindowsDesktopWorkloadClaim({
        directory: request.lockDirectory,
        endpoint: request.target.endpoint,
        targetId: request.target.id,
        targetInstanceId: request.target.instanceId,
        processIdentity: owner,
        probeOwner: async (candidate) => {
          try {
            const described = await describeWindowsService({ artifact: request.artifact, pid: candidate.processId });
            return { state: 'alive', processStartedAt: described.startedAt };
          } catch (error) {
            return error !== null && typeof error === 'object' && 'reason' in error && error.reason === 'exited'
              ? { state: 'exited' }
              : { state: 'unknown' };
          }
        },
        recoverApplication: async (application) => {
          publishReady(readyPath, { owner, application });
          await waitForParent();
          await native.recoverApplication(application);
        },
      });
    } finally {
      await native.dispose();
    }
    return;
  }
  const claim = createDesktopWorkloadClaim({
    directory: request.lockDirectory,
    processIdentity: owner,
    runId: 'native-crash-owner',
    targetId: request.target.id,
    targetInstanceId: request.target.instanceId,
  });
  const native = new NativeDesktopHost({
    artifact: request.artifact,
    application: request.target.host.application,
    endpoint: request.target.endpoint,
  });
  /** @type {Omit<import('@fluentui-react-native/desktop-driver').DesktopTarget, 'host'>} */
  const registration = {
    endpoint: request.target.endpoint,
    id: request.target.id,
    launchTimeoutMs: request.target.launchTimeoutMs,
    platformName: 'windows',
  };
  let host;
  try {
    host = await createDesktopApplicationHost(native, {
      lifetime: 'supervisor',
      onResource: (resource) => claim.updateResource(resource),
      resourcePrefix: 'native-crash-owner',
      target: registration,
    });
    const lease = await host.launch({ ...registration, host });
    const {
      schemaVersion: _schemaVersion,
      endpoint: _endpoint,
      ...application
    } = captureDesktopApplicationIdentity(lease, request.target.endpoint);
    // Contract-only access to the child we created; the parent re-verifies its kernel identity before fault injection.
    const helperOwner = /** @type {{ processPromise: Promise<{ child: import('node:child_process').ChildProcess }> }} */ (
      /** @type {unknown} */ (native)
    );
    const helperProcess = await helperOwner.processPromise;
    if (!helperProcess.child.pid) throw new Error('The native owner has no recorded helper PID.');
    const helper = await describeWindowsService({ artifact: request.artifact, pid: helperProcess.child.pid });
    publishReady(readyPath, { application, helper, owner });
    await waitForParent();
  } finally {
    await (host ?? native).dispose();
    claim.release();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exitCode = 1;
});
