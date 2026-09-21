import { realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = realpathSync(fileURLToPath(new URL('../..', import.meta.url)));
const readOnlyGitCommands = new Set(['status', 'diff', 'log', 'show', 'ls-files', 'ls-tree', 'rev-parse', 'describe', 'blame', 'grep']);
const approvedGitHubCommands = new Set([
  'issue list',
  'issue view',
  'issue status',
  'pr list',
  'pr view',
  'pr status',
  'pr diff',
  'pr checks',
  'run list',
  'run view',
  'run watch',
  'workflow list',
  'workflow view',
  'repo view',
  'auth status',
  'auth switch',
]);

function isWithinRepository(path, cwd) {
  let absolute = resolve(cwd, path);
  // Resolve existing ancestors too, so a new file beneath an external symlink is not approved.
  for (;;) {
    try {
      absolute = realpathSync(absolute);
      break;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      const parent = dirname(absolute);
      if (parent === absolute) {
        return false;
      }
      absolute = parent;
    }
  }
  const fromRoot = relative(repositoryRoot, absolute);
  return fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

function commandWords(command) {
  // Deliberately accept only simple commands shared by Bash and PowerShell, not a shell language.
  if (typeof command !== 'string' || /[;&|<>$`(){}\r\n\\]/.test(command)) {
    return undefined;
  }
  const words = [];
  const token = /(?:^|\s+)("[^"]*"|'[^']*'|[^\s"'#]+)(?=\s|$)/gy;
  let offset = 0;
  while (offset < command.length) {
    token.lastIndex = offset;
    const match = token.exec(command);
    if (!match) {
      return command.slice(offset).trim() === '' ? words : undefined;
    }
    const word = match[1];
    if (
      !word.startsWith('"') &&
      !word.startsWith("'") &&
      (/[*?[\]~]/.test(word) || (word.startsWith('@') && !/^@[a-z\d-]+\/[a-z\d._-]+$/i.test(word)))
    ) {
      return undefined;
    }
    words.push(word.startsWith('"') || word.startsWith("'") ? word.slice(1, -1) : word);
    offset = token.lastIndex;
  }
  return words;
}

function allowGit(args, cwd) {
  while (args.length) {
    if (args[0] === '--no-pager' || args[0] === '--literal-pathspecs') {
      args = args.slice(1);
    } else if (args[0] === '-C' && args[1] && isWithinRepository(args[1], cwd)) {
      cwd = resolve(cwd, args[1]);
      args = args.slice(2);
    } else {
      break;
    }
  }
  const [subcommand, ...options] = args;
  const externalOptions = ['--output', '--ext-diff', '--textconv', '--open-files-in-pager'];
  if (
    options.some(
      (arg) =>
        (arg.startsWith('--') && arg !== '--' && externalOptions.some((option) => option.startsWith(arg.split('=')[0]))) ||
        (subcommand === 'grep' && arg.startsWith('-O')),
    )
  ) {
    return false;
  }
  if (readOnlyGitCommands.has(subcommand) || subcommand === 'add') {
    return true;
  }
  if (subcommand === 'commit') {
    // Git accepts abbreviated long options, including --am for --amend.
    return !options.some((arg) => arg.startsWith('--') && '--amend'.startsWith(arg.split('=')[0]));
  }
  if (subcommand === 'branch') {
    return options.every((arg) => ['--show-current', '--list', '-a', '--all', '-r', '--remotes', '-v', '-vv'].includes(arg));
  }
  if (subcommand === 'fetch') {
    return options.every((arg) =>
      ['--all', '--tags', '--no-tags', '--no-prune', '--dry-run', '--verbose', '--quiet', 'origin'].includes(arg),
    );
  }
  return false;
}

function allowGitHubApi(args) {
  let endpoint;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (['--paginate', '--slurp', '--silent', '--include'].includes(arg)) {
      continue;
    }
    if (['--method', '-X', '--jq', '-q', '--hostname'].includes(arg)) {
      const value = args[++index];
      if (!value || ((arg === '--method' || arg === '-X') && value !== 'GET') || (arg === '--hostname' && value !== 'github.com')) {
        return false;
      }
      continue;
    }
    if (arg === '--method=GET' || arg === '-XGET' || arg === '--hostname=github.com' || arg.startsWith('--jq=')) {
      continue;
    }
    if (arg.startsWith('-') || endpoint) {
      return false;
    }
    endpoint = arg;
  }
  // Field/input options can implicitly turn GET into POST. GraphQL can contain mutations.
  return !!endpoint && /^(?:\/?user(?:\/|\?|$)|\/?repos\/|\/?search\/)/.test(endpoint) && !endpoint.includes('://');
}

function allowShell(command, cwd) {
  const words = commandWords(command);
  if (!words?.length) {
    return false;
  }
  const [executable, ...args] = words;
  if (executable === 'yarn') {
    return true;
  }
  if (executable === 'git') {
    return allowGit(args, cwd);
  }
  if (executable !== 'gh') {
    return false;
  }
  if (args[0] === 'api') {
    return allowGitHubApi(args.slice(1));
  }
  return approvedGitHubCommands.has(args.slice(0, 2).join(' ')) && !args.some((arg) => arg.startsWith('--show-token'));
}

function patchPaths(patch) {
  if (typeof patch !== 'string' || !patch.startsWith('*** Begin Patch\n') || !patch.trimEnd().endsWith('*** End Patch')) {
    return [];
  }
  return [...patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map((match) => match[1]);
}

export function permissionDecision(input) {
  const { cwd, toolName } = input;
  if (!['bash', 'powershell', 'view', 'create', 'edit', 'str_replace_editor', 'apply_patch'].includes(toolName)) {
    return {};
  }
  if (typeof cwd !== 'string' || !isAbsolute(cwd) || !isWithinRepository(cwd, repositoryRoot)) {
    return {};
  }
  const args =
    toolName === 'apply_patch' && typeof input.toolArgs === 'string' && input.toolArgs.startsWith('*** Begin Patch\n')
      ? { input: input.toolArgs }
      : typeof input.toolArgs === 'string'
        ? JSON.parse(input.toolArgs)
        : input.toolArgs;
  if (!args || typeof args !== 'object') {
    return {};
  }
  let allowed = false;
  if (['bash', 'powershell'].includes(toolName)) {
    allowed = allowShell(args.command, cwd);
  } else if (['view', 'create', 'edit', 'str_replace_editor'].includes(toolName)) {
    allowed = typeof args.path === 'string' && isWithinRepository(args.path, cwd);
  } else if (toolName === 'apply_patch') {
    const paths = patchPaths(args.input ?? args.patch);
    allowed = paths.length > 0 && paths.every((path) => isWithinRepository(path, cwd));
  }
  return allowed ? { permissionDecision: 'allow' } : {};
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  process.stdout.write(`${JSON.stringify(permissionDecision(JSON.parse(input)))}\n`);
}
