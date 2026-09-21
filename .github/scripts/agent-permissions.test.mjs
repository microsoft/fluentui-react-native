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
const shell = (command, toolName = 'bash') => permissionDecision({ cwd, toolName, toolArgs: { command } });

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
