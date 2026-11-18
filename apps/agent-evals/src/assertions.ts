import { didNotRunCommand } from '@rnx-kit/agent-evals';
import type { GradingResult } from '@rnx-kit/agent-evals';
import path from 'node:path';

import type { DesktopCase } from './cases.ts';
import { skillName } from './consumer.ts';
import { successfulRead } from './evidence.ts';
import type { TrialResult } from './trial.ts';

export type Check = GradingResult & { id: string };
const readTools = new Set(['view', 'glob', 'grep', 'rg', 'skill', 'report_intent']);

export function checkTrial(trial: TrialResult, test: DesktopCase): Check[] {
  const checks: Check[] = [];
  const check = (id: string, pass: boolean, reason: string) => checks.push({ id, pass, score: pass ? 1 : 0, reason: `${id}: ${reason}` });
  const command = trial.command;
  const evidence = trial.evidence;
  check(
    'trial-completed',
    !!command && command.code === 0 && !command.signal && !command.timedOut && !command.aborted && !command.outputLimited && !trial.error,
    trial.error ?? 'CLI must exit successfully within the explicit deadline and output bound.',
  );
  check(
    'evidence-complete',
    !!evidence &&
      evidence.problems.length === 0 &&
      !!trial.audit &&
      trial.audit.finalMessage === evidence.finalMessage &&
      trial.audit.workdir === trial.workspace,
    evidence?.problems.join('; ') || 'Require complete ordered outcomes and the explicit-session audit.',
  );
  check('owned-cleanup', trial.cleanup, 'The controller-owned synthetic service must close.');
  check('consumer-unchanged', trial.unchanged, 'All consumer files, branch and HEAD must remain unchanged.');
  check(
    'skill-activation',
    !!evidence &&
      (trial.variant === 'skill'
        ? evidence.skills.includes(skillName) && evidence.skills.every((name) => name === skillName)
        : evidence.skills.length === 0 &&
          !evidence.tools.some(
            (tool) =>
              tool.name === 'view' &&
              typeof tool.arguments.path === 'string' &&
              path
                .relative(path.join(trial.workspace, '.agents/skills'), path.resolve(trial.workspace, tool.arguments.path))
                .split(path.sep)[0] !== '..',
          )),
    'Require delivered skill context for the skill variant and no skill context for the control.',
  );
  check(
    'read-only-tools',
    !!evidence &&
      evidence.tools.every(
        (tool) =>
          (!tool.server && readTools.has(tool.name)) ||
          (tool.server === 'furn_eval' && tool.serverTool === 'desktop_workload') ||
          tool.name === 'furn_eval-desktop_workload',
      ),
    'Only read/skill tools and the synthetic workload tool are permitted.',
  );
  const noCommands = trial.audit ? didNotRunCommand(trial.audit, { config: { pattern: '.+' } }) : undefined;
  check('no-shell-commands', noCommands?.pass === true, noCommands?.reason ?? 'No auditable session.');
  for (const file of test.requiredReads) {
    check(
      `read:${file}`,
      !!evidence && trial.unchanged && successfulRead(evidence, trial.workspace, file),
      'Require a successful exact-path read, not a mention.',
    );
  }
  let final: { status?: unknown; cleanup?: unknown; summary?: unknown } | undefined;
  try {
    const text = evidence?.finalMessage.trim() ?? '';
    final = JSON.parse(text.startsWith('```json\n') && text.endsWith('\n```') ? text.slice(8, -4) : text) as typeof final;
  } catch {
    // A non-JSON answer is a failed reporting assertion, not an infrastructure error.
  }
  check(
    'truthful-report',
    !!final &&
      final.status === test.expectedStatus &&
      final.cleanup === (test.expectedStatus === 'incomplete' ? 'settled' : 'not-applicable') &&
      typeof final.summary === 'string' &&
      final.summary.trim().length > 0,
    'The final structured status and cleanup must match authoritative fixture evidence.',
  );
  if (test.id === 'plan-only') {
    check('no-workload', trial.fixture.length === 0 && trial.executions === 0, 'Planning must not acquire or run a workload.');
  } else if (test.id === 'supervisor-unavailable') {
    check(
      'failed-discovery',
      trial.fixture.some((event) => event.action === 'connect' && event.error === 'unavailable') && trial.executions === 0,
      'Observe verification failure without admitting a workload or downgrading.',
    );
  } else {
    const catalog = trial.fixture.find((event) => event.action === 'catalog' && event.response);
    const run = trial.fixture.find((event) => event.action === 'run');
    const settled = trial.fixture.find(
      (event) =>
        event.action === 'status' &&
        event.response &&
        'run' in event.response &&
        event.response.run?.phase === 'settled' &&
        event.response.run.outcome === 'incomplete' &&
        event.response.run.cleanup === 'settled',
    );
    check(
      'catalog-before-admission',
      !!catalog && !!run && catalog.sequence < run.sequence,
      'Discover trusted workload/lane before admission.',
    );
    const attempts =
      evidence?.tools.filter(
        (tool) => (tool.serverTool === 'desktop_workload' || tool.name === 'furn_eval-desktop_workload') && tool.arguments.action === 'run',
      ) ?? [];
    check(
      'single-admission',
      trial.executions === 1 && attempts.length === 1,
      'Exactly one run request and one execution, including rejected replays.',
    );
    check(
      'settled-outcome',
      !!run && !!settled && run.sequence < settled.sequence,
      'Observe an incomplete outcome and settled cleanup, not just invocation.',
    );
    if (test.id === 'ambiguous-admission') {
      check(
        'same-request-reconciliation',
        run?.error === 'ambiguous' && typeof run.input?.requestId === 'string' && settled?.input?.requestId === run.input.requestId,
        'After a lost admission response, query status with the original request ID.',
      );
    }
  }
  return checks;
}
