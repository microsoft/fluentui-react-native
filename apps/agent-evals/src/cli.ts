import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { desktopCases } from './cases.ts';
import type { Variant } from './cases.ts';
import { isolatedEnvironment, writeJson } from './consumer.ts';
import { runCommand } from './process.ts';
import { runTrial } from './trial.ts';
import type { TrialResult } from './trial.ts';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const usage = `Usage:
  yarn agent-evals list
  yarn agent-evals run --model <id> --reasoning-effort <level> --timeout-ms <ms>
    --max-ai-credits <per-trial limit> --output <new private directory outside the repository>
    [--case <id>] [--variant skill|no-skill] [--copilot <executable>]

run makes metered Copilot calls. COPILOT_GITHUB_TOKEN must be supplied explicitly.
No live trials run during build, lint or test. These are synthetic, not native, evaluations.`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      model: { type: 'string' },
      'reasoning-effort': { type: 'string' },
      'timeout-ms': { type: 'string' },
      'max-ai-credits': { type: 'string' },
      output: { type: 'string' },
      case: { type: 'string', multiple: true },
      variant: { type: 'string', default: 'skill' },
      copilot: { type: 'string', default: 'copilot' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  const cases = desktopCases(repository);
  if (values.help || positionals.length === 0) {
    console.log(usage);
    return;
  }
  if (positionals.length === 1 && positionals[0] === 'list') {
    for (const test of cases) console.log(`${test.id}\tdevelopment\t${test.expectedStatus}`);
    return;
  }
  if (positionals.length !== 1 || positionals[0] !== 'run') throw new Error(usage);
  const timeoutMs = Number(values['timeout-ms']);
  const maxAiCredits = Number(values['max-ai-credits']);
  if (
    !values.model ||
    values.model.trim().toLowerCase() === 'auto' ||
    !values['reasoning-effort'] ||
    !['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'].includes(values['reasoning-effort']) ||
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > 2_147_483_647 ||
    !Number.isFinite(maxAiCredits) ||
    maxAiCredits <= 0 ||
    !values.output ||
    !['skill', 'no-skill'].includes(values.variant)
  ) {
    throw new Error(
      'Supply an explicit non-auto model, supported reasoning effort, positive timeout/credit limit, output and valid variant.',
    );
  }
  if (!process.env.COPILOT_GITHUB_TOKEN) throw new Error('Set COPILOT_GITHUB_TOKEN explicitly; account credentials are not copied.');
  const selected = values.case ? cases.filter((test) => values.case!.includes(test.id)) : cases;
  if (
    !selected.length ||
    values.case?.some((id) => !cases.some((test) => test.id === id)) ||
    new Set(values.case).size !== (values.case?.length ?? 0)
  )
    throw new Error('Unknown, empty or duplicate case selection.');
  const requested = path.resolve(values.output);
  const output = path.join(fs.realpathSync(path.dirname(requested)), path.basename(requested));
  const relative = path.relative(fs.realpathSync(repository), output);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))) {
    throw new Error('Raw eval evidence must be outside the repository.');
  }
  fs.mkdirSync(output, { mode: 0o700 });
  const expectedIds = selected.map((test) => `${test.id}:${values.variant}`);
  writeJson(path.join(output, 'plan.json'), { schemaVersion: 1, expectedIds });
  const trials: TrialResult[] = [];
  const controller = new AbortController();
  const abort = () => controller.abort();
  process.once('SIGINT', abort);
  process.once('SIGTERM', abort);
  try {
    for (const test of selected) {
      if (controller.signal.aborted) break;
      console.log(`Running ${test.id}:${values.variant}`);
      trials.push(
        await runTrial(
          {
            repository,
            output,
            model: values.model,
            reasoningEffort: values['reasoning-effort'],
            timeoutMs,
            maxAiCredits,
            variant: values.variant as Variant,
            copilot: values.copilot,
            signal: controller.signal,
          },
          test,
        ),
      );
    }
    const input = path.join(output, 'trials.json');
    writeJson(input, { expectedIds, trials });
    const env = isolatedEnvironment(path.join(output, 'report-home'), process.env);
    env.PROMPTFOO_CONFIG_DIR = path.join(output, 'promptfoo');
    env.PROMPTFOO_DISABLE_TELEMETRY = '1';
    env.PROMPTFOO_DISABLE_UPDATE = '1';
    const worker = fileURLToPath(new URL(import.meta.url.endsWith('.ts') ? './report.ts' : './report.js', import.meta.url));
    const report = await runCommand(process.execPath, [worker, input, repository, output], { cwd: output, env, timeoutMs: 60_000 });
    fs.writeFileSync(path.join(output, 'report-worker.log'), report.stderr, { mode: 0o600 });
    if (fs.existsSync(path.join(output, 'report.txt'))) console.log(fs.readFileSync(path.join(output, 'report.txt'), 'utf8'));
    if (controller.signal.aborted || trials.length !== selected.length || report.code !== 0 || report.timedOut || report.outputLimited)
      process.exitCode = 1;
    console.log(`Private evidence: ${output}`);
  } finally {
    process.removeListener('SIGINT', abort);
    process.removeListener('SIGTERM', abort);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Eval failed.');
  process.exitCode = 1;
}
