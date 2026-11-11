import type { Command } from 'commander';

export const desktopReporterModes = ['auto', 'plain', 'github-actions', 'json', 'ndjson'] as const;
export const desktopEventLevels = ['milestones', 'progress', 'all'] as const;

export type DesktopReporterMode = (typeof desktopReporterModes)[number];
export type ResolvedDesktopReporterMode = Exclude<DesktopReporterMode, 'auto'>;
export type DesktopEventLevel = (typeof desktopEventLevels)[number];
export type DesktopCliErrorCode = 'usage' | 'config' | 'unknown-target' | 'busy' | 'attach-only' | 'unsupported' | 'internal';
export type DesktopCliError = {
  schemaVersion: 1;
  type: 'error';
  error: { code: DesktopCliErrorCode; message: string };
};

export type DesktopReporterModeOptions = {
  flag?: string;
  environment?: string;
  configured?: string;
  githubActions?: boolean;
};

export type DesktopCliOutput = {
  writeErr: (text: string) => void;
  writeOut: (text: string) => void;
};

const maximumDesktopCliMessageBytes = 1024;

// W3C WebDriver error names that describe a caller's input or an unsupported capability rather than a server fault.
const webDriverErrorKinds: Partial<Record<string, DesktopCliErrorCode>> = {
  'invalid argument': 'usage',
  'invalid selector': 'usage',
  'unsupported operation': 'unsupported',
};

// CI templates and Windows shells commonly export an empty variable for an unset value.
function nonEmpty(value: string | undefined): string | undefined {
  return value?.trim() ? value : undefined;
}

export function resolveDesktopReporterMode(options: DesktopReporterModeOptions = {}): ResolvedDesktopReporterMode {
  const configured = options.flag ?? nonEmpty(options.environment) ?? nonEmpty(options.configured) ?? 'auto';
  if (!desktopReporterModes.includes(configured as DesktopReporterMode)) {
    throw Object.assign(new TypeError(`Reporter must be one of ${desktopReporterModes.join(', ')}. Received "${configured}".`), {
      code: 'config',
    });
  }
  if (configured !== 'auto') return configured as ResolvedDesktopReporterMode;
  return (options.githubActions ?? process.env.GITHUB_ACTIONS === 'true') ? 'github-actions' : 'plain';
}

export function resolveDesktopEventLevel(options: { flag?: string; environment?: string; configured?: string } = {}): DesktopEventLevel {
  const configured = options.flag ?? nonEmpty(options.environment) ?? nonEmpty(options.configured) ?? 'milestones';
  if (!desktopEventLevels.includes(configured as DesktopEventLevel)) {
    throw Object.assign(new TypeError(`Event level must be one of ${desktopEventLevels.join(', ')}. Received "${configured}".`), {
      code: 'config',
    });
  }
  return configured as DesktopEventLevel;
}

export function formatDesktopReporterValue(
  mode: ResolvedDesktopReporterMode,
  value: unknown,
  pretty = mode === 'plain' || mode === 'github-actions',
): string {
  if (mode === 'ndjson') {
    return `${JSON.stringify({ schemaVersion: 1, type: 'terminal', result: value })}\n`;
  }
  return `${JSON.stringify(value, null, pretty ? 2 : undefined)}\n`;
}

export function resolveDesktopReporterModeFromArgv(argv: readonly string[], options: Omit<DesktopReporterModeOptions, 'flag'> = {}) {
  let flag: string | undefined;
  let json = false;
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--json') json = true;
    else if (argument === '--reporter') flag = argv[index + 1];
    else if (argument.startsWith('--reporter=')) flag = argument.slice('--reporter='.length);
  }
  return resolveDesktopReporterMode({ ...options, flag: json ? 'json' : flag });
}

const closedStreamErrorCodes = new Set(['EPIPE', 'EOF', 'ECONNRESET', 'ERR_STREAM_DESTROYED']);
const guardedStreams = new WeakSet<object>();

/** True when a write failed because the consumer closed the pipe rather than because the output itself was invalid. */
export function isClosedDesktopStreamError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && closedStreamErrorCodes.has(String(error.code)));
}

/**
 * Keeps a consumer that closes stdout from crashing a command with an unhandled stream error. Collectors that own
 * presentation record the closed pipe as a reporting diagnostic from their write failure; here the command's own
 * exit status stays authoritative and other stream errors keep their default failure behavior.
 */
export function tolerateClosedDesktopStdout(stream: NodeJS.WriteStream = process.stdout): void {
  if (guardedStreams.has(stream)) return;
  guardedStreams.add(stream);
  stream.on('error', (error) => {
    if (!isClosedDesktopStreamError(error)) throw error;
  });
}

/**
 * Routes commander usage errors and help to the reporter instead of the process. Commander copies these settings only
 * into commands created after they are set, so they are applied to every command already in the tree.
 */
export function configureDesktopCliCommandTree(command: Command, output: DesktopCliOutput): void {
  command.exitOverride().configureOutput(output);
  for (const child of command.commands) configureDesktopCliCommandTree(child, output);
}

export function describeDesktopCliError(error: unknown): string {
  return clipReporterText(error instanceof Error ? error.message : String(error), maximumDesktopCliMessageBytes);
}

export function projectDesktopCliError(error: unknown): DesktopCliError {
  return {
    schemaVersion: 1,
    type: 'error',
    error: { code: desktopCliErrorCode(error), message: describeDesktopCliError(error) },
  };
}

/** Compact NDJSON carries the error record as its single terminal record, so it matches the JSON document. */
export function formatDesktopReporterError(mode: ResolvedDesktopReporterMode, error: unknown): string {
  return formatDesktopReporterValue(mode === 'ndjson' ? 'json' : mode, projectDesktopCliError(error));
}

function desktopCliErrorCode(error: unknown): DesktopCliErrorCode {
  const record = error && typeof error === 'object' ? (error as { code?: unknown; name?: unknown; data?: unknown }) : undefined;
  const code = typeof record?.code === 'string' ? record.code : undefined;
  if (code?.startsWith('commander.')) return 'usage';
  if (isDesktopCliErrorCode(code)) return code;

  // WebDriver errors carry the W3C code in `code` (DD) or `name` (webdriver client errors).
  const webDriverCode = code ?? (typeof record?.name === 'string' ? record.name : undefined);
  if (webDriverCode === 'session not created' && hasTargetBusyReason(record?.data)) return 'busy';
  return (webDriverCode === undefined ? undefined : webDriverErrorKinds[webDriverCode]) ?? 'internal';
}

function hasTargetBusyReason(data: unknown): boolean {
  return Boolean(data && typeof data === 'object' && 'reason' in data && data.reason === 'target-busy');
}

function isDesktopCliErrorCode(value: string | undefined): value is DesktopCliErrorCode {
  return (
    value === 'usage' ||
    value === 'config' ||
    value === 'unknown-target' ||
    value === 'busy' ||
    value === 'attach-only' ||
    value === 'unsupported' ||
    value === 'internal'
  );
}

function clipReporterText(value: string, maximumBytes: number): string {
  const normalized = value.replaceAll(/\s+/g, ' ').trim();
  if (Buffer.byteLength(normalized) <= maximumBytes) return normalized;
  let result = '';
  for (const character of normalized) {
    if (Buffer.byteLength(result + character + '…') > maximumBytes) break;
    result += character;
  }
  return `${result}…`;
}
