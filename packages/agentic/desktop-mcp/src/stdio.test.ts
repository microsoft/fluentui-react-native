import path from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('desktop MCP executables', () => {
  test.each([
    ['supervisor', '../config/cli.cjs', [], true],
    ['explicit driver-only', '../config/cli.cjs', ['--driver-only'], false],
    ['legacy shim', '../../desktop-driver-mcp/config/cli.cjs', [], false],
  ] as const)('%s advertises only its startup mode over stdio', async (_label, executable, args, workload) => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [path.resolve(__dirname, executable), ...args],
      stderr: 'pipe',
    });
    const client = new Client({ name: 'stdio-contract', version: '1.0.0' });
    try {
      await client.connect(transport);
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(workload ? 7 : 6);
      expect(tools.some(({ name }) => name === 'desktop_workload')).toBe(workload);
    } finally {
      await client.close();
    }
  });
});
