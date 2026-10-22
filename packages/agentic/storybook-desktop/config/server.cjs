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
  const [{ startNativeDesktopService }, { createDesktopReportSession }] = await Promise.all([
    import('@fluentui-react-native/desktop-test'),
    import('@fluentui-react-native/desktop-test/reporting'),
  ]);
  const report = await createDesktopReportSession({ artifactsRoot: path.join(projectRoot, 'artifacts', 'desktop'), kind: 'lifecycle' });
  let server;
  let driver;
  let keepAlive;
  let closing;
  const close = (error) =>
    (closing ??= (async () => {
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
      const failures = error === undefined ? [] : [error];
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
    if (driverManifest) {
      report.reporter.addSecret(driverManifest.application.leaseNonce);
      report.reporter.addSecret(driverManifest.bridgeNonce);
    }
    // The upstream HTTP server is unref'd and closes on beforeExit; own only our clearable keepalive.
    server = createChannelServer({ host, port, configPath, websockets: true, experimental_mcp: true, keepNodeProcessAlive: false });
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
          application: driverManifest.application,
          artifact: driverManifest.nativeDriver,
          endpoint: driverManifest.endpoint,
          host,
          port: driverManifest.driverPort,
          onStderr: (text) =>
            report.reporter.emit({ kind: 'output', payload: { stream: 'stderr', text } }, 'native-helper', { service: 'native-helper' }),
          onFailure: fatal,
          target: {
            ...target,
            storyOrchestrator: createChannelOrchestrator({
              channelServer: server,
              driverManifest,
              serverUrl: loopbackUrl(host, port),
              StorybookChannelOrchestrator,
            }),
          },
        });
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

function createChannelOrchestrator({ channelServer, driverManifest, serverUrl, StorybookChannelOrchestrator }) {
  return new StorybookChannelOrchestrator({
    channelServer,
    driverManifest,
    serverUrl,
  });
}

function loopbackUrl(host, port) {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- native Storybook services are loopback-only
  return `http://${host}:${port}`;
}

module.exports = {
  startDesktopStorybookServer,
};
