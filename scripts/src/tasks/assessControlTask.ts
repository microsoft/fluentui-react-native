import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Command, Option } from 'clipanion';

import {
  assessControl,
  formatAssessmentMarkdown,
  object,
  parseEvidenceContext,
  parseNativeReport,
  readControlContract,
  readNativeEvidence,
  reportDigest,
  text,
} from '../ci/assessment/controlAssessment.ts';
import { specAssessmentFor, updateSpecAssessment } from '../ci/assessment/controlAssessmentSpec.ts';
import { parseUnitContext, readUnitMappingFrom } from '../ci/assessment/controlAssessmentUnit.ts';
import { runUnitTests } from '../ci/assessment/controlAssessmentUnitExecution.ts';
import { discoverAssessments, unconfiguredControls } from '../ci/assessment/assessmentConfig.ts';
import type { AssessmentDefinition } from '../ci/assessment/assessmentConfig.ts';
import { combineCiEvidence, git } from '../ci/assessment/controlAssessmentCi.ts';
import { formatAssessmentDocument } from '../ci/assessment/assessmentMarkdown.ts';

function sameFile(first: string, second: string): boolean {
  if (path.relative(first, second) === '') return true;
  if (!existsSync(first) || !existsSync(second)) return false;
  const firstInfo = statSync(first, { bigint: true });
  const secondInfo = statSync(second, { bigint: true });
  return firstInfo.dev === secondInfo.dev && firstInfo.ino === secondInfo.ino;
}

export class AssessControlCommand extends Command {
  static override paths = [['assess-components'], ['assess-control']];

  static override usage = Command.Usage({
    description: 'Assess configured package components from existing native and JavaScript unit evidence',
    details:
      'Discovers package-owned assessment mappings and reads existing reports. --run-unit-tests explicitly runs configured runtime tests locally; CI only combines existing evidence. Unconfigured controls are listed, never treated as passes. No maturity stage is assigned. See @fluentui-react-native/components/references/assessments/README.md.',
    examples: [
      [
        'Assess an existing native report',
        '$0 assess-components --component checkbox --evidence apps/storybook/artifacts/desktop/<run-id>/run.json',
      ],
    ],
  });

  component = Option.String('--component', { description: 'Select one configured component; otherwise assess all configured controls' });
  packageDirectory = Option.String('--package', { description: 'Owning package directory; defaults to the current package' });
  list = Option.Boolean('--list', false, { description: 'List configured and unconfigured package controls without assessing them' });
  ci = Option.Boolean('--ci', false, { description: 'Combine existing CI evidence without running tests or editing tracked files' });
  evidence = Option.String('--evidence', {
    description: 'Canonical desktop-test run.json with its Storybook companion, or a historical WDIO/smoke report',
  });
  contextFile = Option.String('--context', {
    description: 'Optional execution-generated provenance sidecar, never synthesized from the current checkout',
  });
  unitEvidence = Option.String('--unit-evidence', { description: 'Existing Jest JSON; only configured runtime suites are mapped' });
  unitContextFile = Option.String('--unit-context', { description: 'Execution-generated unit provenance sidecar' });
  unitBuildId = Option.String('--unit-build-id', { description: 'Expected unit build ID for replayed evidence' });
  runUnitTests = Option.Boolean('--run-unit-tests', false, {
    description: 'Explicitly run the configured runtime tests locally and capture fresh evidence',
  });
  buildId = Option.String('--build-id', { description: 'Expected test build ID; required to accept bound evidence' });
  targetId = Option.String('--target-id', { description: 'Expected native target instance; required for bound desktop-test evidence' });
  maxAgeHours = Option.String('--max-age-hours', { description: 'Explicit positive evidence-age limit; no default readiness policy' });
  output = Option.String('--output', { description: 'Report directory; defaults to apps/storybook/artifacts/win32/assessment' });
  updateSpec = Option.Boolean('--update-spec', false, {
    description: 'Also write the generated SPEC assessment snapshot and local report',
  });

