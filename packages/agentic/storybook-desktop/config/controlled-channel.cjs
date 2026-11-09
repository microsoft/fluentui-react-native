const { createServer } = require('node:http');
const { WebSocketServer } = require('ws');

// Upstream createChannelServer has no authorization hook and relays arbitrary client events.
// The controlled transport deliberately has no client-to-client relay or HTTP mutation handler.
async function createControlledChannelServer({ host, port, configPath, buildIndex, onFailure }) {
  const http = createServer((request, response) => {
    if (request.method !== 'GET' || request.url !== '/index.json') {
      request.resume();
      response.writeHead(403, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Controlled Storybook mutations require a session-owning driver grant.' }));
      return;
    }
    void buildIndex({ configPath }).then(
      (index) => {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(index));
      },
      () => {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Failed to build the Storybook index.' }));
        onFailure(new Error('Failed to build the controlled Storybook index.'));
      },
    );
  });
  const channel = new WebSocketServer({ server: http, maxPayload: 1024 * 1024 });
  channel.on('connection', (client) => {
    // Socket failures are connection-local. Do not log frames, which can contain argument values.
    client.on('error', () => client.terminate());
  });
  await new Promise((resolve, reject) => {
    http.once('error', reject);
    http.listen(port, host, resolve);
  }).catch(async (error) => {
    await new Promise((resolve) => channel.close(resolve));
    throw error;
  });
  http.on('error', onFailure);
  // Storybook's WebsocketTransport closes an idle connection after 20 seconds.
  const heartbeat = setInterval(() => {
    for (const client of channel.clients) {
      if (client.readyState === 1) client.send(JSON.stringify({ type: 'ping' }));
    }
  }, 10_000);
  heartbeat.unref();
  return {
    channel,
    close: async () => {
      clearInterval(heartbeat);
      for (const client of channel.clients) client.terminate();
      await Promise.all([
        new Promise((resolve, reject) => channel.close((error) => (error ? reject(error) : resolve()))),
        new Promise((resolve, reject) => http.close((error) => (error ? reject(error) : resolve()))),
      ]);
    },
  };
}

module.exports = { createControlledChannelServer };
