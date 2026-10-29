import type { ControlAssessment } from './controlAssessment.ts';

export const assessmentSpecPath = 'packages/agentic/components/src/components/checkbox/SPEC.md';
export const assessmentPackagePath = 'packages/agentic/components/package.json';
const begin = '# furn-assessment:begin';
const end = '# furn-assessment:end';
const outcomes = ['failed', 'execution-failed', 'insufficient-evidence'] as const;
const provenances = ['missing', 'unverified', 'matched', 'mismatched', 'stale'] as const;
const healths = ['complete', 'stale', 'blocked'] as const;

type SpecAssessment = {
  packageVersion: string;
  sourceCommit: string;
  testedCommit: string | null;
  dirty: boolean;
  generatedAt: string;
  outcome: (typeof outcomes)[number];
  provenance: (typeof provenances)[number];
  health: (typeof healths)[number];
};

function member<T extends string>(value: unknown, values: readonly T[]): T {
  const result = values.find((entry) => entry === value);
  if (result === undefined) throw new Error('Unsupported generated SPEC assessment value.');
  return result;
}

function validate(value: SpecAssessment): void {
  if (
    typeof value.packageVersion !== 'string' ||
    value.packageVersion.length > 100 ||
    !/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?(?:\+[A-Za-z0-9.-]+)?$/.test(value.packageVersion) ||
    !/^[0-9a-f]{40}$/.test(value.sourceCommit) ||
    typeof value.dirty !== 'boolean' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value.generatedAt) ||
    !Number.isFinite(Date.parse(value.generatedAt)) ||
    new Date(value.generatedAt).toISOString() !== value.generatedAt
  ) {
    throw new Error('Invalid generated SPEC assessment identity.');
  }
  member(value.outcome, outcomes);
  member(value.provenance, provenances);
  member(value.health, healths);
  if (value.testedCommit !== (value.provenance === 'matched' && !value.dirty ? value.sourceCommit : null)) {
    throw new Error('Only matched, clean execution evidence can identify a tested SPEC commit.');
  }
}

function fields(value: SpecAssessment): [string, string | number | boolean | null][] {
  validate(value);
  return [
    ['assessment-schema', 1],
    ['assessment-package-version', value.packageVersion],
    ['assessment-source-commit', value.sourceCommit],
    ['assessment-tested-commit', value.testedCommit],
    ['assessment-dirty', value.dirty],
    ['assessment-target', 'win32-paper-storybook'],
    ['assessment-outcome', value.outcome],
    ['assessment-health', value.health],
    ['assessment-stage', 'not-determined'],
    ['assessment-provenance', value.provenance],
    ['assessment-generated-at', value.generatedAt],
    ['assessment-report', './assessment/ASSESSMENT.md'],
  ];
}

function block(value: SpecAssessment, eol: string): string {
  return [
    begin,
    ...fields(value).map(([key, scalar]) => `${key}: ${typeof scalar === 'string' ? `'${scalar}'` : JSON.stringify(scalar)}`),
    end,
    '',
  ].join(eol);
}

function header(spec: string): { eol: string; close: number } {
  const eol = spec.startsWith('---\r\n') ? '\r\n' : '\n';
  if (spec.length > 1_000_000 || !spec.startsWith(`---${eol}`)) throw new Error('SPEC must start with bounded YAML front matter.');
  const delimiter = `${eol}---`;
  const match = spec.indexOf(`${delimiter}${eol}`, 3);
  const close = match >= 0 ? match + eol.length : spec.endsWith(delimiter) ? spec.length - 3 : -1;
  if (close < 0) throw new Error('SPEC YAML front matter is unterminated.');
  return { eol, close };
}

