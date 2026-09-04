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
  const server = createChannelServer({
    host,
    port,
    configPath,
    websockets: true,
    experimental_mcp: true,
    keepNodeProcessAlive: true,
  });

  // eslint-disable-next-line no-console
  console.log(`Storybook channel server listening:
  WebSocket : ws://${host}:${port}/
  MCP       : http://${host}:${port}/mcp`);

  let driver;
  if (driverManifestPath) {
    if (!fs.existsSync(driverManifestPath)) {
      throw new Error(`Desktop Driver manifest does not exist at ${driverManifestPath}.`);
    }
    const driverManifest = JSON.parse(fs.readFileSync(driverManifestPath, 'utf8'));
    if (
      driverManifest.schemaVersion !== 2 ||
      !driverManifest.nativeDriver ||
      !driverManifest.application ||
      typeof driverManifest.application.leasePath !== 'string' ||
      typeof driverManifest.application.leaseNonce !== 'string'
    ) {
      throw new Error(`Invalid native Desktop Driver manifest at ${driverManifestPath}.`);
    }
    const [{ NativeDesktopHost, createDesktopDriverServer }, { StorybookChannelOrchestrator }] = await Promise.all([
      import('@fluentui-react-native/desktop-driver'),
      import('../lib/driver/index.js'),
    ]);
    if (!server) {
      throw new Error('Desktop Driver Storybook orchestration requires WebSockets.');
    }
    let targetHost;
    let orchestrator;
    if (process.env.STORYBOOK_NATIVE_DRIVER_FAKE === '1') {
      const { createFakeStoryWindows, FakeDesktopHost, FakeStoryOrchestrator } =
        await import('@fluentui-react-native/desktop-driver/testing');
      targetHost = new FakeDesktopHost({
        endpoint: driverManifest.endpoint,
        platformName: driverManifest.endpoint === 'macos' ? 'macos' : 'windows',
        storyRootTestId: `${driverManifest.testIDPrefix}-story-root`,
        windows: createFakeStoryWindows(driverManifest.storyManifest, `${driverManifest.testIDPrefix}-story-root`),
      });
      orchestrator = new FakeStoryOrchestrator(driverManifest.storyManifest, targetHost);
    } else {
      targetHost = new NativeDesktopHost({
        application: driverManifest.application,
        artifact: driverManifest.nativeDriver,
        endpoint: driverManifest.endpoint,
        onStderr: (message) => process.stderr.write(`[desktop-driver-native] ${message}`),
      });
      orchestrator = createChannelOrchestrator({
        channelServer: server,
        driverManifest,
        serverUrl: loopbackUrl(host, port),
        StorybookChannelOrchestrator,
      });
    }
    driver = await createDesktopDriverServer({
      host,
      port: driverManifest.driverPort,
      targets: [
        {
          endpoint: driverManifest.endpoint,
          host: targetHost,
          id: driverManifest.targetId,
          platformName: driverManifest.endpoint === 'macos' ? 'macos' : 'windows',
          renderer: driverManifest.renderer,
          storyRootTestId: `${driverManifest.testIDPrefix}-story-root`,
          storyOrchestrator: orchestrator,
        },
      ],
    });
    console.log(`  WebDriver: ${driver.url}/`);
    const closeDriver = () => {
      driver.close().finally(() => {
        process.exit();
      });
    };
    process.once('SIGINT', closeDriver);
    process.once('SIGTERM', closeDriver);
  }

  return { channelServer: server, driver };
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
