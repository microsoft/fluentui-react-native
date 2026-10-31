import path from 'node:path';

/**
 * Helpers that let `fluentui-scripts jest` run a subset of a package's tests.
 *
 * The runner hands Jest an explicit list of test files per platform, so Jest's own selection arguments cannot narrow it.
 * These helpers separate the selection arguments from the rest, and match them against the discovered files.
 */

/** How a Jest command line option consumes the arguments that follow it. */
export type JestOptionKind = 'boolean' | 'value' | 'array';

export type JestOption = {
  /** The camelCase name Jest declares, which an alias such as `-o` resolves to. */
  name: string;
  kind: JestOptionKind;
};

/** Every spelling of Jest's options, aliases included, mapped to the option it stands for. */
export type JestOptionTable = ReadonlyMap<string, JestOption>;

/** The part of the `yargsOptions` exported by `jest-cli` that decides argument arity. */
export type JestYargsOptions = Record<string, { alias?: string | string[]; type?: string }>;

export type ParsedJestArgs = {
  /** Test path patterns: bare arguments and `--testPathPattern` values. */
  selectors: string[];
  /** Source files named after `--findRelatedTests`, or undefined when that option is absent. */
  relatedFiles: string[] | undefined;
  /** Change-based selection for Jest to resolve: `-o`, `--changedSince`, and `--findRelatedTests` with its files. */
  changeSelection: string[];
  /** Everything else, forwarded to the test run unchanged. */
  passthrough: string[];
};

export type SelectorContext = {
  /** The package root. Selectors match test paths relative to it. */
  root: string;
  /** The package root relative to the repository root, using `/` separators, or an empty string. */
  repoRelativeRoot: string;
  /** Whether a backslash in a selector is a path separator, as on Windows, instead of a regular expression escape. */
  windows: boolean;
};

const CHANGE_OPTIONS = new Set(['findRelatedTests', 'onlyChanged', 'changedSince', 'lastCommit', 'changedFilesWithAncestor']);
const PATH_PATTERN_OPTIONS = new Set(['testPathPattern', 'testPathPatterns']);

/** Describe how each Jest option consumes arguments, from the `yargsOptions` that Jest exports. */
export function buildJestOptionTable(options: JestYargsOptions): JestOptionTable {
  const table = new Map<string, JestOption>();
  for (const [name, definition] of Object.entries(options)) {
    const kind: JestOptionKind = definition.type === 'boolean' ? 'boolean' : definition.type === 'array' ? 'array' : 'value';
    const option = { name, kind };
    table.set(name, option);
    for (const alias of [definition.alias ?? []].flat()) {
      table.set(alias, option);
    }
  }
  return table;
}

/** Resolve a flag to the Jest option it stands for, whether it is spelled as an alias, in kebab-case, or negated. */
function resolveOption(flag: string, table: JestOptionTable | undefined): JestOption & { negated: boolean } {
  const spelled = flag.replace(/^-+/, '').replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  // `--no-cache` negates `cache`, unless Jest declares the option under its negated spelling.
  const negated = /^no[A-Z]/.test(spelled) && !table?.has(spelled);
  const spelling = negated ? spelled[2].toLowerCase() + spelled.slice(3) : spelled;
  const option = table?.get(spelling);
  return { name: option?.name ?? spelling, kind: option?.kind ?? 'boolean', negated };
}

/**
 * Separate the arguments that choose which tests run from the arguments Jest should receive.
 *
 * Bare arguments are test path selectors wherever they appear, including after options that take no value such as `-u`.
 * Without a Jest option table only leading bare arguments are known to be selectors, since the values of unknown options
 * cannot be told apart from selectors.
 */
