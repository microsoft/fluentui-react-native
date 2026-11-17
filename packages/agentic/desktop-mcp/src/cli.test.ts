import { connectSupervisorWithDescriptor, connectWithDescriptor } from './connection.js';
import { runDesktopDriverMcpCli, runDesktopMcpCli } from './cli.js';
import { createDesktopMcpServer } from './server.js';

jest.mock('./connection.js', () => ({
  connectSupervisorWithDescriptor: jest.fn(() => ({ connect: jest.fn(), close: jest.fn() })),
  connectWithDescriptor: jest.fn(() => jest.fn()),
}));
jest.mock('./server.js', () => ({
  createDesktopMcpServer: jest.fn(() => ({ connect: jest.fn(), close: jest.fn() })),
}));

describe('desktop MCP CLI modes', () => {
  const signals = ['SIGINT', 'SIGTERM'] as const;
  const original = new Map<string, Set<NodeJS.SignalsListener>>();
  let stdin: Set<NodeJS.SignalsListener>;

  beforeEach(() => {
    jest.clearAllMocks();
    for (const signal of signals) original.set(signal, new Set(process.listeners(signal) as NodeJS.SignalsListener[]));
    stdin = new Set(process.stdin.listeners('end') as NodeJS.SignalsListener[]);
  });

  afterEach(() => {
    for (const signal of signals) {
      for (const listener of process.listeners(signal) as NodeJS.SignalsListener[]) {
        if (!original.get(signal)?.has(listener)) process.off(signal, listener);
      }
    }
    for (const listener of process.stdin.listeners('end') as NodeJS.SignalsListener[]) {
      if (!stdin.has(listener)) process.stdin.off('end', listener);
    }
  });

  test('defaults to the supervisor descriptor', async () => {
    await runDesktopMcpCli({ argv: ['node', 'desktop-mcp'], version: 'test' });
    expect(connectSupervisorWithDescriptor).toHaveBeenCalledWith({ descriptor: 'supervisor-connection.json' });
    expect(createDesktopMcpServer).toHaveBeenCalledWith(expect.objectContaining({ mode: 'supervisor' }));
    expect(connectWithDescriptor).not.toHaveBeenCalled();
  });

  test.each([
    ['explicit driver-only', runDesktopMcpCli, ['--driver-only']],
    ['legacy executable', runDesktopDriverMcpCli, []],
  ] as const)('%s keeps driver-only discovery', async (_label, run, args) => {
    await run({ argv: ['node', 'desktop-mcp', ...args], version: 'test' });
    expect(connectWithDescriptor).toHaveBeenCalledWith({ descriptor: 'agent-connection.json' });
    expect(createDesktopMcpServer).toHaveBeenCalledWith(expect.objectContaining({ mode: 'driver-only' }));
    expect(connectSupervisorWithDescriptor).not.toHaveBeenCalled();
  });
});
