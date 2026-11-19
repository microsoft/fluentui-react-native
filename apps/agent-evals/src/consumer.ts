import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { Variant } from './cases.ts';
import { checkedCommand } from './process.ts';

export const skillName = 'furn-desktop-testing';
const otherSkills = ['furn-choose-packages', 'furn-component-authoring', 'furn-component-contract-authoring'];
const packageNames = ['desktop-test', 'desktop-driver', 'desktop-mcp'];

export function writeJson(file: string, value: unknown): void {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

export function snapshot(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (directory === root && entry.name === '.git') continue;
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Consumer fixtures must not contain symlinks.');
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile())
        files[path.relative(root, file).split(path.sep).join('/')] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      else throw new Error('Consumer fixtures must contain only regular files and directories.');
    }
  };
  visit(root);
  return files;
}

export function isolatedEnvironment(home: string, source: NodeJS.ProcessEnv, credential = false): NodeJS.ProcessEnv {
  const result: NodeJS.ProcessEnv = {};
  for (const key of [
    'PATH',
    'SystemRoot',
    'ComSpec',
    'PATHEXT',
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'NO_PROXY',
    'http_proxy',
    'https_proxy',
    'no_proxy',
    'NODE_EXTRA_CA_CERTS',
    'SSL_CERT_FILE',
    'SSL_CERT_DIR',
  ]) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  for (const [key, relative] of Object.entries({
    HOME: '.',
    USERPROFILE: '.',
    APPDATA: 'appdata',
    LOCALAPPDATA: 'localappdata',
    XDG_CONFIG_HOME: 'config',
    XDG_CACHE_HOME: 'cache',
    XDG_DATA_HOME: 'data',
    COPILOT_HOME: 'copilot',
    COPILOT_CACHE_HOME: 'copilot-cache',
    GH_CONFIG_DIR: 'gh',
    TMPDIR: 'tmp',
    TMP: 'tmp',
    TEMP: 'tmp',
  })) {
    result[key] = path.join(home, relative);
    fs.mkdirSync(result[key]!, { recursive: true, mode: 0o700 });
  }
  result.GIT_CONFIG_NOSYSTEM = '1';
  result.GIT_CONFIG_GLOBAL = path.join(home, 'gitconfig');
  fs.writeFileSync(result.GIT_CONFIG_GLOBAL, '', { flag: 'a', mode: 0o600 });
  result.COPILOT_TASK_WAIT_TIMEOUT_SECONDS = '0';
  if (credential) {
    if (!source.COPILOT_GITHUB_TOKEN) throw new Error('Live trials require an explicit COPILOT_GITHUB_TOKEN.');
    result.COPILOT_GITHUB_TOKEN = source.COPILOT_GITHUB_TOKEN;
  }
  return result;
}

export async function prepareConsumer(repository: string, directory: string, variant: Variant, env: NodeJS.ProcessEnv) {
  fs.mkdirSync(directory, { mode: 0o700 });
  const canonical = fs.realpathSync(directory);
  fs.mkdirSync(path.join(canonical, 'workspace'), { mode: 0o700 });
  const workspace = fs.realpathSync(path.join(canonical, 'workspace'));
  const home = path.join(canonical, 'home');
  const environment = isolatedEnvironment(home, env);
  const skills = path.join(repository, 'packages/agentic/skills');
  await checkedCommand(
    process.execPath,
    [path.join(skills, 'config/install.mjs'), '--client', 'copilot', '--project', workspace],
    repository,
    environment,
  );
  const dependencies: Record<string, string> = {};
  for (const name of packageNames) {
    const source = path.join(repository, 'packages/agentic', name);
    const target = path.join(workspace, 'node_modules/@fluentui-react-native', name);
    fs.mkdirSync(target, { recursive: true });
    const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8')) as { version: string };
    dependencies[`@fluentui-react-native/${name}`] = manifest.version;
    fs.copyFileSync(path.join(source, 'package.json'), path.join(target, 'package.json'));
    fs.cpSync(path.join(source, 'references'), path.join(target, 'references'), { recursive: true });
  }
  writeJson(path.join(workspace, 'package.json'), {
    name: 'synthetic-desktop-consumer',
    private: true,
    version: '0.0.0',
    scripts: { 'test:desktop': 'desktop-test' },
    devDependencies: dependencies,
  });
  fs.writeFileSync(
    path.join(workspace, 'README.md'),
    [
      '# Synthetic desktop consumer',
      '',
      'This fixture has no native application, helper, driver authority, or Storybook installation.',
      'The application to plan for is FixtureApp: macOS bundle ID org.example.fixtureapp,',
      'Windows package identity FixtureApp.Example. The declared entry point is yarn test:desktop.',
      'Package references are exact source-documentation projections, not installed executable dependencies.',
      'The controller may provide a synthetic MCP workload service. It never grants native authority.',
      '',
    ].join('\n'),
  );
  writeJson(path.join(environment.COPILOT_HOME!, 'settings.json'), {
    autoUpdate: false,
    memory: false,
    disableAllHooks: true,
    defaultPermissionMode: 'manual',
    extensions: { mode: 'disabled' },
    disabledSkills: variant === 'skill' ? otherSkills : [...otherSkills, skillName],
  });
  writeJson(path.join(environment.COPILOT_HOME!, 'config.json'), { trustedFolders: [workspace] });
  const template = path.join(home, 'git-template');
  fs.mkdirSync(template);
  await checkedCommand('git', ['init', '--initial-branch=eval', `--template=${template}`], workspace, environment);
  await checkedCommand('git', ['add', '--force', '.'], workspace, environment);
  await checkedCommand(
    'git',
    [
      '-c',
      'user.name=Agent Eval Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      '-c',
      'commit.gpgsign=false',
      'commit',
      '-m',
      'Seed synthetic fixture',
    ],
    workspace,
    environment,
  );
  const baseCommit = await checkedCommand('git', ['rev-parse', 'HEAD'], workspace, environment);
  const hashes = snapshot(workspace);
  return { workspace, home, environment, baseCommit, hashes };
}
