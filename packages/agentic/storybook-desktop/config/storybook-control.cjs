const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { writeDesktopStorybookFailure } = require('./diagnostics.cjs');
const { parseDriverManifest } = require('./generated-contract.cjs');

const host = process.env.STORYBOOK_WS_HOST || '127.0.0.1';
const port = Number(process.env.STORYBOOK_WS_PORT) || 7007;
const smokeMode = process.env.STORYBOOK_SMOKE_MODE || 'stories';
const smokePhase = parseSmokePhase(process.argv.slice(2));
// The runtime connects only after Metro serves a cold development bundle, so the first story gets a startup budget.
const initialRenderMilliseconds = Number(process.env.STORYBOOK_SMOKE_INITIAL_RENDER_TIMEOUT_MS) || 300_000;
const controller = new AbortController();
let report;
let runner;
let runOperation;

function parseSmokePhase(args) {
  if (args.length === 0) {
    return 'all';
  }
  if (args.length === 2 && args[0] === '--phase' && ['stories', 'tests'].includes(args[1])) {
    return args[1];
  }
  throw new Error(`Unsupported Storybook control arguments: ${args.join(' ')}`);
}

function baseUrl() {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- native Storybook services are loopback-only
  return `http://${host}:${port}`;
}

async function request(pathname, options) {
  const response = await fetch(`${baseUrl()}${pathname}`, {
    ...options,
    signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || `Storybook server returned ${response.status}`);
  }
  return body;
}

async function selectStory(storyId, attempts = 45) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    controller.signal.throwIfAborted();
    try {
      return await request(`/select-story-sync/${encodeURIComponent(storyId)}`, { method: 'POST' });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw lastError;
}

async function smoke(traversal) {
  if (smokeMode !== 'stories' && smokeMode !== 'stories-and-tests') {
    throw new Error(`Unsupported Storybook smoke mode "${smokeMode}".`);
  }
  if (smokePhase !== 'tests') {
    await runOperation(report.reporter, { label: 'Render stories' }, (operation) => renderStories(traversal, operation));
  }
}

async function renderStories(traversal, operation) {
  const index = await request('/index.json');
  const entries = Object.values(index.entries || {}).filter(({ type }) => type === 'story');
  if (entries.length === 0) {
    throw new Error('The Storybook index did not contain any stories.');
  }

  const settleMilliseconds = Number(process.env.STORYBOOK_SMOKE_SETTLE_MS) || 0;
  const failFast = process.env.STORYBOOK_SMOKE_FAIL_FAST === '1';
  const failures = [];
  for (const { id } of entries)
    report.reporter.emit({ kind: 'work-selected', payload: { workId: `navigation:${id}`, label: `Navigate ${id}` } });

  let attempted = 0;
  for (const [entryIndex, { id }] of entries.entries()) {
    attempted += 1;
    const started = Date.now();
    const testId = `navigation:${id}`;
    const title = `Navigate ${id}`;
    const context = { story: id };
    report.reporter.emit({ kind: 'scope-start', payload: { label: title, category: 'phase' } }, testId, context, testId);
    report.reporter.emit({ kind: 'test-start', payload: { testId, title, attempt: 0 } }, testId, context);
    try {
      if (traversal) await traversal.select(id, entryIndex === 0 ? initialRenderMilliseconds : 30_000);
      else await selectStory(id);
      if (settleMilliseconds > 0) {
        await new Promise((resolve) => setTimeout(resolve, settleMilliseconds));
      }
      report.reporter.emit(
        { kind: 'test-result', payload: { testId, title, attempt: 0, status: 'passed', durationMs: Date.now() - started } },
        testId,
        context,
      );
      report.reporter.emit({ kind: 'scope-end', payload: { status: 'passed' } }, testId);
    } catch (error) {
      failures.push(error);
      report.reporter.emit(
        {
          kind: 'test-result',
          payload: {
            testId,
            title,
            attempt: 0,
            status: 'failed',
            durationMs: Date.now() - started,
            failure: report.reporter.failure(error, 'test'),
          },
        },
        testId,
        context,
      );
      report.reporter.emit({ kind: 'scope-end', payload: { status: 'failed' } }, testId);
      if (failFast) {
        break;
      }
    }
  }

  if (failures.length > 0) {
    const notAttempted = entries.length - attempted;
    operation.summarize(
      `${failures.length} of ${entries.length} stories failed to render${notAttempted > 0 ? ` (stopped early; ${notAttempted} not attempted)` : ''}`,
    );
    throw new AggregateError(failures, `${failures.length} of ${entries.length} stories failed to render.`);
  }
  operation.summarize(`${entries.length} ${entries.length === 1 ? 'story' : 'stories'} rendered`);
}

