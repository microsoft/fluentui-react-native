import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Command, Option } from 'clipanion';
import { findGitRoot } from 'workspace-tools';

import {
  assessCheckbox,
  formatAssessmentMarkdown,
  object,
  parseEvidenceContext,
  parseNativeReport,
  readCheckboxContract,
  readNativeEvidence,
  reportDigest,
  text,
} from './controlAssessment.ts';
import { assessmentPackagePath, assessmentSpecPath, specAssessmentFor, updateSpecAssessment } from './controlAssessmentSpec.ts';
import { parseUnitContext, readCheckboxUnitMappingFrom } from './controlAssessmentUnit.ts';
import { runCheckboxUnitTests } from './controlAssessmentUnitExecution.ts';

function sameFile(first: string, second: string): boolean {
  if (path.relative(first, second) === '') return true;
  if (!existsSync(first) || !existsSync(second)) return false;
  const firstInfo = statSync(first, { bigint: true });
  const secondInfo = statSync(second, { bigint: true });
  return firstInfo.dev === secondInfo.dev && firstInfo.ino === secondInfo.ino;
}

export class AssessControlCommand extends Command {
  static override paths = [['assess-control']];

  static override usage = Command.Usage({
    description: 'Produce an advisory Checkbox/Win32 assessment from native and JavaScript unit evidence',
    details:
      'Reads existing native/unit reports, or explicitly runs Checkbox runtime tests with --run-unit-tests. Writes assessment.json and assessment.md, preserving skips, provenance, and evidence gaps. --update-spec records a generated SPEC snapshot and linked report. No maturity stage is assigned. See scripts/CONTROL-ASSESSMENT.md.',
    examples: [
      [
        'Assess an existing native report',
        '$0 assess-control --component checkbox --evidence apps/storybook/artifacts/desktop/<run-id>/run.json',
      ],
    ],
  });

  component = Option.String('--component', { required: true, description: 'Pilot component: checkbox' });
  evidence = Option.String('--evidence', {
    description: 'Canonical desktop-test run.json with its Storybook companion, or a historical WDIO/smoke report',
  });
  contextFile = Option.String('--context', {
    description: 'Optional execution-generated provenance sidecar, never synthesized from the current checkout',
  });
  unitEvidence = Option.String('--unit-evidence', { description: 'Jest JSON selecting only checkbox.test.tsx, not type tests' });
  unitContextFile = Option.String('--unit-context', { description: 'Execution-generated unit provenance sidecar' });
  unitBuildId = Option.String('--unit-build-id', { description: 'Expected unit build ID for replayed evidence' });
  runUnitTests = Option.Boolean('--run-unit-tests', false, {
    description: 'Run the declared Checkbox runtime test script and capture fresh unit evidence',
  });
  buildId = Option.String('--build-id', { description: 'Expected test build ID; required to accept bound evidence' });
  targetId = Option.String('--target-id', { description: 'Expected native target instance; required for bound desktop-test evidence' });
  maxAgeHours = Option.String('--max-age-hours', { description: 'Explicit positive evidence-age limit; no default readiness policy' });
  output = Option.String('--output', { description: 'Report directory; defaults to apps/storybook/artifacts/win32/assessment' });
  updateSpec = Option.Boolean('--update-spec', false, {
    description: 'Also write the generated SPEC assessment snapshot and local report',
  });

