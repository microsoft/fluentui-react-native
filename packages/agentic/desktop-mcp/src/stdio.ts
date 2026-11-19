import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export async function serveDesktopMcpStdio(server: McpServer): Promise<void> {
  const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;
  let closing: Promise<void> | undefined;
  const close = () => {
    closing ??= Promise.resolve()
      .then(() => server.close())
      .catch(() => {
        console.error('desktop-mcp: cleanup is incomplete; the supervisor must drain or fence the host.');
        process.exitCode = 1;
      })
      .finally(() => {
        process.stdin.off('end', close);
        for (const signal of signals) process.off(signal, close);
        process.stdin.destroy();
      });
  };
  server.server.onclose = close;
  process.stdin.once('end', close);
  for (const signal of signals) process.on(signal, close);
  try {
    await server.connect(new StdioServerTransport());
    if (process.stdin.readableEnded) close();
  } catch (error) {
    close();
    await closing;
    throw error;
  }
}
