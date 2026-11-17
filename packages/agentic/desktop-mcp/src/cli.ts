import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Command } from 'commander';

import { connectSupervisorWithDescriptor, connectWithDescriptor } from './connection.js';
import { createDesktopMcpServer } from './server.js';

export type DesktopMcpCliOptions = {
  argv?: readonly string[];
  /** The package version, reported by `--version` and at MCP initialization. */
  version: string;
};

/** Serves MCP over stdio with a startup-fixed discovery mode. */
export function runDesktopMcpCli(options: DesktopMcpCliOptions): Promise<void> {
  return run(options, false);
}

/** Compatibility entry point: it never offers supervisor workload authority. */
export function runDesktopDriverMcpCli(options: DesktopMcpCliOptions): Promise<void> {
  return run(options, true);
}

async function run({ argv = process.argv, version }: DesktopMcpCliOptions, legacy: boolean): Promise<void> {
  const program = new Command()
    .name(legacy ? 'desktop-driver-mcp' : 'desktop-mcp')
    .description('Connect to a verified desktop service and serve MCP over stdio.')
    .option('--descriptor <name>', 'private connection descriptor record name')
    .option('--root <path>', 'private storage root; defaults to the platform location')
    .version(version)
    .configureOutput({ writeOut: (value) => process.stderr.write(value) });
  if (!legacy) program.option('--driver-only', 'use the legacy driver descriptor without workload authority');
  program.parse(argv);
  const flags = program.opts<{ descriptor?: string; root?: string; driverOnly?: boolean }>();
  const driverOnly = legacy || flags.driverOnly === true;
  const discovery = {
    descriptor: flags.descriptor ?? (driverOnly ? 'agent-connection.json' : 'supervisor-connection.json'),
    ...(flags.root === undefined ? {} : { root: flags.root }),
  };
  const server = driverOnly
    ? createDesktopMcpServer({ mode: 'driver-only', connect: connectWithDescriptor(discovery), version })
    : createDesktopMcpServer({ mode: 'supervisor', connector: connectSupervisorWithDescriptor(discovery), version });
  await server.connect(new StdioServerTransport());
  const close = () => {
    void server.close().catch(() => {
      console.error('desktop-mcp: cleanup is incomplete; the supervisor must drain or fence the host.');
    });
  };
  process.stdin.once('end', close);
  process.once('SIGINT', close);
  process.once('SIGTERM', close);
}