export function splitSpecAssessment(spec: string): { contract: string; assessment?: SpecAssessment } {
  const { eol, close } = header(spec);
  const start = spec.indexOf(begin);
  const finish = spec.indexOf(end);
  let contract = spec;
  let assessment: SpecAssessment | undefined;
  if (start !== -1 || finish !== -1) {
    const after = finish + end.length + eol.length;
    if (
      start < 3 + eol.length ||
      finish <= start ||
      after > close ||
      spec[start - 1] !== '\n' ||
      spec.slice(finish - eol.length, finish) !== eol ||
      spec.slice(finish + end.length, after) !== eol ||
      spec.indexOf(begin, start + begin.length) !== -1 ||
      spec.indexOf(end, finish + end.length) !== -1
    ) {
      throw new Error('Generated SPEC assessment must be one complete front-matter block.');
    }
    const raw = spec.slice(start, after);
    const values: Record<string, unknown> = Object.create(null);
    for (const line of raw.split(eol).slice(1, -2)) {
      const separator = line.indexOf(': ');
      if (separator < 1) throw new Error('Malformed generated SPEC assessment field.');
      const key = line.slice(0, separator);
      if (Object.hasOwn(values, key)) throw new Error('Duplicate generated SPEC assessment field.');
      const scalar = line.slice(separator + 2);
      values[key] = scalar.startsWith("'") && scalar.endsWith("'") ? scalar.slice(1, -1) : JSON.parse(scalar);
    }
    if (
      values['assessment-schema'] !== 1 ||
      values['assessment-target'] !== 'win32-paper-storybook' ||
      values['assessment-stage'] !== 'not-determined' ||
      values['assessment-report'] !== './assessment/ASSESSMENT.md' ||
      typeof values['assessment-package-version'] !== 'string' ||
      typeof values['assessment-source-commit'] !== 'string' ||
      (values['assessment-tested-commit'] !== null && typeof values['assessment-tested-commit'] !== 'string') ||
      typeof values['assessment-dirty'] !== 'boolean' ||
      typeof values['assessment-generated-at'] !== 'string'
    ) {
      throw new Error('Invalid generated SPEC assessment schema or identity.');
    }
    assessment = {
      packageVersion: values['assessment-package-version'],
      sourceCommit: values['assessment-source-commit'],
      testedCommit: values['assessment-tested-commit'],
      dirty: values['assessment-dirty'],
      generatedAt: values['assessment-generated-at'],
      outcome: member(values['assessment-outcome'], outcomes),
      provenance: member(values['assessment-provenance'], provenances),
      health: member(values['assessment-health'], healths),
    };
    if (block(assessment, eol) !== raw) throw new Error('Generated SPEC assessment is not its exact canonical rendering.');
    contract = spec.slice(0, start) + spec.slice(after);
  }
  if (/^assessment-/m.test(contract.slice(0, header(contract).close))) {
    throw new Error('Assessment fields must appear only in the generated SPEC assessment block.');
  }
  return { contract, assessment };
}

export function updateSpecAssessment(spec: string, assessment: SpecAssessment): string {
  const { contract } = splitSpecAssessment(spec);
  const { eol, close } = header(contract);
  return contract.slice(0, close) + block(assessment, eol) + contract.slice(close);
}

export function specAssessmentFor(report: ControlAssessment, packageVersion: string): SpecAssessment {
  if (
    report.component !== 'checkbox' ||
    report.target.endpoint !== 'win32' ||
    report.target.renderer !== 'paper' ||
    report.target.host !== 'storybook' ||
    report.evidenceSupportedStatus !== null ||
    report.approvedStatus !== null
  ) {
    throw new Error('The SPEC assessment pilot supports only unassigned Checkbox Win32/Paper maturity.');
  }
  const value: SpecAssessment = {
    packageVersion,
    sourceCommit: report.target.sourceCommit,
    testedCommit: report.evidence.status === 'matched' && !report.target.workingTreeDirty ? report.target.sourceCommit : null,
    dirty: report.target.workingTreeDirty,
    generatedAt: report.generatedAt,
    outcome: member(report.assessmentOutcome, outcomes),
    provenance: member(report.evidence.status, provenances),
    health: member(report.assessmentHealth, healths),
  };
  validate(value);
  return value;
}
