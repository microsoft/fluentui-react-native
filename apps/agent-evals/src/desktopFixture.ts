import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { createDesktopMcpServer } from '@fluentui-react-native/desktop-mcp';
import type { DesktopWorkloadInput, DesktopWorkloadResponse, DesktopWorkloadRun } from '@fluentui-react-native/desktop-test/control';
import { DesktopWorkloadTransportError } from '@fluentui-react-native/desktop-test/supervisor-connection';
import type { DesktopSupervisorConnection, DesktopSupervisorConnector } from '@fluentui-react-native/desktop-test/supervisor-connection';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import type { Scenario } from './cases.ts';

export type FixtureEvent = {
  sequence: number;
  action: 'connect' | DesktopWorkloadInput['action'] | 'close';
  input?: DesktopWorkloadInput;
  response?: DesktopWorkloadResponse;
  error?: string;
};

export function syntheticSupervisor(scenario: Exclude<Scenario, 'plan-only'>) {
  const events: FixtureEvent[] = [];
  let executions = 0;
  let run: DesktopWorkloadRun | undefined;
  const record = (event: Omit<FixtureEvent, 'sequence'>) => events.push({ sequence: events.length, ...event });
  const connection: DesktopSupervisorConnection = {
    incarnation: `inc_${'0'.repeat(24)}`,
    targetId: 'synthetic-no-native-driver',
    get driver(): never {
      throw new Error('This fixture has no native driver.');
    },
    verifyDriver: async () => {
      throw new Error('This fixture has no native driver authority.');
    },
    async request(input) {
      let response: DesktopWorkloadResponse;
      if (input.action === 'catalog') {
        response = { schemaVersion: 1, availability: 'available', catalog: [{ id: 'smoke', kind: 'wdio', lanes: ['accessible'] }] };
      } else if (input.action === 'run') {
        if (input.workload !== 'smoke' || input.lane !== 'accessible' || !input.requestId || run) {
          record({ action: input.action, input, error: 'invalid or duplicate admission' });
          throw new Error('Invalid or duplicate fixture admission.');
        }
        executions++;
        run = {
          handle: `dwr_${'0'.repeat(32)}`,
          requestId: input.requestId,
          workload: 'smoke',
          lane: 'accessible',
          phase: 'queued',
          cancellation: 'none',
          outcome: 'pending',
          cleanup: 'pending',
        };
        if (scenario === 'ambiguous-admission') {
          record({ action: input.action, input, error: 'ambiguous' });
          throw new DesktopWorkloadTransportError('ambiguous');
        }
        response = { schemaVersion: 1, availability: 'busy', run: { ...run } };
      } else if (input.action === 'status' && run && (input.requestId === run.requestId || input.handle === run.handle)) {
        run = { ...run, phase: 'settled', outcome: 'incomplete', cleanup: 'settled' };
        response = { schemaVersion: 1, availability: 'available', run: { ...run } };
      } else {
        record({ action: input.action, input, error: 'unsupported fixture request' });
        throw new Error('This fixture supports catalog, run, and status by request ID or handle.');
      }
      record({ action: input.action, input, response });
      return response;
    },
    close: async () => undefined,
  };
  const connector: DesktopSupervisorConnector = {
    async connect() {
      if (scenario === 'supervisor-unavailable') {
        record({ action: 'connect', error: 'unavailable' });
        throw new Error('Synthetic supervisor verification failed.');
      }
      record({ action: 'connect' });
      return connection;
    },
    async close() {
      record({ action: 'close' });
    },
  };
  return { connector, events, executions: () => executions };
}

export async function startDesktopFixture(scenario: Exclude<Scenario, 'plan-only'>) {
  const fixture = syntheticSupervisor(scenario);
  const mcp = createDesktopMcpServer({ mode: 'supervisor', connector: fixture.connector, version: 'synthetic-eval' });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: randomUUID });
  await mcp.connect(transport);
  const authorization = `Bearer ${randomBytes(32).toString('hex')}`;
  const server = createServer((request, response) => {
    const supplied = Buffer.from(request.headers.authorization ?? '');
    const expected = Buffer.from(authorization);
    if (request.url !== '/mcp' || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      response.writeHead(403).end();
      return;
    }
    void transport.handleRequest(request, response).catch(() => {
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
  });
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
  } catch (error) {
    await mcp.close();
    throw error;
  }
  const { port } = server.address() as AddressInfo;
  return {
    ...fixture,
    config: {
      mcpServers: {
        furn_eval: {
          type: 'http',
          // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- Authenticated synthetic listener binds numeric loopback only.
          url: `http://127.0.0.1:${port}/mcp`,
          headers: { Authorization: authorization },
          tools: ['desktop_workload'],
        },
      },
    },
    async close() {
      try {
        await mcp.close();
        await fixture.connector.close();
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      }
    },
  };
}
