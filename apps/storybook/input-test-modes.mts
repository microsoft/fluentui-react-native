import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import quarantineCatalog from './input-test-quarantines.win32.json' with { type: 'json' };

export type InputMode = 'accessibility' | 'physical';
export type InputTest = {
  storyId: string;
  testName: string;
  mode: InputMode | 'both';
  quarantineReason?: string;
};

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(appRoot, '..', '..');
const artifactsRoot = path.join(appRoot, 'artifacts', 'desktop');
const coverageRoot = path.join(appRoot, 'artifacts', 'win32');

if (quarantineCatalog.schemaVersion !== 1 || quarantineCatalog.endpoint !== 'win32') {
  throw new Error('Unsupported Win32 quarantine catalog.');
}

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

export function parseInputCatalog(value: unknown, quarantineDeclarations: unknown = quarantineCatalog.quarantines): InputTest[] {
  const storyIds = new Set<string>();
  const tests = array(value).flatMap((entry) => {
    const story = object(entry);
    const storyId = text(story.id);
    if (storyIds.has(storyId)) throw new Error(`Duplicate discovered story: ${storyId}.`);
    storyIds.add(storyId);
    const modes = story.inputModes === undefined ? {} : object(story.inputModes);
    const names = array(story.tests ?? ['default']).map(text);
    if (!names.length) throw new Error(`No input tests discovered for ${storyId}.`);
    if (Object.keys(modes).some((name) => !names.includes(name))) {
      throw new Error(`Classified callback was not discovered for ${storyId}.`);
    }
    return names.map((testName): InputTest => {
      const declaration = modes[testName];
      const mode = declaration === undefined ? undefined : object(declaration).win32;
      if (mode !== 'accessibility' && mode !== 'physical' && mode !== 'both') {
        throw new Error(`Unclassified or invalid Win32 input callback: ${storyId} / ${testName}.`);
      }
      return { storyId, testName, mode };
    });
  });
  if (!tests.length || new Set(tests.map(identity)).size !== tests.length) {
    throw new Error('Input-test catalog must have unique callback identities.');
  }
  const quarantines = new Set<string>();
  for (const entry of array(quarantineDeclarations)) {
    const quarantine = object(entry);
    const key = identity({ storyId: text(quarantine.storyId), testName: text(quarantine.testName) });
    const test = tests.find((candidate) => identity(candidate) === key);
    if (!test || quarantines.has(key)) throw new Error('Quarantine must identify one declared input test.');
    quarantines.add(key);
    test.quarantineReason = text(quarantine.reason);
  }
  return tests;
}

export function selectedInputTests(mode: InputMode, catalog: readonly InputTest[]): InputTest[] {
  return catalog.filter((test) => test.mode === mode || test.mode === 'both');
}

export function inputModeOptions(): {
  clickMode?: InputMode;
  inputMode?: InputMode;
} {
  const mode = readInputMode();
  return mode ? { clickMode: mode, inputMode: mode } : {};
}

