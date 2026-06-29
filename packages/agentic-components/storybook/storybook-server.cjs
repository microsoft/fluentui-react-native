// Standalone Storybook channel server for the agentic-components Storybook app.
//
// This lets external agents drive the running on-device Storybook app:
//   - WebSocket channel (ws://<host>:<port>/): select the current story, read/update control
//     args, and receive Storybook channel events. The on-device app connects to this server
//     (configured via getStorybookUI({ enableWebsockets: true, host, port }) in .rnstorybook/index.tsx).
//   - MCP endpoint (http://<host>:<port>/mcp): an MCP server for AI agents to query story /
//     component documentation and metadata (enabled via experimental_mcp).
//
// We run this standalone (instead of via withStorybook) because the bundler-agnostic
// `withStorybook` only starts the channel server in entry-point-swapping mode
// (STORYBOOK_ENABLED=true), which is incompatible with this app's in-app integration.
//
// Usage: `yarn storybook-server` (run alongside `yarn start` + `yarn macos`).
const path = require('node:path');
const { createChannelServer } = require('@storybook/react-native/node');

const host = process.env.STORYBOOK_WS_HOST || '127.0.0.1';
const port = Number(process.env.STORYBOOK_WS_PORT) || 7007;

createChannelServer({
  host,
  port,
  configPath: path.resolve(__dirname, '.rnstorybook'),
  websockets: true,
  experimental_mcp: true,
  keepNodeProcessAlive: true,
});

// eslint-disable-next-line no-console
console.log(`Storybook channel server listening:
  WebSocket : ws://${host}:${port}/
  MCP       : http://${host}:${port}/mcp`);
