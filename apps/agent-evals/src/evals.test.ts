import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkTrial } from './assertions.ts';
import { desktopCases } from './cases.ts';
import { isolatedEnvironment, snapshot, writeJson } from './consumer.ts';
import { readEvidence } from './evidence.ts';
import { runCommand } from './process.ts';
import { completeResults, evaluateTrials } from './report.ts';
import { runTrial } from './trial.ts';
import type { TrialOptions } from './trial.ts';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const mock = fileURLToPath(new URL('./test/controlledCopilot.ts', import.meta.url));
const cases = desktopCases(repository);
const temporary = (context: { after: (callback: () => void) => void }) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-agent-evals-test-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
};
const options = (output: string): TrialOptions => ({
  repository,
  output,
  model: 'test-only-no-model',
  reasoningEffort: 'low',
  maxAiCredits: 1,
  timeoutMs: 15_000,
  copilot: process.execPath,
  variant: 'skill',
});

test('isolated environments do not inherit credentials, auto-approval, instructions, or startup hooks', (context) => {
  const root = temporary(context);
  const env = isolatedEnvironment(root, {
    PATH: process.env.PATH,
    GH_TOKEN: 'must-not-copy',
    COPILOT_GITHUB_TOKEN: 'explicit-test-credential',
    COPILOT_ALLOW_ALL: 'true',
    COPILOT_CUSTOM_INSTRUCTIONS_DIRS: '/other',
    NODE_OPTIONS: '--import=untrusted',
    BASH_ENV: '/other',
    COPILOT_SKILLS_DIRS: '/other',
  });
  for (const key of [
    'GH_TOKEN',
    'COPILOT_GITHUB_TOKEN',
    'COPILOT_ALLOW_ALL',
    'COPILOT_CUSTOM_INSTRUCTIONS_DIRS',
    'NODE_OPTIONS',
    'BASH_ENV',
    'COPILOT_SKILLS_DIRS',
  ]) {
    assert.equal(env[key], undefined);
  }
  assert.equal(
    isolatedEnvironment(root, { COPILOT_GITHUB_TOKEN: 'explicit-test-credential' }, true).COPILOT_GITHUB_TOKEN,
    'explicit-test-credential',
  );
  assert.throws(() => isolatedEnvironment(root, {}, true), /explicit COPILOT_GITHUB_TOKEN/);
});

test('controlled subprocess timeout settles even when SIGTERM is ignored', async (context) => {
  const root = temporary(context);
  const env = isolatedEnvironment(path.join(root, 'home'), process.env);
  const result = await runCommand(process.execPath, [mock, '--fixture-mode', 'hang'], { cwd: root, env, timeoutMs: 300 });
  assert.equal(result.timedOut, true);
  assert.notEqual(result.code, 0);
  assert.ok(result.durationMs < 10_000);
});

test(
  'fresh CLI trials exercise real MCP registration and the published audit helper without model calls',
  { timeout: 90_000 },
  async (context) => {
    const root = temporary(context);
    const trials = [];
    for (const testCase of cases) {
      const trial = await runTrial(options(root), testCase, { ...process.env, COPILOT_GITHUB_TOKEN: 'test-only-not-a-real-token' }, [mock]);
      assert.equal(trial.error, undefined);
      assert.equal(trial.audit?.finalMessage, trial.evidence?.finalMessage);
      assert.ok(trial.cleanup);
      assert.ok(trial.unchanged);
      assert.deepEqual(
        checkTrial(trial, testCase).filter((check) => !check.pass),
        [],
      );
      trials.push(trial);
    }
    assert.equal(new Set(trials.map((trial) => trial.sessionId)).size, cases.length);
    const input = path.join(root, 'trials.json');
    const expectedIds = trials.map((trial) => `${trial.caseId}:${trial.variant}`);
    await assert.rejects(evaluateTrials(trials.slice(0, 1), repository, expectedIds), /declared run plan/);
    writeJson(input, { trials, expectedIds });
    const env = isolatedEnvironment(path.join(root, 'report-home'), process.env);
    env.PROMPTFOO_CONFIG_DIR = path.join(root, 'promptfoo');
    env.PROMPTFOO_DISABLE_TELEMETRY = '1';
    env.PROMPTFOO_DISABLE_UPDATE = '1';
    const worker = fileURLToPath(new URL('./report.ts', import.meta.url));
    const report = await runCommand(process.execPath, [worker, input, repository, root], { cwd: root, env, timeoutMs: 30_000 });
    assert.equal(report.code, 0, report.stderr);
    const results = JSON.parse(fs.readFileSync(path.join(root, 'results.json'), 'utf8'));
    assert.equal(results.passed, true);
    assert.equal(results.results.length, cases.length);
    assert.equal(fs.existsSync(path.join(root, 'promptfoo', 'promptfoo.db')), false);
    const ambiguous = trials.find((trial) => trial.caseId === 'ambiguous-admission')!;
    const altered = structuredClone(ambiguous);
    const status = altered.fixture.find((event) => event.action === 'status')!;
    status.input = { action: 'status', requestId: 'different-request' };
    assert.equal(
      checkTrial(
        altered,
        cases.find((candidate) => candidate.id === 'ambiguous-admission')!,
      ).find((check) => check.id === 'same-request-reconciliation')?.pass,
      false,
    );
  },
);

