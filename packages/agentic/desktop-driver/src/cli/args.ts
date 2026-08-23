import { DesktopDriverError } from '../errors.ts';

export interface ParsedArgs {
  command: string[];
  flags: Record<string, string | boolean>;
  repeated: Record<string, string[]>;
}

export function parseArgs(argv: readonly string[]): ParsedArgs {
  const command: string[] = [];
  const flags: Record<string, string | boolean> = {};
  const repeated: Record<string, string[]> = {};

  const record = (name: string, value: string | boolean): void => {
    flags[name] = value;
    if (typeof value === 'string') {
      (repeated[name] ??= []).push(value);
    }
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      command.push(token);
      continue;
    }
    const [name, inline] = token.slice(2).split('=', 2);
    if (inline !== undefined) {
      record(name, inline);
      continue;
    }
    const next = argv[index + 1];
    if (next === undefined || next.startsWith('--')) {
      record(name, true);
      continue;
    }
    record(name, next);
    index += 1;
  }

  return { command, flags, repeated };
}

const FLAGS_BY_COMMAND: Readonly<Record<string, readonly string[]>> = {
  version: [],
  doctor: ['platform'],
  'config:resolve': ['config', 'platform'],
  'config:print': ['config', 'platform'],
  'driver:detect': ['platform'],
  'driver:verify': ['platform'],
  'driver:install': ['platform'],
  'stories:generate': ['config', 'story-root', 'spec-root', 'out'],
  'stories:list': ['config', 'storybook-host', 'storybook-port'],
  'stories:select': ['config', 'storybook-host', 'storybook-port'],
  'stories:args': ['config', 'storybook-host', 'storybook-port'],
  'stories:smoke': ['config', 'storybook-host', 'storybook-port'],
  host: [
    'config',
    'config-path',
    'manifest',
    'runner',
    'runner-arg',
    'cwd',
    'port',
    'storybook-port',
    'announce-interval',
    'shutdown-file',
    'ready-file',
  ],
  serve: [
    'config',
    'config-path',
    'manifest',
    'runner',
    'runner-arg',
    'cwd',
    'port',
    'storybook-port',
    'announce-interval',
    'shutdown-file',
    'ready-file',
  ],
  start: ['platform', 'app', 'identity', 'pid', 'window', 'title', 'scene'],
};

export function assertKnownFlags(first: string, second: string | undefined, flags: ParsedArgs['flags']): void {
  const key = first === 'config' || first === 'driver' || first === 'stories' ? `${first}:${String(second)}` : first;
  const allowed = new Set([...(FLAGS_BY_COMMAND[key] ?? []), 'help']);
  const unknown = Object.keys(flags).filter((flag) => !allowed.has(flag));
  if (unknown.length > 0) {
    throw new DesktopDriverError(`Unknown option${unknown.length === 1 ? '' : 's'}: ${unknown.map((flag) => `--${flag}`).join(', ')}`, {
      kind: 'configuration',
    });
  }
}
