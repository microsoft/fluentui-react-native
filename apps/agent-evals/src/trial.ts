import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AgentRun } from '@rnx-kit/agent-evals';

import { trialPrompt } from './cases.ts';
import type { DesktopCase, Variant } from './cases.ts';
import { isolatedEnvironment, prepareConsumer, snapshot, writeJson } from './consumer.ts';
import { startDesktopFixture } from './desktopFixture.ts';
import type { FixtureEvent } from './desktopFixture.ts';
import { readEvidence } from './evidence.ts';
import type { SessionEvidence } from './evidence.ts';
import { checkedCommand, runCommand } from './process.ts';
import type { CommandResult } from './process.ts';

export type TrialOptions = {
  repository: string;
  output: string;
  model: string;
  reasoningEffort: string;
  timeoutMs: number;
  maxAiCredits: number;
  variant: Variant;
  copilot: string;
  signal?: AbortSignal;
};
export type TrialResult = {
  caseId: DesktopCase['id'];
  variant: Variant;
  sessionId: string;
  directory: string;
  workspace: string;
  baseCommit: string;
  cliVersion: string;
  command?: CommandResult;
  evidence?: SessionEvidence;
  audit?: AgentRun;
  fixture: FixtureEvent[];
  executions: number;
  unchanged: boolean;
  cleanup: boolean;
  error?: string;
};

export function copilotArguments(
  options: TrialOptions,
  test: DesktopCase,
  sessionId: string,
  workspace: string,
  usage: string,
  mcp?: string,
): string[] {
  return [
    '--no-auto-update',
    '--no-custom-instructions',
    '--disable-builtin-mcps',
    '--no-experimental',
    '--no-ask-user',
    '--no-bash-env',
    '--disallow-temp-dir',
    '--sync-session=off',
    '--model',
    options.model,
    '--reasoning-effort',
    options.reasoningEffort,
    '--session-id',
    sessionId,
    '--output-format',
    'json',
    '--usage-output-file',
    usage,
    '--max-ai-credits',
    String(options.maxAiCredits),
    '--excluded-tools',
    'bash',
    'powershell',
    'task',
    'create',
    'edit',
    'apply_patch',
    'ask_user',
    'web_fetch',
    'web_search',
    '--deny-tool=shell',
    '--deny-tool=write',
    '--deny-tool=url',
    '--deny-tool=memory',
    `--allow-tool=read(${workspace.split(path.sep).join('/')}/**)`,
    ...(mcp ? ['--additional-mcp-config', `@${mcp}`, '--allow-tool=furn_eval(desktop_workload)'] : []),
    '--prompt',
    trialPrompt(test),
  ];
}