export function verifyInputReport(value: unknown, selected: InputTest[], startedAt: number): { passed: number; quarantined: string[] } {
  const report = object(value);
  const context = object(report.context);
  const counts = object(report.counts);
  if (
    report.schemaVersion !== 1 ||
    report.kind !== 'tests' ||
    report.status !== 'passed' ||
    context.endpoint !== 'win32' ||
    context.renderer !== 'paper' ||
    !Number.isFinite(Date.parse(text(report.startedAt))) ||
    Date.parse(text(report.startedAt)) < startedAt ||
    !Number.isFinite(Date.parse(text(report.finishedAt))) ||
    Date.parse(text(report.finishedAt)) < Date.parse(text(report.startedAt))
  ) {
    throw new Error('Expected a fresh, successful Win32/Paper test report.');
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

function catalogDigest(catalog: readonly InputTest[]): string {
  return createHash('sha256').update(JSON.stringify(catalog)).digest('hex');
}

function sourceCommit(): string {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}

function discoverInputTests(): unknown {
  const env: NodeJS.ProcessEnv = { ...process.env, STORYBOOK_INPUT_MODE: '' };
  delete env.STORYBOOK_SMOKE_TEST;
  delete env.STORYBOOK_SMOKE_STORY;
  delete env.STORYBOOK_SMOKE_TAG;
  return JSON.parse(
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
      {
        cwd: root,
        encoding: 'utf8',
        timeout: 120_000,
        env,
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    ),
  );
}

function writeGeneratedCatalog(catalog: readonly InputTest[]): void {
  const stories = new Map<string, { storyId: string; accessibility: string[]; physical: string[]; both: string[] }>();
  for (const test of catalog) {
    let story = stories.get(test.storyId);
    if (!story) {
      story = { storyId: test.storyId, accessibility: [], physical: [], both: [] };
      stories.set(test.storyId, story);
    }
    story[test.mode].push(test.testName);
  }
  mkdirSync(coverageRoot, { recursive: true });
  writeFileSync(
    path.join(coverageRoot, 'input-tests.win32.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        endpoint: 'win32',
        stories: [...stories.values()],
        quarantines: quarantineCatalog.quarantines,
      },
      null,
      2,
    )}\n`,
  );
}

function main(): void {
  const action = process.argv[2];
  if (!['generate', 'begin', 'verify'].includes(action ?? '')) throw new Error('Use input-coverage generate, begin, or verify.');
  const mode = readInputMode();
  if (action !== 'generate' && !mode) throw new Error('Set STORYBOOK_INPUT_MODE before capturing or verifying input coverage.');
  const discovery = discoverInputTests();
  const catalog = parseInputCatalog(discovery);
  if (action === 'generate') {
    writeGeneratedCatalog(catalog);
    console.log(`Generated ${catalog.length} classified Win32 callbacks from story source.`);
    return;
  }
  if (!mode) throw new Error('Input coverage requires an explicit lane.');
  const snapshotPath = path.join(coverageRoot, `input-coverage-${mode}.json`);
  if (action === 'begin') {
    writeGeneratedCatalog(catalog);
    mkdirSync(coverageRoot, { recursive: true });
    writeFileSync(
      snapshotPath,
      `${JSON.stringify({ schemaVersion: 1, mode, sourceCommit: sourceCommit(), catalogDigest: catalogDigest(catalog), startedAt: Date.now(), previousRuns: runDirectories(), catalog, discovery }, null, 2)}\n`,
    );
    console.log(`Declared ${selectedInputTests(mode, catalog).length} ${mode} callbacks; both-mode callbacks execute in each lane.`);
  } else if (action === 'verify') {
    const snapshot = object(JSON.parse(readFileSync(snapshotPath, 'utf8')));
    if (
      snapshot.mode !== mode ||
      snapshot.sourceCommit !== sourceCommit() ||
      snapshot.catalogDigest !== catalogDigest(catalog) ||
      typeof snapshot.startedAt !== 'number'
    ) {
      throw new Error('Input coverage snapshot does not match the current source and lane.');
    }
    const previous = array(snapshot.previousRuns).map(text);
    const runs = runDirectories().filter((run) => !previous.includes(run));
    if (runs.length !== 1) throw new Error(`Expected one fresh input run; found ${runs.length}.`);
    const report = JSON.parse(readFileSync(path.join(artifactsRoot, runs[0], 'run.json'), 'utf8'));
    if (object(report).runId !== runs[0]) throw new Error('Input report identity does not match its run directory.');
    const result = verifyInputReport(report, selectedInputTests(mode, catalog), snapshot.startedAt);
    const summary = `## Win32/Paper ${mode} input coverage\n\n${result.passed} authored callbacks executed and passed. ${result.quarantined.length} explicitly quarantined callbacks remain unvalidated.\n${result.quarantined.map((title) => `- ${title}: existing #4373 quarantine; not counted as passed.`).join('\n')}\n`;
    writeFileSync(path.join(coverageRoot, `input-coverage-${mode}.md`), summary);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    console.log(summary);
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main();
