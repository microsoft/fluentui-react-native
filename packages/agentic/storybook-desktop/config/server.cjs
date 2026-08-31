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
    const [
      { createDesktopDriverServer },
      { createFakeStoryWindows, FakeDesktopHost, FakeStoryOrchestrator },
      { StorybookChannelOrchestrator },
    ] = await Promise.all([
      import('@fluentui-react-native/desktop-driver/server'),
      import('@fluentui-react-native/desktop-driver/testing'),
      import('../lib/driver/index.js'),
    ]);
    if (!server) {
      throw new Error('Desktop Driver Storybook orchestration requires WebSockets.');
    }
    const targetHost = new FakeDesktopHost({
      endpoint: driverManifest.endpoint,
      platformName: driverManifest.endpoint === 'macos' ? 'macos' : 'windows',
      storyRootTestId: `${driverManifest.testIDPrefix}-story-root`,
      windows: createFakeStoryWindows(driverManifest.storyManifest, `${driverManifest.testIDPrefix}-story-root`),
    });
    const orchestrator =
      process.env.STORYBOOK_SMOKE_MODE === 'stories-and-tests'
        ? new FakeStoryOrchestrator(driverManifest.storyManifest, targetHost)
        : createChannelOrchestrator({
            channelServer: server,
            driverManifest,
            serverUrl: loopbackUrl(host, port),
            targetHost,
            StorybookChannelOrchestrator,
          });
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

function createChannelOrchestrator({ channelServer, driverManifest, serverUrl, targetHost, StorybookChannelOrchestrator }) {
  const channelOrchestrator = new StorybookChannelOrchestrator({
    channelServer,
    driverManifest,
    serverUrl,
  });
  const setStoryMarker = (result) => {
    targetHost.resetPreview();
    targetHost.setElementName('story-root', JSON.stringify(result));
    return result;
  };
  return {
    getManifest: () => channelOrchestrator.getManifest(),
    getCurrentStory: () => channelOrchestrator.getCurrentStory(),
    selectStory: async (request) => setStoryMarker(await channelOrchestrator.selectStory(request)),
    resetStory: async (request) => setStoryMarker(await channelOrchestrator.resetStory(request)),
    updateArgs: (storyId, args) => channelOrchestrator.updateArgs(storyId, args),
  };
}

function loopbackUrl(host, port) {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- native Storybook services are loopback-only
  return `http://${host}:${port}`;
}

module.exports = {
  startDesktopStorybookServer,
};