test('negative control uses the same outcome/read assertions without skill activation', { timeout: 30_000 }, async (context) => {
  const root = temporary(context);
  const trial = await runTrial(
    { ...options(root), variant: 'no-skill' },
    cases[0]!,
    { ...process.env, COPILOT_GITHUB_TOKEN: 'test-only' },
    [mock],
  );
  assert.equal(trial.error, undefined);
  assert.deepEqual(trial.evidence?.skills, []);
  assert.deepEqual(
    checkTrial(trial, cases[0]!).filter((check) => !check.pass),
    [],
  );
  const read = trial.evidence!.tools.find((tool) => tool.arguments.path === path.join(trial.workspace, 'README.md'))!;
  const saved = read.result;
  read.result = { content: 'Permission denied; no file content was returned.' };
  assert.equal(checkTrial(trial, cases[0]!).find((check) => check.id === 'read:README.md')?.pass, false);
  read.result = saved;
  trial.evidence!.tools.push({
    id: 'hidden-skill-read',
    name: 'view',
    start: 100,
    end: 101,
    success: true,
    arguments: { path: path.join(trial.workspace, '.agents/skills/furn-desktop-testing/SKILL.md') },
  });
  assert.equal(checkTrial(trial, cases[0]!).find((check) => check.id === 'skill-activation')?.pass, false);
});

test('a successful CLI exit and complete audit cannot turn an incomplete workload into passed', { timeout: 30_000 }, async (context) => {
  const root = temporary(context);
  const testCase = cases.find((candidate) => candidate.id === 'incomplete-workload')!;
  const trial = await runTrial(options(root), testCase, { ...process.env, COPILOT_GITHUB_TOKEN: 'test-only' }, [
    mock,
    '--fixture-mode',
    'wrong-status',
  ]);
  assert.equal(trial.error, undefined);
  assert.equal(trial.command?.code, 0);
  assert.equal(checkTrial(trial, testCase).find((check) => check.id === 'truthful-report')?.pass, false);
  const eventFile = path.join(trial.directory, 'home/copilot/session-state', trial.sessionId, 'events.jsonl');
  const expected = { sessionId: trial.sessionId, workspace: trial.workspace, baseCommit: trial.baseCommit };
  assert.throws(() => readEvidence(eventFile, { ...expected, sessionId: 'not-this-session' }), /does not match/);
  const events = fs.readFileSync(eventFile, 'utf8');
  fs.writeFileSync(eventFile, events.trimEnd());
  assert.throws(() => readEvidence(eventFile, expected), /truncated/);
  const missingCompletion = events
    .split('\n')
    .filter((line) => !line.includes('"tool.execution_complete"'))
    .join('\n');
  fs.writeFileSync(eventFile, missingCompletion);
  assert.ok(readEvidence(eventFile, expected).problems.includes('A tool call never completed.'));
});

