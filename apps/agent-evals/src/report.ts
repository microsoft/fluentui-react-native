import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { formatReport, statusOf } from '@rnx-kit/agent-evals/report';
import type { EvalResult } from '@rnx-kit/agent-evals/report';

import { checkTrial } from './assertions.ts';
import type { Check } from './assertions.ts';
import { desktopCases } from './cases.ts';
import { writeJson } from './consumer.ts';
import type { TrialResult } from './trial.ts';

export function completeResults(results: EvalResult[], expected: { id: string; checks: string[] }[]): boolean {
  return (
    expected.length > 0 &&
    results.length === expected.length &&
    expected.every((test, index) => {
      const matches = results.filter((result) => result.testIdx === index && result.testCase?.metadata?.id === test.id);
      const result = matches[0];
      return (
        matches.length === 1 &&
        !!result &&
        test.checks.length > 0 &&
        new Set(test.checks).size === test.checks.length &&
        statusOf(result) === 'passed' &&
        result.gradingResult?.componentResults?.length === test.checks.length &&
        test.checks.every(
          (id) =>
            result.gradingResult!.componentResults!.filter(
              (component) => component.metadata?.assertionId === id && component.pass === true && !component.metadata?.graderError,
            ).length === 1,
        )
      );
    })
  );
}

export async function evaluateTrials(trials: TrialResult[], repository: string, expectedIds: string[]) {
  if (!trials.length) throw new Error('An empty eval suite cannot pass.');
  if (
    expectedIds.length !== trials.length ||
    new Set(expectedIds).size !== expectedIds.length ||
    expectedIds.some((id) => !trials.some((trial) => `${trial.caseId}:${trial.variant}` === id))
  ) {
    throw new Error('Recorded trials do not match the nonempty declared run plan.');
  }
  const cases = desktopCases(repository);
  const rows = trials.map((trial) => {
    const test = cases.find((candidate) => candidate.id === trial.caseId);
    if (!test) throw new Error('Unknown eval case.');
    const command = trial.command;
    const unchecked =
      !!trial.error ||
      !trial.audit ||
      !trial.evidence ||
      trial.evidence.problems.length > 0 ||
      !command ||
      command.code !== 0 ||
      !!command.signal ||
      command.aborted ||
      command.timedOut ||
      command.outputLimited;
    return { id: `${trial.caseId}:${trial.variant}`, trial, unchecked, checks: checkTrial(trial, test) };
  });
  if (new Set(rows.map((row) => row.id)).size !== rows.length) throw new Error('Duplicate case/variant results.');
  const { evaluate } = await import('promptfoo');
  const evaluation = await evaluate(
    {
      description: 'Synthetic furn-desktop-testing CLI trials',
      prompts: ['{{trialId}}'],
      providers: [
        {
          id: () => 'recorded-copilot-cli-trial',
          callApi: async (_prompt, context) => {
            const row = rows.find((candidate) => candidate.id === context?.vars.trialId);
            if (!row) return { error: 'Missing controlled trial.' };
            return row.unchecked
              ? { error: `Controlled trial was not fully evaluable: ${row.trial.error ?? 'missing, failed or incomplete CLI evidence'}` }
              : { output: row.id };
          },
        },
      ],
      tests: rows.map((row) => ({
        description: row.id,
        vars: { trialId: row.id },
        metadata: { id: row.id },
        assert: row.checks.map((check) => ({
          type: 'javascript' as const,
          metric: check.id,
          value: (output: string) => ({
            ...(output === row.id ? check : { pass: false, score: 0, reason: 'Wrong trial identity.' }),
            metadata: { assertionId: check.id },
          }),
        })),
      })),
      sharing: false,
      writeLatestResults: false,
    },
    { cache: false, maxConcurrency: 1, showProgressBar: false },
  );
  const summary = await evaluation.toEvaluateSummary();
  const normalized: EvalResult[] = summary.results.map((result) => ({
    testIdx: result.testIdx,
    success: result.success,
    error: result.error ?? undefined,
    failureReason: result.failureReason,
    testCase: { description: result.testCase?.description, metadata: result.testCase?.metadata },
    gradingResult: result.gradingResult
      ? {
          reason: result.gradingResult.reason,
          componentResults: result.gradingResult.componentResults?.map((component) => ({
            pass: component.pass,
            reason: component.reason,
            metadata: component.metadata,
          })),
        }
      : result.gradingResult,
  }));
  const expected = rows.map((row) => ({ id: row.id, checks: row.checks.map((check) => check.id) }));
  return {
    passed: completeResults(normalized, expected),
    report: formatReport(normalized),
    checks: Object.fromEntries(
      rows.map((row) => [
        row.id,
        row.checks.map((check) => ({
          ...check,
          status: row.unchecked ? 'not-run' : check.pass ? 'pass' : 'fail',
        })),
      ]),
    ) as Record<string, (Check & { status: 'pass' | 'fail' | 'not-run' })[]>,
    results: summary.results,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const [input, repository, output] = process.argv.slice(2);
  if (!input || !repository || !output) throw new Error('The report worker requires trials, repository and output.');
  const plan = JSON.parse(fs.readFileSync(input, 'utf8')) as { trials: TrialResult[]; expectedIds: string[] };
  const result = await evaluateTrials(plan.trials, repository, plan.expectedIds);
  writeJson(path.join(output, 'results.json'), result);
  fs.writeFileSync(path.join(output, 'report.txt'), `${result.report}\n`, { mode: 0o600 });
  if (!result.passed) process.exitCode = 1;
}
