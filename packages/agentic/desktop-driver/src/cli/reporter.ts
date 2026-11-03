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

export function resolveDesktopReporterMode(options: DesktopReporterModeOptions = {}): ResolvedDesktopReporterMode {
  const configured = options.flag ?? options.environment ?? options.configured ?? 'auto';
  if (!desktopReporterModes.includes(configured as DesktopReporterMode)) {
    throw Object.assign(new TypeError(`Reporter must be one of ${desktopReporterModes.join(', ')}. Received "${configured}".`), {
      code: 'config',
    });
  }
  if (configured !== 'auto') return configured as ResolvedDesktopReporterMode;
  return (options.githubActions ?? process.env.GITHUB_ACTIONS === 'true') ? 'github-actions' : 'plain';
}

export function resolveDesktopEventLevel(options: { flag?: string; environment?: string; configured?: string } = {}): DesktopEventLevel {
  const configured = options.flag ?? options.environment ?? options.configured ?? 'milestones';
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

export function projectDesktopCliError(error: unknown): DesktopCliError {
  const candidate = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
  const code: DesktopCliErrorCode = candidate?.startsWith('commander.')
    ? 'usage'
    : isDesktopCliErrorCode(candidate)
      ? candidate
      : 'internal';
  const message = error instanceof Error ? error.message : String(error);
  return { schemaVersion: 1, type: 'error', error: { code, message: clipReporterText(message, 1024) } };
}

export function formatDesktopReporterError(mode: ResolvedDesktopReporterMode, error: unknown): string {
  return formatDesktopReporterValue(mode, projectDesktopCliError(error));
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
