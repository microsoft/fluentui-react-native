import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Command } from 'commander';

import { connectWithDescriptor } from './connection.js';
import { createDesktopDriverMcpServer } from './server.js';

export type DesktopDriverMcpCliOptions = {
  argv?: readonly string[];
  /** The package version, reported by `--version` and at MCP initialization. */
  version: string;
};

/**
 * Serves MCP over stdio until the client closes stdin. stdout carries protocol only; diagnostics go to stderr.
 */
export async function runDesktopDriverMcpCli({ argv = process.argv, version }: DesktopDriverMcpCliOptions): Promise<void> {
  const program = new Command()
    .name('desktop-driver-mcp')
    .description('Serve Desktop Driver agent operations to an MCP client over stdio.')
    .option('--descriptor <name>', 'record name of the connection descriptor a supervisor published', 'agent-connection.json')
    .option('--root <path>', 'private storage root the descriptor was published under; defaults to the platform location')
    .version(version)
    .configureOutput({ writeOut: (value) => process.stderr.write(value) });
  program.parse(argv);
  const flags = program.opts<{ descriptor: string; root?: string }>();
  const server = createDesktopDriverMcpServer({
    connect: connectWithDescriptor({ descriptor: flags.descriptor, ...(flags.root === undefined ? {} : { root: flags.root }) }),
    version,
  });
  await server.connect(new StdioServerTransport());
  const close = () => {
    void server.close();
  };
  process.stdin.once('end', close);
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}