  async execute() {
    const root = git(process.cwd(), ['rev-parse', '--show-toplevel']);
    const packageRoot =
      this.packageDirectory === undefined
        ? this.path[0] === 'assess-components'
          ? process.cwd()
          : undefined
        : path.resolve(this.packageDirectory);
    const configured = discoverAssessments(root, packageRoot);
    const definitions = configured.filter((definition) => this.component === undefined || definition.component === this.component);
    if (!definitions.length) throw new Error('No approved assessment mapping is configured for the requested component/package.');
    if (this.component !== undefined && definitions.length !== 1)
      throw new Error('Component selection is ambiguous; select its package explicitly.');
    const packages = [...new Set(configured.map(({ packagePath }) => packagePath))];
    const inventory = {
      configured: definitions.map(({ component, packagePath, mappingPath }) => ({ component, packagePath, mappingPath })),
      unconfigured: packages.flatMap((packagePath) =>
        unconfiguredControls(path.join(root, packagePath), configured).map((component) => ({
          component,
          packagePath,
          status: 'not-configured',
        })),
      ),
    };
    if (this.list) {
      this.context.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);
      return 0;
    }
    if (inventory.unconfigured.length)
      this.context.stdout.write(
        `Not configured for assessment: ${inventory.unconfigured.map(({ component }) => component).join(', ')}. These are not passes.\n`,
      );
    if (this.ci || process.env.FURN_ASSESSMENT_CI === 'true') {
      if (
        this.runUnitTests ||
        this.updateSpec ||
        this.evidence ||
        this.unitEvidence ||
        this.contextFile ||
        this.unitContextFile ||
        this.output ||
        this.buildId ||
        this.unitBuildId ||
        this.targetId ||
        this.maxAgeHours
      )
        throw new Error(
          'CI assessment consumes only the captured workflow evidence; local execution, replay and tracked writes are not allowed.',
        );
      for (const definition of definitions) combineCiEvidence(root, process.env, new Date(), definition);
      this.context.stdout.write(
        `Assessed ${definitions.length} configured component(s) using existing CI evidence; no tests were rerun.\n`,
      );
      return 0;
    }
    let exitCode = 0;
    for (const definition of definitions) exitCode = Math.max(exitCode, await this.assess(root, definition, definitions.length > 1));
    return exitCode;
  }

  private async assess(root: string, definition: AssessmentDefinition, multiple: boolean) {
    if (this.runUnitTests && (this.unitEvidence !== undefined || this.unitContextFile !== undefined || this.unitBuildId !== undefined)) {
      throw new Error('--run-unit-tests cannot be combined with replayed unit evidence, context, or build ID.');
    }
    if (this.unitContextFile !== undefined && this.unitEvidence === undefined) throw new Error('--unit-context requires --unit-evidence.');
    if (this.unitBuildId !== undefined && this.unitEvidence === undefined) throw new Error('--unit-build-id requires --unit-evidence.');
    const assessmentSpecPath = definition.specPath;
    const assessmentPackagePath = `${definition.packagePath}/package.json`;
    const unitRun = this.runUnitTests
      ? runUnitTests(root, path.join(root, 'apps', 'storybook', 'artifacts', 'win32', 'assessment-units'), undefined, definition)
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
    const report = assessControl({
      contract: readControlContract(root, definition),
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
              mapping: readUnitMappingFrom((file) => readFileSync(path.join(root, file), 'utf8'), definition),
              report: unitRun?.report ?? (unitInput === undefined ? undefined : readFileSync(unitInput, 'utf8')),
              context:
                unitRun?.context ??
                (unitContextFile === undefined ? undefined : parseUnitContext(JSON.parse(readFileSync(unitContextFile, 'utf8')))),
              executionFailure: unitRun?.executionFailure ?? undefined,
              expectedBuildId: unitRun?.context?.buildId ?? this.unitBuildId,
            }
          : undefined,
    });
    const baseDirectory =
      this.output === undefined ? path.join(root, 'apps', 'storybook', 'artifacts', 'win32', 'assessment') : path.resolve(this.output);
    const directory = multiple ? path.join(baseDirectory, definition.packagePath, definition.component) : baseDirectory;
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
    writeFileSync(markdownPath, formatAssessmentDocument(formatAssessmentMarkdown(report), definition.summaryPath));
    if (updatedSpec !== undefined) {
      if (readFileSync(specPath, 'utf8') !== originalSpec)
        throw new Error('SPEC changed during assessment; refusing concurrent overwrite.');
      writeFileSync(
        localSummary,
        formatAssessmentDocument(
          `<!-- AUTO-GENERATED LOCAL ASSESSMENT. Not a bound CI publication. -->\n\n${formatAssessmentMarkdown(report)}`,
          definition.summaryPath,
        ),
      );
      writeFileSync(specPath, updatedSpec);
    }
    this.context.stdout.write(
      `Assessment report generated: ${report.assessmentOutcome}; readiness not established (advisory).\n${jsonPath}\n${markdownPath}\n`,
    );
    return unitRun?.exitCode ?? 0;
  }
}
