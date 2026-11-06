import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import rawCatalog from './input-tests.win32.json' with { type: 'json' };

export type InputMode = 'accessibility' | 'physical';
export type InputTest = {
  storyId: string;
  testName: string;
  mode: InputMode | 'both';
  quarantineReason?: string;
};

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(appRoot, '..', '..');
const catalogPath = path.join(appRoot, 'input-tests.win32.json');
const artifactsRoot = path.join(appRoot, 'artifacts', 'desktop');
const coverageRoot = path.join(appRoot, 'artifacts', 'win32');

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an input-coverage object.');
  return value as Record<string, unknown>;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Expected an input-coverage array.');
  return value;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Expected a non-empty input-coverage string.');
  return value;
}

function identity(test: Pick<InputTest, 'storyId' | 'testName'>): string {
  return JSON.stringify([test.storyId, test.testName]);
}

export function readInputMode(value = process.env.STORYBOOK_INPUT_MODE): InputMode | undefined {
  if (value === undefined || value === '') return undefined;
  if (value !== 'accessibility' && value !== 'physical') throw new Error('STORYBOOK_INPUT_MODE must be accessibility or physical.');
  return value;
}

export function parseInputCatalog(value: unknown = rawCatalog): InputTest[] {
  const catalog = object(value);
  if (catalog.schemaVersion !== 1 || catalog.endpoint !== 'win32') throw new Error('Unsupported Win32 input-test catalog.');
  const tests = array(catalog.stories).flatMap((entry) => {
    const story = object(entry);
    const storyId = text(story.storyId);
    if (Object.keys(story).some((key) => !['storyId', 'accessibility', 'physical', 'both'].includes(key))) {
      throw new Error(`Unknown input-mode declaration for ${storyId}.`);
    }
    const result = (['accessibility', 'physical', 'both'] as const).flatMap((mode) =>
      story[mode] === undefined ? [] : array(story[mode]).map((name): InputTest => ({ storyId, testName: text(name), mode })),
    );
    if (!result.length) throw new Error(`No input tests declared for ${storyId}.`);
    return result;
  });
  if (!tests.length || new Set(tests.map(identity)).size !== tests.length) {
    throw new Error('Input-test catalog must have unique callback identities.');
  }
  const quarantines = new Set<string>();
  for (const entry of array(catalog.quarantines)) {
    const quarantine = object(entry);
    const key = identity({ storyId: text(quarantine.storyId), testName: text(quarantine.testName) });
    const test = tests.find((candidate) => identity(candidate) === key);
    if (!test || quarantines.has(key)) throw new Error('Quarantine must identify one declared input test.');
    quarantines.add(key);
    test.quarantineReason = text(quarantine.reason);
  }
  return tests;
}

export function selectedInputTests(mode: InputMode, catalog = parseInputCatalog()): InputTest[] {
  return catalog.filter((test) => test.mode === mode || test.mode === 'both');
}

export function assertCatalogMatches(discovery: unknown, catalog = parseInputCatalog()): void {
  const actual = array(discovery).flatMap((entry) => {
    const story = object(entry);
    const storyId = text(story.id);
    return array(story.tests ?? ['default']).map((name) => identity({ storyId, testName: text(name) }));
  });
  const declared = new Set(catalog.map(identity));
  const actualSet = new Set(actual);
  const missing = actual.filter((key) => !declared.has(key));
  const stale = [...declared].filter((key) => !actualSet.has(key));
  if (actualSet.size !== actual.length || missing.length || stale.length) {
    throw new Error(`Win32 input catalog drift. Unclassified: ${missing.join('; ')}. Stale declarations: ${stale.join('; ')}.`);
  }
}

export function inputModeOptions(): {
  clickMode?: InputMode;
  testCases?: readonly { storyId: string; testName: string }[];
} {
  const mode = readInputMode();
  return mode ? { clickMode: mode, testCases: selectedInputTests(mode).map(({ storyId, testName }) => ({ storyId, testName })) } : {};
}

