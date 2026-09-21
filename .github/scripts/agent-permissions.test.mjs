import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { permissionDecision } from './agent-permissions.mjs';

const cwd = fileURLToPath(new URL('../..', import.meta.url));
const allow = { permissionDecision: 'allow' };
const shell = (command, toolName = 'bash', directory = cwd) => permissionDecision({ cwd: directory, toolName, toolArgs: { command } });

test('approves repository development commands in Bash and PowerShell', () => {
  for (const tool of ['bash', 'powershell']) {
    for (const command of [
      'yarn',
      'yarn install --immutable',
      'yarn workspace @fluentui-react-native/design test',
      'git --no-pager status --short',
      'git -C packages diff --stat',
      'git add -- AGENTS.md',
      'git commit -m "Add shared permissions"',
      'git branch --show-current',
      'git fetch origin',
      'gh issue list --state open',
      'gh pr checks 123',
      'gh run view 123 --log-failed',
      'gh auth status',
      'gh auth switch --hostname github.com --user example',
      'gh api user --jq .login',
      'gh api --method GET repos/microsoft/fluentui-react-native/actions/runs --paginate',
      'gh api repos/microsoft/fluentui-react-native/issues -XGET',
    ]) {
      assert.deepEqual(shell(command, tool), allow, command);
    }
  }
});

test('approves package-owned native workflows, including workspace changes and native test configuration', () => {
  for (const command of [
    'cd ./apps/storybook && yarn storybook prep --macos',
    'cd ./apps/storybook && yarn storybook --verbose bundle --macos',
    'cd ./apps/storybook && yarn storybook instance --macos',
    'cd ./apps/storybook && yarn desktop-driver doctor --platform macos --permissions',
    'cd ./apps/storybook && yarn desktop-driver agent screenshot --platform macos --url http://127.0.0.1:38662 --target agenticstorybook-macos --artifacts artifacts/macos --name button',
    'cd ./packages/agentic/desktop-driver && yarn format && yarn lint && yarn build && yarn test --runInBand',
  ]) {
    for (const tool of ['bash', 'powershell']) {
      assert.deepEqual(shell(command, tool), allow, command);
    }
  }
  for (const command of [
    'cd ./packages/agentic/desktop-driver && FURN_NATIVE_DRIVER_TEST=1 yarn test --runInBand',
    'FURN_NATIVE_DRIVER_TEST=1 FURN_DESKTOP_DRIVER_BUILD_POLICY=never yarn test',
    'env FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES=physicalClick yarn storybook smoke --macos',
    'env "FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY=FURN Development" yarn storybook build-driver --macos',
  ]) {
    assert.deepEqual(shell(command), allow, command);
  }
  for (const command of [
    'cd .. && yarn',
    'cd ./apps/storybook && yarn build && git reset --hard',
    'cd ./apps/storybook; yarn build',
    'yarn build &&',
    'cd "./apps/story*" && yarn build',
    'env NODE_OPTIONS=--require=other.cjs yarn',
    'env PATH=/tmp yarn',
    'env FURN_NATIVE_DRIVER_TEST=1 node script.mjs',
    '"FURN_NATIVE_DRIVER_TEST=1" yarn',
    'FURN_NATIVE_DRIVER_TEST=1 "FURN_DESKTOP_DRIVER_BUILD_POLICY=never" yarn',
    'FURN_NATIVE_DRIVER_TEST=1 yarn && kill 123',
  ]) {
    assert.deepEqual(shell(command), {}, command);
  }
});

test('does not approve workspace changes that Bash CDPATH could redirect', () => {
  const previous = process.env.CDPATH;
  try {
    process.env.CDPATH = tmpdir();
    assert.deepEqual(shell('cd apps/storybook && yarn'), {});
    assert.deepEqual(shell('cd .github && yarn'), {});
    assert.deepEqual(shell('cd ./apps/storybook && yarn'), allow);
    assert.deepEqual(shell(`cd "${cwd}" && yarn`), allow);
  } finally {
    if (previous === undefined) {
      delete process.env.CDPATH;
    } else {
      process.env.CDPATH = previous;
    }
  }
});