export async function runTrial(
  options: TrialOptions,
  test: DesktopCase,
  sourceEnv: NodeJS.ProcessEnv = process.env,
  commandPrefix: string[] = [],
): Promise<TrialResult> {
  const sessionId = randomUUID();
  const directory = path.join(options.output, `${test.id}-${options.variant}-${sessionId}`);
  const consumer = await prepareConsumer(options.repository, directory, options.variant, sourceEnv);
  const { workspace, home, baseCommit, hashes } = consumer;
  const env = isolatedEnvironment(home, sourceEnv, true);
  const result: TrialResult = {
    caseId: test.id,
    variant: options.variant,
    sessionId,
    directory,
    workspace,
    baseCommit,
    cliVersion: '',
    fixture: [],
    executions: 0,
    unchanged: false,
    cleanup: false,
  };
  const fixture = test.id === 'plan-only' ? undefined : await startDesktopFixture(test.id);
  try {
    result.cliVersion = await checkedCommand(options.copilot, [...commandPrefix, '--no-auto-update', '--version'], workspace, env);
    const help = await checkedCommand(options.copilot, [...commandPrefix, '--no-auto-update', '--help'], workspace, env);
    for (const flag of ['--max-ai-credits', '--usage-output-file', '--no-custom-instructions', '--disallow-temp-dir', '--sync-session']) {
      if (!help.includes(flag)) throw new Error(`The selected CLI does not support required flag ${flag}.`);
    }
    const mcp = fixture ? path.join(directory, 'mcp.json') : undefined;
    if (mcp) writeJson(mcp, fixture!.config);
    const args = copilotArguments(options, test, sessionId, workspace, path.join(directory, 'usage.json'), mcp);
    writeJson(path.join(directory, 'trial.json'), {
      schemaVersion: 1,
      caseId: test.id,
      sourceCase: test.sourceCase,
      variant: options.variant,
      sessionId,
      sourceCommit: await checkedCommand('git', ['rev-parse', 'HEAD'], options.repository, consumer.environment),
      sourceDirty: (await checkedCommand('git', ['status', '--porcelain'], options.repository, consumer.environment)).length > 0,
      harnessHash: createHash('sha256')
        .update(JSON.stringify(snapshot(path.join(options.repository, 'apps/agent-evals/src'))))
        .update(fs.readFileSync(path.join(options.repository, 'apps/agent-evals/package.json')))
        .update(fs.readFileSync(path.join(options.repository, 'yarn.lock')))
        .digest('hex'),
      baseCommit,
      client: result.cliVersion,
      model: options.model,
      reasoningEffort: options.reasoningEffort,
      timeoutMs: options.timeoutMs,
      maxAiCredits: options.maxAiCredits,
      fixtureKind: 'source-documentation-projection',
      instructionHashes: hashes,
      args,
      confounders: ['Synthetic workload backend; no native authority.', 'Managed CLI policy may still apply.'],
    });
    result.command = await runCommand(options.copilot, [...commandPrefix, ...args], {
      cwd: workspace,
      env,
      timeoutMs: options.timeoutMs,
      signal: options.signal,
    });
    fs.writeFileSync(path.join(directory, 'stdout.jsonl'), result.command.stdout, { mode: 0o600 });
    fs.writeFileSync(path.join(directory, 'stderr.log'), result.command.stderr, { mode: 0o600 });
    writeJson(path.join(directory, 'command.json'), { ...result.command, stdout: undefined, stderr: undefined });
    const eventFile = path.join(env.COPILOT_HOME!, 'session-state', sessionId, 'events.jsonl');
    if (result.command.code !== 0 && !fs.existsSync(eventFile)) {
      throw new Error(`Copilot exited ${result.command.code} before writing a session log; see stderr.log.`);
    }
    result.evidence = readEvidence(eventFile, {
      sessionId,
      workspace,
      baseCommit,
    });
    result.unchanged =
      JSON.stringify(snapshot(workspace)) === JSON.stringify(hashes) &&
      (await checkedCommand('git', ['rev-parse', 'HEAD'], workspace, consumer.environment)) === baseCommit &&
      (await checkedCommand('git', ['branch', '--show-current'], workspace, consumer.environment)) === 'eval';
    if (!result.unchanged) throw new Error('The read-only consumer fixture changed; refusing to audit changed content.');
    const auditFile = path.join(directory, 'audit.json');
    const worker = fileURLToPath(new URL(import.meta.url.endsWith('.ts') ? './audit.ts' : './audit.js', import.meta.url));
    await checkedCommand(process.execPath, [worker, sessionId, auditFile], workspace, consumer.environment);
    result.audit = (JSON.parse(fs.readFileSync(auditFile, 'utf8')) as { output: AgentRun }).output;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Trial infrastructure failed.';
  } finally {
    try {
      await fixture?.close();
      result.cleanup = true;
    } catch {
      result.error = 'Owned synthetic MCP fixture cleanup did not settle.';
    }
    if (fixture) {
      result.fixture = fixture.events;
      result.executions = fixture.executions();
    }
    writeJson(path.join(directory, 'evidence.json'), result);
  }
  return result;
}