export function verifyInputReport(value: unknown, selected: InputTest[], startedAt: number): { passed: number; quarantined: string[] } {
  const report = object(value);
  const context = object(report.context);
  const counts = object(report.counts);
  if (
    report.schemaVersion !== 1 ||
    report.kind !== 'lifecycle' ||
    report.status !== 'passed' ||
    context.endpoint !== 'win32' ||
    context.renderer !== 'paper' ||
    !Number.isFinite(Date.parse(text(report.startedAt))) ||
    Date.parse(text(report.startedAt)) < startedAt ||
    !Number.isFinite(Date.parse(text(report.finishedAt))) ||
    Date.parse(text(report.finishedAt)) < Date.parse(text(report.startedAt))
  ) {
    throw new Error('Expected a fresh, successful Win32/Paper lifecycle report.');
  }
  if (['failed', 'unsupported', 'incomplete', 'retries', 'flaky'].some((key) => counts[key] !== 0) || array(report.failures).length) {
    throw new Error('Input coverage cannot accept failed, unsupported, unfinished, retried, or flaky execution.');
  }
  if (array(report.work).some((entry) => !['passed', 'skipped'].includes(text(object(entry).status)))) {
    throw new Error('Selected input work did not finish.');
  }
  const tests = array(report.tests).map(object);
  if (counts.selected !== tests.length || new Set(tests.map((test) => text(test.testId))).size !== tests.length) {
    throw new Error('Input report has inconsistent or duplicate test results.');
  }
  const expected = new Set(selected.map((test) => `${test.storyId} / ${test.testName}`));
  if (tests.some((test) => text(test.testId).startsWith('csf-') && !expected.has(text(test.title)))) {
    throw new Error('Input report executed a callback outside its declared lane.');
  }
  const quarantined: string[] = [];
  for (const test of selected) {
    const title = `${test.storyId} / ${test.testName}`;
    const matches = tests.filter((result) => result.title === title);
    if (matches.length !== 1) throw new Error(`Expected one result for ${title}; found ${matches.length}.`);
    const result = matches[0];
    const attempts = array(result.attempts).map(object);
    if (result.flaky !== false || attempts.length !== 1 || attempts[0].attempt !== 0 || attempts[0].status !== result.status) {
      throw new Error(`Input callback did not have one clean attempt: ${title}.`);
    }
    if (result.status === 'skipped' && test.quarantineReason && attempts[0].reason === test.quarantineReason) {
      quarantined.push(title);
    } else if (result.status !== 'passed') {
      throw new Error(`Required input callback did not execute and pass: ${title} (${result.status}).`);
    }
  }
  if (counts.skipped !== quarantined.length || tests.some((test) => test.status !== 'passed' && !quarantined.includes(text(test.title)))) {
    throw new Error('Input report contains an unexpected skip or non-passing result.');
  }
  if (counts.passed !== tests.length - quarantined.length || counts.executed !== counts.passed) {
    throw new Error('Input report has inconsistent execution counts.');
  }
  return { passed: selected.length - quarantined.length, quarantined };
}

function runDirectories(): string[] {
  return existsSync(artifactsRoot)
    ? readdirSync(artifactsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
}

function catalogDigest(): string {
  return createHash('sha256').update(readFileSync(catalogPath)).digest('hex');
}

function sourceCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}

function main(): void {
  const mode = readInputMode();
  if (!mode) throw new Error('Set STORYBOOK_INPUT_MODE before capturing or verifying input coverage.');
  const snapshotPath = path.join(coverageRoot, `input-coverage-${mode}.json`);
  if (process.argv[2] === 'begin') {
    const discovery = JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(root, '.yarn', 'releases', 'yarn-4.18.0.cjs'),
          'workspace',
          '@fluentui-react-native/agentic-components-storybook',
          'storybook',
          'test',
          '--win32',
          '--list',
        ],
        { cwd: root, encoding: 'utf8', env: { ...process.env, STORYBOOK_INPUT_MODE: '' }, stdio: ['ignore', 'pipe', 'inherit'] },
      ),
    );
    const catalog = parseInputCatalog();
    assertCatalogMatches(discovery, catalog);
    mkdirSync(coverageRoot, { recursive: true });
    writeFileSync(
      snapshotPath,
      `${JSON.stringify({ schemaVersion: 1, mode, sourceCommit: sourceCommit(), catalogDigest: catalogDigest(), startedAt: Date.now(), previousRuns: runDirectories(), catalog, discovery }, null, 2)}\n`,
    );
    console.log(`Declared ${selectedInputTests(mode, catalog).length} ${mode} callbacks; both-mode callbacks execute in each lane.`);
  } else if (process.argv[2] === 'verify') {
    const snapshot = object(JSON.parse(readFileSync(snapshotPath, 'utf8')));
    if (
      snapshot.mode !== mode ||
      snapshot.sourceCommit !== sourceCommit() ||
      snapshot.catalogDigest !== catalogDigest() ||
      typeof snapshot.startedAt !== 'number'
    ) {
      throw new Error('Input coverage snapshot does not match the current source and lane.');
    }
    const previous = array(snapshot.previousRuns).map(text);
    const runs = runDirectories().filter((run) => !previous.includes(run));
    if (runs.length !== 1) throw new Error(`Expected one fresh input run; found ${runs.length}.`);
    const report = JSON.parse(readFileSync(path.join(artifactsRoot, runs[0], 'run.json'), 'utf8'));
    if (object(report).runId !== runs[0]) throw new Error('Input report identity does not match its run directory.');
    const result = verifyInputReport(report, selectedInputTests(mode), snapshot.startedAt);
    const summary = `## Win32/Paper ${mode} input coverage\n\n${result.passed} authored callbacks executed and passed. ${result.quarantined.length} explicitly quarantined callbacks remain unvalidated.\n${result.quarantined.map((title) => `- ${title}: existing #4373 quarantine; not counted as passed.`).join('\n')}\n`;
    writeFileSync(path.join(coverageRoot, `input-coverage-${mode}.md`), summary);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    console.log(summary);
  } else {
    throw new Error('Use input-coverage begin or input-coverage verify.');
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main();