test('approves Pod preparation and named updates only from the owning app or native directory', () => {
  const app = join(cwd, 'apps/storybook');
  for (const command of [
    'pod install --project-directory=macos',
    'pod install --project-directory macos --repo-update --clean-install',
    'pod update React-Core React-Codegen --project-directory=macos --no-repo-update',
    'bundle exec pod install --project-directory=macos --verbose',
    'cd macos && pod install',
    'cd macos && pod update React-Core',
  ]) {
    assert.deepEqual(shell(command, 'bash', app), allow, command);
  }
  assert.deepEqual(shell('pod install', 'bash', join(app, 'macos')), allow);
  for (const command of [
    'pod update --project-directory=macos',
    'pod repo update',
    'pod deintegrate --project-directory=macos',
    'pod cache clean --all',
    'pod install --allow-root --project-directory=macos',
    'pod install --project-directory=../../..',
    'pod install --project-directory=/tmp',
    'pod install --project-directory=/tmp --project-directory=macos',
    'pod install',
    'bundle install',
  ]) {
    assert.deepEqual(shell(command, 'bash', app), {}, command);
  }
  assert.deepEqual(shell('pod install --project-directory=apps/storybook/macos'), {});
});

test('approves read-only listener/process inspection and config-free loopback probes', () => {
  for (const command of [
    'ps -axo pid=,ppid=,command=',
    'ps -p 53501 -o pid=,ppid=,lstart=,command=',
    'lsof -nP -iTCP:31354 -iTCP:22154 -sTCP:LISTEN',
    'lsof -a -p 53501 -d cwd -Fn',
    'curl -q --fail --silent --max-time 8 http://127.0.0.1:38662/status',
    'curl -q -fsS http://localhost:22154/index.json',
    'curl -q --head http://127.0.0.1:31354/status',
  ]) {
    assert.deepEqual(shell(command), allow, command);
    assert.deepEqual(shell(command, 'powershell'), {}, `PowerShell may alias ${command}`);
  }
  for (const command of [
    'ps e',
    'ps -p 123 -o env',
    'lsof',
    'lsof -nP -iTCP:99999',
    'curl -fsS http://127.0.0.1:31354/status',
    'curl -q -L http://127.0.0.1:31354/status',
    'curl -q --output report.json http://127.0.0.1:31354/status',
    'curl -q -X POST http://127.0.0.1:31354/status',
    'curl -q --json data http://127.0.0.1:31354/status',
    'curl -q --config options.txt http://127.0.0.1:31354/status',
    'curl -q http://127.0.0.1:31354/session',
    'curl -q http://127.0.0.1:99999/status',
    'curl -q http://example.com:31354/status',
    'curl -q http://127.0.0.1:31354/status http://example.com/status',
    'kill -TERM 53501',
    'screencapture -x screenshot.png',
    'lldb -p 123',
    'security add-trusted-cert certificate.pem',
    'tccutil reset All',
  ]) {
    assert.deepEqual(shell(command), {}, command);
  }
});

test('unrecognized or destructive operations fall through, rather than denying local approvals', () => {
  for (const command of [
    'git reset --hard',
    'git clean -fd',
    'git checkout -- AGENTS.md',
    'git push --force',
    'git commit --amend',
    'git commit --am',
    'git branch -D main',
    'git fetch --prune origin',
    'git -c alias.foo=reset foo',
    'git diff --output=/tmp/overwrite',
    'git diff --out=/tmp/overwrite',
    'git grep -Osh pattern',
    'git grep --open-files-in-pager=sh pattern',
    'git commit --a*',
    'git commit @options',
    'gh issue close 123',
    'gh run cancel 123',
    'gh auth token',
    'gh auth status --show-token',
    'gh api repos/o/r/issues -X POST',
    'gh api repos/o/r/issues --method=DELETE',
    'gh api repos/o/r/issues -f title=oops',
    'gh api repos/o/r/issues -F title=oops',
    'gh api repos/o/r/issues --input body.json',
    'gh api graphql',
    'gh api https://example.com',
    'gh api user --hostname example.com',
    'yarn install && git reset --hard',
    'yarn install; git reset --hard',
    'yarn install\nrm file',
    'yarn $(touch file)',
    'yarn `touch file`',
    'yarn > file',
    'yarn "foo; rm file"',
    'yarn "unterminated',
    "yarn 'one''two'",
    'yarn # comment',
    'yarnish install',
    'node script.mjs',
  ]) {
    assert.deepEqual(shell(command), {}, command);
  }
});

