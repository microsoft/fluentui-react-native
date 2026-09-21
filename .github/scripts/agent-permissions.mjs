import { existsSync, realpathSync } from 'node:fs';
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
const nativeDriverEnvironment = new Set([
  'FURN_NATIVE_DRIVER_TEST',
  'FURN_DESKTOP_DRIVER_BUILD_POLICY',
  'FURN_DESKTOP_DRIVER_CACHE_ROOT',
  'FURN_DESKTOP_DRIVER_INSTALL_ROOT',
  'FURN_DESKTOP_DRIVER_CONFIGURATION',
  'FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY',
  'FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES',
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

function allowPods(args, cwd) {
  const [action, ...options] = args;
  if (action !== 'install' && action !== 'update') {
    return false;
  }
  let project = cwd;
  let hasProjectDirectory = false;
  let podCount = 0;
  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    if (option === '--project-directory' || option.startsWith('--project-directory=')) {
      const directory = option === '--project-directory' ? options[++index] : option.slice('--project-directory='.length);
      if (!directory || hasProjectDirectory) {
        return false;
      }
      hasProjectDirectory = true;
      project = resolve(cwd, directory);
    } else if (
      !['--repo-update', '--no-repo-update', '--deployment', '--clean-install', '--verbose', '--silent', '--no-ansi'].includes(option)
    ) {
      if (action !== 'update' || !/^[A-Za-z][A-Za-z0-9_.+-]*(?:\/[A-Za-z0-9_.+-]+)*$/.test(option)) {
        return false;
      }
      podCount++;
    }
  }
  if ((action === 'update' && podCount === 0) || !isWithinRepository(project, cwd) || !existsSync(resolve(project, 'Podfile'))) {
    return false;
  }
  const nativeRoot = realpathSync(project);
  const workingRoot = realpathSync(cwd);
  return (
    /^apps\/[^/]+\/(?:ios|macos)$/.test(relative(repositoryRoot, nativeRoot).split(sep).join('/')) &&
    (workingRoot === nativeRoot || workingRoot === dirname(nativeRoot))
  );
}

function allowProcessInspection(executable, args) {
  if (executable === 'ps') {
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (['-a', '-x', '-ax'].includes(arg)) {
        continue;
      }
      if (arg === '-p' && /^[1-9]\d*(?:,[1-9]\d*)*$/.test(args[index + 1] ?? '')) {
        index++;
      } else if (
        ['-o', '-axo'].includes(arg) &&
        /^(?:(?:pid|ppid|lstart|etime|stat|comm|command|args|user|uid|pcpu|pmem)=?,?)+$/.test(args[index + 1] ?? '')
      ) {
        index++;
      } else {
        return false;
      }
    }
    return true;
  }
  if (executable === 'lsof') {
    let selected = false;
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (['-nP', '-n', '-P', '-a', '-Fn', '-sTCP:LISTEN'].includes(arg)) {
        continue;
      }
      if (/^-iTCP:[1-9]\d{0,4}$/.test(arg) && Number(arg.slice('-iTCP:'.length)) <= 65535) {
        selected = true;
      } else if (arg === '-p' && /^[1-9]\d*$/.test(args[index + 1] ?? '')) {
        selected = true;
        index++;
      } else if (arg === '-d' && ['cwd', 'txt'].includes(args[index + 1])) {
        index++;
      } else {
        return false;
      }
    }
    return selected;
  }
  return false;
}

function allowLoopbackProbe(args) {
  // Ignore ~/.curlrc so a status probe cannot inherit uploads, redirects, or output files.
  if (args[0] !== '-q') {
    return false;
  }
  let url;
  for (let index = 1; index < args.length; index++) {
    const arg = args[index];
    if (['--fail', '--silent', '--show-error', '--head'].includes(arg) || /^-[fsSI]+$/.test(arg)) {
      continue;
    }
    if (['--max-time', '--connect-timeout'].includes(arg) && /^[1-9]\d*$/.test(args[index + 1] ?? '')) {
      index++;
      continue;
    }
    const match = /^http:\/\/(?:127\.0\.0\.1|localhost):([1-9]\d{0,4})\/(?:status|index\.json)$/.exec(arg);
    if (url || !match || Number(match[1]) > 65535) {
      return false;
    }
    url = arg;
  }
  return !!url;
}

function allowCommand(command, cwd, toolName) {
  const words = commandWords(command);
  if (!words?.length) {
    return false;
  }
  const [executable, ...args] = words;
  if (executable === 'yarn') {
    return true;
  }
  if (toolName === 'bash') {
    const environment = executable === 'env' ? args : words;
    const yarnIndex = environment.indexOf('yarn');
    if (
      yarnIndex > 0 &&
      (executable === 'env' || /^(?:FURN_[A-Z_]+=[^\s"'#]+\s+)+yarn(?:\s|$)/.test(command)) &&
      environment.slice(0, yarnIndex).every((arg) => nativeDriverEnvironment.has(arg.split('=')[0]) && arg.includes('='))
    ) {
      return true;
    }
  }
  if (executable === 'pod') {
    return allowPods(args, cwd);
  }
  if (executable === 'bundle' && args[0] === 'exec' && args[1] === 'pod') {
    return allowPods(args.slice(2), cwd);
  }
  if (executable === 'ps' || executable === 'lsof') {
    return toolName === 'bash' && allowProcessInspection(executable, args);
  }
  if (executable === 'curl') {
    return toolName === 'bash' && allowLoopbackProbe(args);
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

function allowShell(command, cwd, toolName) {
  if (typeof command !== 'string') {
    return false;
  }
  // Each && segment must independently qualify; no pipelines, substitutions, or other shell syntax.
  const commands = command.split('&&').map((part) => part.trim());
  let ranCommand = false;
  for (const part of commands) {
    const words = commandWords(part);
    if (words?.[0] === 'cd' && words.length === 2 && !words[1].startsWith('-') && !/[*?[\]]/.test(words[1])) {
      if (toolName === 'bash' && process.env.CDPATH && !isAbsolute(words[1]) && !/^\.{1,2}(?:\/|$)/.test(words[1])) {
        return false;
      }
      const directory = resolve(cwd, words[1]);
      if (!existsSync(directory) || !isWithinRepository(directory, cwd)) {
        return false;
      }
      cwd = realpathSync(directory);
    } else if (allowCommand(part, cwd, toolName)) {
      ranCommand = true;
    } else {
      return false;
    }
  }
  return ranCommand;
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
    allowed = allowShell(args.command, cwd, toolName);
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
