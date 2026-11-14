const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const { createControlledChannelServer } = require('./controlled-channel.cjs');

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
  const { buildIndex, createChannelServer } = requireFromProject('@storybook/react-native/node');
  const { finishDesktopProcess, publishDesktopServiceReady, registerDesktopProcessDisposal } =
    await import('@fluentui-react-native/desktop-test/process-control');
  let initialized;
  const initialization = new Promise((resolve) => {
    initialized = resolve;
  });
  let stopping = false;
  const controller = new AbortController();
  const [{ handleDesktopInterrupts }, { startNativeDesktopService }, { createDesktopReportSession }, { NativeDesktopHost }] =
    await Promise.all([
      import('@fluentui-react-native/desktop-test'),
      import('@fluentui-react-native/desktop-test/driver-service'),
      import('@fluentui-react-native/desktop-test/reporting'),
      import('@fluentui-react-native/desktop-driver'),
    ]);
  const report = await createDesktopReportSession({ artifactsRoot: path.join(projectRoot, 'artifacts', 'desktop'), kind: 'lifecycle' });
  let server;
  let controlledChannel;
  let driver;
  let agentReadyPath;
  let keepAlive;
  let closing;
  const close = (error) =>
    (closing ??= (async () => {
      const failures = error === undefined ? [] : [error];
      try {
        // Compatibility breadcrumb only; correlated process readiness is authoritative.
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
        if (controlledChannel) {
          await controlledChannel.close();
        } else if (server) {
          for (const client of server.clients) client.terminate();
          await new Promise((resolve, reject) => server.close((failure) => (failure ? reject(failure) : resolve())));
          // Upstream only unrefs its HTTP listener; accepted keep-alive and reconnect sockets would keep the process alive.
          const httpServer = server.options?.server;
          if (httpServer?.listening) {
            const closed = new Promise((resolve, reject) => httpServer.close((failure) => (failure ? reject(failure) : resolve())));
            httpServer.closeAllConnections?.();
            await closed;
          }
        }
      } catch (failure) {
        report.reporter.fail(failure, 'cleanup');
        failures.push(failure);
      }
      clearInterval(keepAlive);
      process.exitCode = await report.close(
        failures.length ? new AggregateError(failures, 'Storybook channel service failed.') : undefined,
      );
      unregisterDisposal();
      if (failures.length) throw new AggregateError(failures, 'Storybook channel disposal is incomplete.');
      finishDesktopProcess();
    })().finally(() => releaseInterrupts?.()));
  const settle = async (error) => {
    stopping = true;
    controller.abort(error ?? new Error('Storybook channel stop requested.'));
    await initialization;
    await close(error);
  };
  const stop = () => {
    void settle().catch((error) => {
      process.stderr.write(`${error.stack ?? error}\n`);
      process.exitCode = 1;
    });
  };
  const fatal = (error) => {
    if (closing) return;
    report.reporter.emit({ kind: 'service-failed', payload: { failure: report.reporter.failure(error) } }, 'storybook-channel');
    void settle(error).catch((failure) => {
      process.stderr.write(`${failure.stack ?? failure}\n`);
      process.exitCode = 1;
    });
  };
  const unregisterDisposal = registerDesktopProcessDisposal(() => settle());
  report.onStop?.(stop);
  // Handlers stay installed until close completes; nothing can be forced, so a repeated signal only warns before exiting.
  const releaseInterrupts = handleDesktopInterrupts({
    stop,
    terminate: (signal) =>
      report.reporter.emit({
        kind: 'diagnostic',
        payload: {
          level: 'warning',
          message: `Received ${signal} while the Storybook channel is closing. Interrupt again to exit without cleanup.`,
        },
      }),
  });
  try {
    controller.signal.throwIfAborted();
    let driverManifest;
    if (driverManifestPath) {
      const { parseStoredDriverManifest, readDriverManifest } = await import('../lib/driver/generatedManifest.js');
      if (process.env.STORYBOOK_NATIVE_DRIVER_FAKE === '1') {
        driverManifest = parseStoredDriverManifest(JSON.parse(fs.readFileSync(driverManifestPath, 'utf8')));
      } else {
        if (!process.env.STORYBOOK_DRIVER_HANDOFF) throw new Error('Native Storybook requires its trusted parent helper handoff.');
        driverManifest = await readDriverManifest(driverManifestPath, process.env.STORYBOOK_DRIVER_HANDOFF);
      }
    }
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
    if (agent) {
      controlledChannel = await createControlledChannelServer({ host, port, configPath, buildIndex, onFailure: fatal });
      server = controlledChannel.channel;
    } else {
      // Deliberately unprotected legacy mode, including upstream HTTP, WebSocket relay and MCP.
      server = createChannelServer({ host, port, configPath, websockets: true, experimental_mcp: true, keepNodeProcessAlive: false });
    }
    if (!server) {
      throw new Error('Desktop Driver Storybook orchestration requires WebSockets.');
    }
    server.on('error', fatal);
    keepAlive = setInterval(() => undefined, 60_000);
    if (driverManifest) {
      const { createApplicationIdentityResolver, StorybookChannelOrchestrator } = await import('../lib/driver/index.js');
      // An accessible driver cannot perform physical input, so every test that attaches to it runs the accessible lane.
      const maskedFeatures =
        driverManifest.wdio?.input === 'accessible'
          ? (await import('@fluentui-react-native/desktop-driver/authoring')).accessibleLaneMaskedFeatures
          : undefined;
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
          ...(maskedFeatures ? { features: Object.fromEntries(maskedFeatures.map((feature) => [feature, false])) } : {}),
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
          signal: controller.signal,
          // Windows agents verify the app's AUMID or executable; nothing maintains a lease there.
          application: agent?.application ?? driverManifest.application,
          artifact: driverManifest.nativeDriver,
          endpoint: driverManifest.endpoint,
          host,
          port: driverManifest.driverPort,
          onStderr: (text) =>
            report.reporter.emit({ kind: 'output', payload: { stream: 'stderr', text } }, 'native-helper', { service: 'native-helper' }),
          onFailure: fatal,
          ...(maskedFeatures ? { disabledInputFeatures: maskedFeatures } : {}),
          ...(agent
            ? {
                agent: { descriptor: agent.descriptor, ...(agent.root === undefined ? {} : { root: agent.root }) },
                addSecret: (secret) => report.reporter.addSecret(secret),
              }
            : {}),
          target,
          createTarget: async (targetHost, recovery) => ({
            storyOrchestrator: createChannelOrchestrator({
              channelServer: server,
              driverManifest,
              serverUrl: loopbackUrl(host, port),
              StorybookChannelOrchestrator,
              recovery: {
                ...recovery,
                resolveApplication: createApplicationIdentityResolver({
                  host: targetHost,
                  target: { ...target, host: targetHost },
                  createIdentityHost: () =>
                    new NativeDesktopHost({
                      application: agent?.application ?? driverManifest.application,
                      artifact: driverManifest.nativeDriver,
                      endpoint: driverManifest.endpoint,
                    }),
                }),
              },
            }),
          }),
        });
      }
      controller.signal.throwIfAborted();
      if (agent) {
        agentReadyPath = agent.readyPath;
        writeAgentReady(agentReadyPath, agent.descriptor);
      }
      if (stopping) controller.signal.throwIfAborted();
      await publishDesktopServiceReady({
        tier: 'service-ready',
        service: 'storybook-channel',
        ...(driverManifest?.agent ? { descriptor: driverManifest.agent.descriptor } : {}),
      });
    }
    report.reporter.emit(
      { kind: 'service-ready', payload: { message: `Storybook ${loopbackUrl(host, port)}${driver ? `; WebDriver ${driver.url}` : ''}` } },
      'storybook-channel',
    );
    initialized();
    return { channelServer: server, driver, close };
  } catch (error) {
    initialized();
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
    controlled: driverManifest.agent !== undefined,
    selectionTransport: 'direct',
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