test('completeness gate rejects empty, partial, duplicated, skipped and unchecked results', () => {
  const expected = [{ id: 'case:skill', checks: ['check-one'] }];
  const good = {
    testIdx: 0,
    success: true,
    testCase: { metadata: { id: 'case:skill' } },
    gradingResult: { componentResults: [{ pass: true, metadata: { assertionId: 'check-one' } }] },
  };
  assert.equal(completeResults([good], expected), true);
  for (const results of [
    [],
    [good, good],
    [{ ...good, gradingResult: { componentResults: [] } }],
    [{ ...good, success: false, failureReason: 2, error: 'Skipped: no session' }],
    [{ ...good, success: false, failureReason: 2, error: 'Unavailable' }],
  ])
    assert.equal(completeResults(results, expected), false);
  assert.equal(completeResults([], []), false);
  assert.equal(
    completeResults(
      [
        {
          ...good,
          gradingResult: {
            componentResults: [
              { pass: true, metadata: { assertionId: 'check-one' } },
              { pass: true, metadata: { assertionId: 'check-one' } },
            ],
          },
        },
      ],
      [{ id: 'case:skill', checks: ['check-one', 'check-two'] }],
    ),
    false,
  );
});

test('inline skill invocations require the matching delivered content hash and fixture path', (context) => {
  const root = temporary(context);
  const content = '# Synthetic skill context for parser qualification';
  const invocation = {
    type: 'skill.invoked',
    data: { name: 'furn-desktop-testing', path: path.join(root, '.agents/skills/furn-desktop-testing/SKILL.md'), content },
  };
  const delivery = {
    type: 'skill.context_delivered_ref',
    data: { contentId: `sha256:${createHash('sha256').update(content).digest('hex')}` },
  };
  const events = [
    {
      type: 'session.start',
      data: { sessionId: 'parser-test', context: { cwd: root, gitRoot: root, branch: 'eval', headCommit: 'base' } },
    },
    invocation,
    delivery,
    { type: 'assistant.message', data: { content: 'Final synthetic parser response.' } },
  ];
  const file = path.join(root, 'events.jsonl');
  const read = () => {
    fs.writeFileSync(file, `${events.map((event) => JSON.stringify(event)).join('\n')}\n`);
    return readEvidence(file, { sessionId: 'parser-test', workspace: root, baseCommit: 'base' });
  };
  assert.deepEqual(read().skills, ['furn-desktop-testing']);
  delivery.data.contentId = 'sha256:wrong-content';
  assert.deepEqual(read().skills, []);
  invocation.data.path = path.join(root, 'other/SKILL.md');
  assert.ok(read().problems.includes('Skill context came from outside the fixture installation.'));
});

test('immutable consumer snapshots detect new files and reject symlink escapes', (context) => {
  const root = temporary(context);
  const before = snapshot(root);
  fs.writeFileSync(path.join(root, 'new-file'), 'mutation');
  assert.notDeepEqual(snapshot(root), before);
  if (process.platform !== 'win32') {
    fs.symlinkSync(os.tmpdir(), path.join(root, 'escape'));
    assert.throws(() => snapshot(root), /symlinks/);
  }
});

test('public CLI lists cases without model calls and refuses unbudgeted or in-repository runs', async (context) => {
  const root = temporary(context);
  const env = isolatedEnvironment(path.join(root, 'home'), process.env);
  const cli = fileURLToPath(new URL('./cli.ts', import.meta.url));
  const listed = await runCommand(process.execPath, [cli, 'list'], { cwd: root, env, timeoutMs: 15_000 });
  assert.equal(listed.code, 0, listed.stderr);
  assert.equal(listed.stdout.trim().split('\n').length, cases.length);
  const unbudgeted = await runCommand(process.execPath, [cli, 'run'], { cwd: root, env, timeoutMs: 15_000 });
  assert.notEqual(unbudgeted.code, 0);
  assert.match(unbudgeted.stderr, /explicit non-auto model/);
  env.COPILOT_GITHUB_TOKEN = 'test-only-not-a-real-token';
  const unsafe = await runCommand(
    process.execPath,
    [
      cli,
      'run',
      '--model',
      'test-only-no-model',
      '--reasoning-effort',
      'low',
      '--timeout-ms',
      '1000',
      '--max-ai-credits',
      '1',
      '--output',
      repository,
      '--copilot',
      'furn-test-missing-executable',
    ],
    { cwd: root, env, timeoutMs: 15_000 },
  );
  assert.notEqual(unsafe.code, 0);
  assert.match(unsafe.stderr, /outside the repository/);
});
