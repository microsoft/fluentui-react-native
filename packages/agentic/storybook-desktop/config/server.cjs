const { createRequire } = require('node:module');
const path = require('node:path');

function startDesktopStorybookServer({
  configPath,
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

  return server;
}

module.exports = {
  startDesktopStorybookServer,
};