async function runAuthoredTests() {
  const manifest = readDriverManifest();
  const smokeTestsUrl = pathToFileURL(path.join(__dirname, '..', 'lib', 'cli', 'smokeTests.js')).href;
  const configUrl = pathToFileURL(path.join(__dirname, '..', 'lib', 'config', 'index.js')).href;
  const { runDesktopStorybookSmokeTests } = await import(smokeTestsUrl);
  const { makeDesktopStorybookConfig } = await import(configUrl);
  // The driver instance's lane is a per-run choice the CLI resolved, so it travels as an option, not as configuration.
  const { input, ...wdio } = manifest.wdio ?? {};
  // The story tests report their own outcome header, with the counts, through `report`.
  await runDesktopStorybookSmokeTests({
    config: makeDesktopStorybookConfig({ projectRoot: process.cwd(), wdio }),
    ...(input ? { input } : {}),
    ...(manifest.scope ? { scope: manifest.scope } : {}),
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the Desktop Driver is loopback-only
    driverUrl: `http://127.0.0.1:${manifest.driverPort}`,
    manifest: manifest.storyManifest,
    platform: manifest.endpoint,
    targetId: manifest.targetId,
    report: report.reporter,
    commandRunner: runner,
    signal: controller.signal,
    errorOutput: {
      write: (text) => {
        report.reporter.emit({ kind: 'diagnostic', payload: { level: 'warning', message: String(text) } });
        return true;
      },
    },
  });
}

function readDriverManifest() {
  const manifestPath = process.env.STORYBOOK_DRIVER_MANIFEST;
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    throw new Error('STORYBOOK_DRIVER_MANIFEST must identify the generated driver manifest when running authored tests.');
  }
  return parseDriverManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

async function main() {
  const [{ createDesktopReportSession, runDesktopOperation }, { NodeDesktopCommandRunner }] = await Promise.all([
    import('@fluentui-react-native/desktop-test/reporting'),
    import('@fluentui-react-native/desktop-test/commands'),
  ]);
  runOperation = runDesktopOperation;
  report = await createDesktopReportSession({ artifactsRoot: path.join(process.cwd(), 'artifacts', 'desktop'), kind: 'tests' });
  runner = new NodeDesktopCommandRunner({ reporter: report.reporter, environment: report.environment });
  report.onStop?.(() => controller.abort(new Error('Storybook control interrupted.')));
  let failure;
  let traversal;
  try {
    if (process.env.STORYBOOK_DRIVER_MANIFEST) {
      const manifest = readDriverManifest();
      const { connectStoryTraversal } = await import(pathToFileURL(path.join(__dirname, '..', 'lib', 'cli', 'storyTraversal.js')).href);
      traversal = await connectStoryTraversal({
        // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the Desktop Driver is loopback-only
        url: `http://127.0.0.1:${manifest.driverPort}`,
        platform: manifest.endpoint,
        targetId: manifest.targetId,
        signal: controller.signal,
      });
      if (smokePhase === 'tests') {
        // A relaunched app has no authenticated bridge until its runtime says hello and renders its initial story.
        // Authored-test navigation fails fast before then, so wait for one confirmed selection first.
        const [firstStory] = manifest.storyManifest.entries;
        if (!firstStory) throw new Error('The Desktop Driver manifest did not contain any stories.');
        await traversal.select(firstStory.id, initialRenderMilliseconds);
      }
    }
    await smoke(traversal);
    if (smokeMode === 'stories-and-tests' && smokePhase !== 'stories') {
      await traversal?.close();
      traversal = undefined;
      await runAuthoredTests();
    }
  } catch (error) {
    failure = error;
  } finally {
    try {
      await traversal?.close();
    } catch (error) {
      report.reporter.fail(error, 'cleanup');
      failure = failure === undefined ? error : new AggregateError([failure, error], 'Storybook traversal and cleanup failed.');
    }
    try {
      await runner.close();
    } catch (error) {
      report.reporter.fail(error, 'cleanup');
      failure = failure === undefined ? error : new AggregateError([failure, error], 'Storybook control and cleanup failed.');
    }
    process.exitCode = await report.close(failure);
  }
}

main().catch((error) => {
  writeDesktopStorybookFailure('smoke', error);
  process.exitCode = 1;
});
