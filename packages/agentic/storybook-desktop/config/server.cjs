const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

async function startDesktopStorybookServer({
  configPath,
  driverManifestPath = process.env.STORYBOOK_DRIVER_MANIFEST,
  host = process.env.STORYBOOK_WS_HOST || '127.0.0.1',
  port = Number(process.env.STORYBOOK_WS_PORT) || 7007,
  projectRoot = process.cwd(),
} = {}) {
  if (!configPath) {
    throw new TypeError('startDesktopStorybookServer requires an app-owned Storybook configPath.');
  }

  const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
  const { createChannelServer } = requireFromProject('@storybook/react-native/node');
  const [{ startNativeDesktopService }, { createDesktopReportSession }, { NativeDesktopHost }] = await Promise.all([
    import('@fluentui-react-native/desktop-test/driver-service'),
    import('@fluentui-react-native/desktop-test/reporting'),
    import('@fluentui-react-native/desktop-driver'),
  ]);
  const report = await createDesktopReportSession({ artifactsRoot: path.join(projectRoot, 'artifacts', 'desktop'), kind: 'lifecycle' });
  let server;
  let driver;
  let agentReadyPath;
  let keepAlive;
  let closing;
  const close = (error) =>
    (closing ??= (async () => {
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
      const failures = error === undefined ? [] : [error];
      try {
        // The parent reads readiness from this record, so it must not outlive the published descriptor.
        if (agentReadyPath) fs.rmSync(agentReadyPath, { force: true });
      } catch (failure) {
        report.reporter.fail(failure, 'cleanup');
        failures.push(failure);
      }
      try {
        await driver?.close();
      } catch (failure) {
        report.reporter.fail(failure, 'cleanup');
        failures.push(failure);
      }
      try {
        if (server) {
          for (const client of server.clients) client.terminate();
          await new Promise((resolve, reject) => server.close((failure) => (failure ? reject(failure) : resolve())));
        }
      } catch (failure) {
        report.reporter.fail(failure, 'cleanup');
        failures.push(failure);
      }
      clearInterval(keepAlive);
      process.exitCode = await report.close(
        failures.length ? new AggregateError(failures, 'Storybook channel service failed.') : undefined,
      );
    })());
  const stop = () => {
    void close().catch((error) => {
      process.stderr.write(`${error.stack ?? error}\n`);
      process.exitCode = 1;
    });
  };
  const fatal = (error) => {
    if (closing) return;
    report.reporter.emit({ kind: 'service-failed', payload: { failure: report.reporter.failure(error) } }, 'storybook-channel');
    void close(error).catch((failure) => {
      process.stderr.write(`${failure.stack ?? failure}\n`);
      process.exitCode = 1;
    });
  };
  try {
    const driverManifest = driverManifestPath ? JSON.parse(fs.readFileSync(driverManifestPath, 'utf8')) : undefined;
    if (
      driverManifest &&
      (driverManifest.schemaVersion !== 2 ||
        !driverManifest.nativeDriver ||
        !driverManifest.application ||
        typeof driverManifest.application.leasePath !== 'string' ||
        typeof driverManifest.application.leaseNonce !== 'string')
    )
      throw new Error(`Invalid native Desktop Driver manifest at ${driverManifestPath}.`);
    const agent = driverManifest?.agent;
    if (
      agent !== undefined &&
      (typeof agent !== 'object' ||
        agent === null ||
        typeof agent.descriptor !== 'string' ||
        typeof agent.readyPath !== 'string' ||
        (agent.root !== undefined && typeof agent.root !== 'string') ||
        (agent.application !== undefined &&
          (typeof agent.application !== 'object' ||
            agent.application === null ||
            typeof agent.application.windowTitle !== 'string' ||
            (typeof agent.application.aumid !== 'string' && typeof agent.application.executablePath !== 'string'))))
    )
      throw new Error(`Invalid agent connection in the native Desktop Driver manifest at ${driverManifestPath}.`);
    if (agent && process.env.STORYBOOK_NATIVE_DRIVER_FAKE === '1')
      throw new Error('An agent connection requires the native Desktop Driver; the fake driver cannot publish one.');
    if (driverManifest) {
      report.reporter.addSecret(driverManifest.application.leaseNonce);
      report.reporter.addSecret(driverManifest.bridgeNonce);
    }
    // The upstream HTTP server is unref'd and closes on beforeExit; own only our clearable keepalive. Its MCP endpoint
    // selects stories without a grant, so an agent-served driver disables it and agents select through the driver.
    server = createChannelServer({ host, port, configPath, websockets: true, experimental_mcp: !agent, keepNodeProcessAlive: false });
    if (!server) {
      throw new Error('Desktop Driver Storybook orchestration requires WebSockets.');
    }
    server.on('error', fatal);
    keepAlive = setInterval(() => undefined, 60_000);
    if (driverManifest) {
      const { StorybookChannelOrchestrator } = await import('../lib/driver/index.js');
      const target = {
        endpoint: driverManifest.endpoint,
        id: driverManifest.targetId,
        platformName: driverManifest.endpoint === 'macos' ? 'macos' : 'windows',
        renderer: driverManifest.renderer,
        storyRootTestId: `${driverManifest.testIDPrefix}-story-root`,
        launchModes: ['attach'],
      };
      if (process.env.STORYBOOK_NATIVE_DRIVER_FAKE === '1') {
        const { createDesktopDriverServer } = await import('@fluentui-react-native/desktop-driver');
        const { createFakeStoryWindows, FakeDesktopHost, FakeStoryOrchestrator } =
          await import('@fluentui-react-native/desktop-driver/testing');
        const targetHost = new FakeDesktopHost({
          endpoint: driverManifest.endpoint,
          platformName: target.platformName,
          storyRootTestId: target.storyRootTestId,
          windows: createFakeStoryWindows(driverManifest.storyManifest, target.storyRootTestId),
        });
        driver = await createDesktopDriverServer({
          host,
          port: driverManifest.driverPort,
          targets: [
            { ...target, host: targetHost, storyOrchestrator: new FakeStoryOrchestrator(driverManifest.storyManifest, targetHost) },
          ],
        });
      } else {
        driver = await startNativeDesktopService({
          // Windows agents verify the app's AUMID or executable; nothing maintains a lease there.
          application: agent?.application ?? driverManifest.application,
          artifact: driverManifest.nativeDriver,
          endpoint: driverManifest.endpoint,
          host,
          port: driverManifest.driverPort,
          onStderr: (text) =>
            report.reporter.emit({ kind: 'output', payload: { stream: 'stderr', text } }, 'native-helper', { service: 'native-helper' }),
          onFailure: fatal,
          ...(agent
            ? {
                agent: { descriptor: agent.descriptor, ...(agent.root === undefined ? {} : { root: agent.root }) },
                addSecret: (secret) => report.reporter.addSecret(secret),
              }
            : {}),
          target,
          createTarget: async (_targetHost, recovery) => ({
            storyOrchestrator: createChannelOrchestrator({
              channelServer: server,
              driverManifest,
              serverUrl: loopbackUrl(host, port),
              StorybookChannelOrchestrator,
              recovery: {
                ...recovery,
                resolveApplication: async () => {
                  // A separate helper cannot steal window/element records from an active session's lease.
                  const identityHost = new NativeDesktopHost({
                    application: agent?.application ?? driverManifest.application,
                    artifact: driverManifest.nativeDriver,
                    endpoint: driverManifest.endpoint,
                  });
                  try {
                    const lease = await identityHost.attach({ ...target, host: identityHost }, AbortSignal.timeout(10_000));
                    if (lease.processId === undefined || lease.processStartedAt === undefined)
                      throw new Error('The Storybook application has no verified process incarnation.');
                    return { processId: lease.processId, processStartedAt: lease.processStartedAt };
                  } finally {
                    await identityHost.dispose();
                  }
                },
              },
            }),
          }),
        });
      }
      if (agent) {
        agentReadyPath = agent.readyPath;
        writeAgentReady(agentReadyPath, agent.descriptor);
      }
    }
    report.reporter.emit(
      { kind: 'service-ready', payload: { message: `Storybook ${loopbackUrl(host, port)}${driver ? `; WebDriver ${driver.url}` : ''}` } },
      'storybook-channel',
    );
    report.onStop?.(stop);
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    return { channelServer: server, driver, close };
  } catch (error) {
    await close(error);
    throw error;
  }
}

function createChannelOrchestrator({ channelServer, driverManifest, serverUrl, StorybookChannelOrchestrator, recovery }) {
  return new StorybookChannelOrchestrator({
    channelServer,
    driverManifest,
    serverUrl,
    recovery,
  });
}

function writeAgentReady(readyPath, descriptor) {
  const temporaryPath = `${readyPath}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(readyPath), { mode: 0o700, recursive: true });
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify({ descriptor, processId: process.pid, schemaVersion: 1 })}\n`, { mode: 0o600 });
    fs.renameSync(temporaryPath, readyPath);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

function loopbackUrl(host, port) {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- native Storybook services are loopback-only
  return `http://${host}:${port}`;
}

module.exports = {
  startDesktopStorybookServer,
};