test('limits file and command approvals to the repository, including new paths and symlinks', () => {
  const external = mkdtempSync(join(tmpdir(), 'furn-permissions-'));
  const local = mkdtempSync(join(cwd, '.permission-test-'));
  try {
    symlinkSync(external, join(local, 'external'), 'dir');
    for (const toolName of ['view', 'create', 'edit', 'str_replace_editor']) {
      assert.deepEqual(permissionDecision({ cwd, toolName, toolArgs: { path: 'new/nested/file.ts' } }), allow);
      for (const path of [external, '../outside.ts', join(local, 'external/new/file.ts')]) {
        assert.deepEqual(permissionDecision({ cwd, toolName, toolArgs: { path } }), {});
      }
    }
    assert.deepEqual(permissionDecision({ cwd: external, toolName: 'bash', toolArgs: { command: 'yarn install' } }), {});
    assert.deepEqual(shell(`git -C "${external}" status`), {});
    assert.deepEqual(shell(`git -C "${local}/external" status`), {});
    assert.deepEqual(shell(`cd "${local}/external" && yarn`), {});
    assert.deepEqual(shell(`cd "${external}" && yarn`), {});
  } finally {
    rmSync(local, { recursive: true });
    rmSync(external, { recursive: true });
  }
});

test('checks every patch path, including move destinations', () => {
  const patch = (body) =>
    permissionDecision({ cwd, toolName: 'apply_patch', toolArgs: { input: `*** Begin Patch\n${body}\n*** End Patch` } });
  assert.deepEqual(patch('*** Add File: new.ts\n+export {};'), allow);
  assert.deepEqual(patch('*** Update File: AGENTS.md\n*** Move to: ../outside.md'), {});
  assert.deepEqual(patch('*** Add File: new.ts\n+ok\n*** Delete File: ../outside.md'), {});
  assert.deepEqual(patch(''), {});
  assert.deepEqual(
    permissionDecision({ cwd, toolName: 'apply_patch', toolArgs: '*** Begin Patch\n*** Add File: new.ts\n+ok\n*** End Patch' }),
    allow,
  );
});

test('supports serialized arguments and leaves unknown tools to normal permissions', () => {
  assert.deepEqual(permissionDecision({ cwd, toolName: 'bash', toolArgs: '{"command":"yarn install"}' }), allow);
  assert.deepEqual(permissionDecision({ cwd, toolName: 'unknown', toolArgs: {} }), {});
  assert.deepEqual(permissionDecision({ cwd, toolName: 'unknown', toolArgs: 'not JSON' }), {});
  assert.deepEqual(permissionDecision({ cwd, toolName: 'bash', toolArgs: {} }), {});
  assert.deepEqual(permissionDecision({ cwd: '.', toolName: 'bash', toolArgs: { command: 'yarn' } }), {});
});

test('hook executable reads stdin and emits a single decision', () => {
  const config = JSON.parse(readFileSync(new URL('../hooks/agent-permissions.json', import.meta.url), 'utf8'));
  assert.equal(config.version, 1);
  const [hook] = config.hooks.preToolUse;
  assert.equal(hook.exec, 'node');
  assert.equal(hook.cwd, '.');
  for (const name of ['bash', 'powershell', 'view', 'create', 'edit', 'str_replace_editor', 'apply_patch']) {
    assert.match(name, new RegExp(`^(?:${hook.matcher})$`));
  }
  const result = spawnSync(process.execPath, hook.args, {
    cwd,
    input: JSON.stringify({ cwd, toolName: 'bash', toolArgs: { command: 'yarn install' } }),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), allow);
  const invalid = spawnSync(process.execPath, hook.args, { cwd, input: '{invalid', encoding: 'utf8' });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /SyntaxError/);
});