export function parseJestArgs(args: readonly string[], table: JestOptionTable | undefined): ParsedJestArgs {
  const bare: string[] = [];
  const patterns: string[] = [];
  const changeSelection: string[] = [];
  const passthrough: string[] = [];
  let hasRelatedFlag = false;
  let sawOption = false;

  // Moves the arguments an option consumes into `into` and returns the index of the last one.
  const consume = (from: number, kind: JestOptionKind, into: string[]): number => {
    let last = from;
    if (kind === 'value' && from + 1 < args.length) {
      into.push(args[++last]);
    } else if (kind === 'array') {
      while (last + 1 < args.length && !args[last + 1].startsWith('-')) {
        into.push(args[++last]);
      }
    }
    return last;
  };

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--') {
      bare.push(...args.slice(index + 1));
      break;
    }
    if (!arg.startsWith('-') || arg === '-') {
      (table || !sawOption ? bare : passthrough).push(arg);
      continue;
    }

    sawOption = true;
    const equals = arg.indexOf('=');
    const { name, kind, negated } = resolveOption(equals < 0 ? arg : arg.slice(0, equals), table);

    if (!negated && PATH_PATTERN_OPTIONS.has(name)) {
      if (equals < 0) {
        index = consume(index, 'array', patterns);
      } else {
        patterns.push(arg.slice(equals + 1));
      }
      continue;
    }

    const target = !negated && CHANGE_OPTIONS.has(name) ? changeSelection : passthrough;
    hasRelatedFlag ||= !negated && name === 'findRelatedTests';
    target.push(arg);
    if (equals < 0) {
      index = consume(index, kind, target);
    }
  }

  // After `--findRelatedTests` the bare arguments are source files, not test path selectors.
  const relatedFiles = hasRelatedFlag ? bare : undefined;
  return {
    selectors: hasRelatedFlag ? patterns : [...bare, ...patterns],
    relatedFiles,
    changeSelection: [...changeSelection, ...(relatedFiles ?? [])],
    passthrough,
  };
}

/** Convert a path to use `/` separators. */
export function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}

/** Express a selector relative to the package, accepting absolute, `./`, and repository-relative paths. */
export function normalizeSelector(selector: string, { root, repoRelativeRoot, windows }: SelectorContext): string {
  if (path.isAbsolute(selector)) {
    return toPosixPath(path.relative(root, selector));
  }
  const text = windows ? selector.replaceAll('\\', '/') : selector;
  if (text.startsWith('./')) {
    return text.slice(2);
  }
  if (repoRelativeRoot && text.startsWith(`${repoRelativeRoot}/`)) {
    return text.slice(repoRelativeRoot.length + 1);
  }
  return text;
}

/**
 * Create a case-insensitive matcher. A selector matches a path that contains it as text or that matches it as a regular
 * expression, as with Jest's own test path patterns.
 */
export function createSelectorMatcher(selector: string): (relativePath: string) => boolean {
  const needle = selector.toLowerCase();
  let pattern: RegExp | undefined;
  try {
    pattern = new RegExp(selector, 'i');
  } catch {
    // An invalid regular expression still works as literal text.
  }
  return (relativePath) => relativePath.toLowerCase().includes(needle) || pattern?.test(relativePath) === true;
}

/** Find the test files that match any selector, and the selectors that match no file at all. */
export function matchTestFiles(
  files: readonly string[],
  selectors: readonly string[],
  context: SelectorContext,
): { matched: Set<string>; unmatched: string[] } {
  const matched = new Set<string>();
  const unmatched: string[] = [];
  const candidates = files.map((file) => ({ file, relative: toPosixPath(path.relative(context.root, file)) }));
  for (const selector of selectors) {
    const matches = createSelectorMatcher(normalizeSelector(selector, context));
    const hits = candidates.filter(({ relative }) => matches(relative));
    if (hits.length === 0) {
      unmatched.push(selector);
    }
    for (const { file } of hits) {
      matched.add(file);
    }
  }
  return { matched, unmatched };
}

/** Read the test paths from the output of `jest --listTests --json`. */
export function parseListedTests(stdout: string): string[] {
  const line = stdout
    .split(/\r?\n/)
    .reverse()
    .find((candidate) => candidate.trim().startsWith('['));
  const parsed: unknown = line === undefined ? undefined : JSON.parse(line);
  if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'string')) {
    throw new Error('Unexpected output from jest --listTests; expected a JSON array of test paths.');
  }
  return parsed as string[];
}