  async execute() {
    if (this.component !== 'checkbox') throw new Error('This pilot supports only --component checkbox on Win32/Paper.');
    if (this.runUnitTests && (this.unitEvidence !== undefined || this.unitContextFile !== undefined || this.unitBuildId !== undefined)) {
      throw new Error('--run-unit-tests cannot be combined with replayed unit evidence, context, or build ID.');
    }
    if (this.unitContextFile !== undefined && this.unitEvidence === undefined) throw new Error('--unit-context requires --unit-evidence.');
    if (this.unitBuildId !== undefined && this.unitEvidence === undefined) throw new Error('--unit-build-id requires --unit-evidence.');
    const root = findGitRoot(process.cwd());
    const unitRun = this.runUnitTests
      ? runCheckboxUnitTests(root, path.join(root, 'apps', 'storybook', 'artifacts', 'win32', 'assessment-units'))
      : undefined;
    const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const workingTreeDirty =
      execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).length > 0;
    const input = this.evidence === undefined ? undefined : path.resolve(this.evidence);
    const contextFile = this.contextFile === undefined ? undefined : path.resolve(this.contextFile);
    const unitInput = unitRun?.report
      ? path.join(unitRun.directory, 'jest.json')
      : this.unitEvidence === undefined
        ? undefined
        : path.resolve(this.unitEvidence);
    const unitContextFile = unitRun?.context
      ? path.join(unitRun.directory, 'context.json')
      : this.unitContextFile === undefined
        ? undefined
        : path.resolve(this.unitContextFile);
    const content = input === undefined ? undefined : readNativeEvidence(input);
    const specPath = path.join(root, assessmentSpecPath);
    const originalSpec = readFileSync(specPath, 'utf8');
    const report = assessCheckbox({
      contract: readCheckboxContract(root),
      sourceCommit,
      workingTreeDirty,
      now: new Date(),
      report: content === undefined ? undefined : parseNativeReport(JSON.parse(content)),
      reportSha256: content === undefined ? undefined : reportDigest(content),
      context: contextFile === undefined ? undefined : parseEvidenceContext(JSON.parse(readFileSync(contextFile, 'utf8'))),
      expectedBuildId: this.buildId,
      expectedTargetId: this.targetId,
      maxAgeHours: this.maxAgeHours === undefined ? undefined : Number(this.maxAgeHours),
      unit:
        unitRun || unitInput !== undefined
          ? {
              mapping: readCheckboxUnitMappingFrom((file) => readFileSync(path.join(root, file), 'utf8')),
              report: unitRun?.report ?? (unitInput === undefined ? undefined : readFileSync(unitInput, 'utf8')),
              context:
                unitRun?.context ??
                (unitContextFile === undefined ? undefined : parseUnitContext(JSON.parse(readFileSync(unitContextFile, 'utf8')))),
              executionFailure: unitRun?.executionFailure ?? undefined,
              expectedBuildId: unitRun?.context?.buildId ?? this.unitBuildId,
            }
          : undefined,
    });
    const directory =
      this.output === undefined ? path.join(root, 'apps', 'storybook', 'artifacts', 'win32', 'assessment') : path.resolve(this.output);
    const jsonPath = path.join(directory, 'assessment.json');
    const markdownPath = path.join(directory, 'assessment.md');
    const localSummary = path.join(path.dirname(specPath), 'assessment', 'ASSESSMENT.md');
    const outputs = this.updateSpec ? [jsonPath, markdownPath, specPath, localSummary] : [jsonPath, markdownPath];
    for (const output of outputs) {
      if ([input, contextFile, unitInput, unitContextFile].some((file) => file !== undefined && sameFile(file, output))) {
        throw new Error('Assessment output must not overwrite an input report or context.');
      }
    }
    if (sameFile(jsonPath, markdownPath)) throw new Error('Assessment JSON and Markdown must be separate files.');
    for (const output of [jsonPath, markdownPath, ...(this.updateSpec ? [localSummary] : [])]) {
      if (sameFile(output, specPath)) throw new Error('Assessment output must not overwrite the specification.');
    }
    if (this.updateSpec && [jsonPath, markdownPath].some((output) => sameFile(output, localSummary))) {
      throw new Error('Local summary must be separate from the artifact reports.');
    }
    let updatedSpec: string | undefined;
    if (this.updateSpec) {
      for (const file of [specPath, localSummary]) {
        if (existsSync(file) && (!lstatSync(file).isFile() || lstatSync(file).nlink !== 1)) {
          throw new Error('SPEC snapshot destinations must be regular, unlinked files.');
        }
      }
      const manifest = object(JSON.parse(readFileSync(path.join(root, assessmentPackagePath), 'utf8')), 'Component package manifest');
      updatedSpec = updateSpecAssessment(originalSpec, specAssessmentFor(report, text(manifest.version, 'Component package version')));
      mkdirSync(path.dirname(localSummary), { recursive: true });
      if (path.relative(realpathSync(path.dirname(specPath)), realpathSync(path.dirname(localSummary))) !== 'assessment') {
        throw new Error('Local assessment directory must not redirect outside its component.');
      }
    }
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      jsonPath,
      `${JSON.stringify(
        {
          ...report,
          inputs: {
            report: input ?? null,
            context: contextFile ?? null,
            unitReport: unitInput ?? null,
            unitContext: unitContextFile ?? null,
            unitExecuted: this.runUnitTests,
          },
        },
        null,
        2,
      )}\n`,
    );
    writeFileSync(markdownPath, formatAssessmentMarkdown(report));
    if (updatedSpec !== undefined) {
      if (readFileSync(specPath, 'utf8') !== originalSpec)
        throw new Error('SPEC changed during assessment; refusing concurrent overwrite.');
      writeFileSync(
        localSummary,
        `<!-- AUTO-GENERATED LOCAL ASSESSMENT. Not a bound CI publication. -->\n\n${formatAssessmentMarkdown(report)}`,
      );
      writeFileSync(specPath, updatedSpec);
    }
    this.context.stdout.write(
      `Assessment report generated: ${report.assessmentOutcome}; readiness not established (advisory).\n${jsonPath}\n${markdownPath}\n`,
    );
    return unitRun?.exitCode ?? 0;
  }
}
