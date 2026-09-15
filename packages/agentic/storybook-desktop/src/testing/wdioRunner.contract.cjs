const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const packageRoot = path.resolve(__dirname, '..', '..');
  const projectRoot = path.resolve(packageRoot, '..', '..', '..', 'apps', 'storybook');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'furn-inline-wdio-'));
  const [
    { createDesktopStoryManifest },
    { runWdioStoryTests, WdioStoryTestRunError },
    { createDesktopDriverStoryHarness, createFakeStoryWindows },
    { makeDesktopStorybookConfig },
  ] = await Promise.all([
    import(pathToFileURL(path.join(packageRoot, 'lib/driver/storyManifest.js')).href),
    import(pathToFileURL(path.join(packageRoot, 'lib/testing/runWdioTests.js')).href),
    import('@fluentui-react-native/desktop-driver/testing'),
    import(pathToFileURL(path.join(packageRoot, 'lib/config/index.js')).href),
  ]);
  fs.writeFileSync(
    path.join(root, 'fixture.stories.ts'),
    `
    import 'react-native-must-never-load-in-node';
    export default { title: 'Fixture/Button' };
    export const Pass = {
      tags: ['grouped', 'desktop-e2e'],
      parameters: { desktopDriver: { version: 1, tests: [{
        id: 'enabled', steps: [{ expect: { state: 'enabled', target: { testId: 'button-primary' }, value: true } }],
      }] } },
      wdio: async ({ browser, expect, desktop }) => {
      const { strictEqual } = await import('node:assert');
      const button = await browser.$('~button-primary');
      await expect(button).toBeEnabled();
      strictEqual(await button.getTagName(), 'button');
      await button.click();
      await desktop.expect({ state: 'focused', target: { testId: 'button-primary' }, value: true });
      strictEqual((await desktop.session.getCurrentStory()).storyId, 'fixture-button--pass');
    }};
    export const Second = {
      tags: ['grouped', 'desktop-e2e'],
      parameters: { desktopDriver: { version: 1, tests: [{
        id: 'enabled', steps: [{ expect: { state: 'enabled', target: { testId: 'button-primary' }, value: true } }],
      }] } },
      wdio: async ({ desktop, expect }) => {
      expect((await desktop.session.getCurrentStory()).storyId).toBe('fixture-button--second');
    }};
    export const Skip = { wdio: ({ skip }) => { skip('Explicit capability reason'); }};
    export const Fail = { wdio: async () => {
      const { strictEqual } = await import('node:assert');
      strictEqual(1, 2, 'intentional inline assertion');
    }};
    export const Timeout = { wdio: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10_000));
    }};
    export const Spin = { wdio: () => { while (true) {} }};
    export const Crash = { wdio: () => { process.exit(2); }};
    export const ExitZero = { wdio: () => { process.exit(0); }};
    export const NavigationFailure = { wdio: () => { throw new Error('must not execute without navigation'); }};
    export const Named = { wdio: {
      'mutates state': async ({ browser, desktop, expect, platform }) => {
        expect(platform).toBe(desktop.session.capabilities['furn:endpoint']);
        expect(['windows', 'win32', 'macos']).toContain(platform);
        if (platform === 'win32') expect(desktop.session.capabilities.platformName).toBe('windows');
        const button = await browser.$('~button-primary');
        expect(await button.getProperty('focused')).toBe(false);
        await button.click();
        expect(await button.getProperty('focused')).toBe(true);
      },
      'starts fresh': async ({ browser, desktop, expect, platform }) => {
        expect(platform).toBe(desktop.session.capabilities['furn:endpoint']);
        expect(await (await browser.$('~button-primary')).getProperty('focused')).toBe(false);
      },
    }};
    export const NamedFailures = { wdio: {
      'a b': () => { throw new Error('first named failure'); },
      'a-b': () => { throw new Error('second named failure'); },
      'recovers': async ({ browser, expect }) => {
        await expect(await browser.$('~button-primary')).toBeEnabled();
      },
    }};
    export const NamedTimeout = { wdio: {
      'times out': async () => { await new Promise((resolve) => setTimeout(resolve, 10_000)); },
      'runs afterward': async ({ browser, expect }) => {
        await expect(await browser.$('~button-primary')).toBeEnabled();
      },
    }};
  `,
  );
  const storyPackage = { name: 'inline-fixture', root, manifest: { name: 'inline-fixture' }, storyPatterns: ['*.stories.ts'] };
  const manifest = await createDesktopStoryManifest({ projectRoot, getStoryPackages: () => [storyPackage] }, 'windows');
  const harness = await createDesktopDriverStoryHarness(manifest);
  const selections = [];
  const selectStory = harness.storyOrchestrator.selectStory.bind(harness.storyOrchestrator);
  harness.storyOrchestrator.selectStory = async (request) => {
    if (request.storyId === 'fixture-button--navigation-failure') {
      throw new Error('Navigation failed: preview did not mount');
    }
    selections.push(request.storyId);
    return selectStory(request);
  };
  const resetStory = harness.storyOrchestrator.resetStory.bind(harness.storyOrchestrator);
  harness.storyOrchestrator.resetStory = async (request) => {
    if ((await harness.storyOrchestrator.getCurrentStory())?.storyId !== request.storyId) {
      throw new Error('A preview-only reset cannot navigate to another story.');
    }
    return resetStory(request);
  };
  const config = {
    projectRoot: root,
    resolvePackage: (name) => ({ root: name === 'inline-fixture' ? root : packageRoot }),
  };
  const run = (story, overrides = {}) =>
    runWdioStoryTests({
      config,
      manifest,
      platform: 'windows',
      targetId: harness.target.id,
      url: harness.server.url,
      story: `fixture-button--${story}`,
      timeoutMs: 2000,
      ...overrides,
    });
  try {
    const platforms = {};
    for (const platform of ['macos', 'windows', 'win32']) {
      const platformManifest = await createDesktopStoryManifest({ projectRoot, getStoryPackages: () => [storyPackage] }, platform);
      const platformHarness = await createDesktopDriverStoryHarness(platformManifest);
      try {
        const results = await runWdioStoryTests({
          config,
          manifest: platformManifest,
          platform,
          targetId: platformHarness.target.id,
          url: platformHarness.server.url,
          story: 'fixture-button--named',
          timeoutMs: 2000,
        });
        platforms[platform] = results.map(({ testName, status }) => ({ testName, status }));
      } finally {
        await platformHarness.close();
      }
    }
    let namedFailureResults;
    try {
      await run('named-failures');
      throw new Error('Expected named failures.');
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !(error instanceof WdioStoryTestRunError) ||
        !('results' in error) ||
        !Array.isArray(error.results)
      ) {
        throw error;
      }
      namedFailureResults = error.results;
    }
    if (namedFailureResults.map(({ status }) => status).join(',') !== 'failed,failed,passed') {
      throw new Error('Named test failure prevented independent cases from running.');
    }
    const evidencePaths = namedFailureResults.flatMap(({ artifacts }) => (artifacts ?? []).map(({ path }) => path));
    if (evidencePaths.length !== 4 || new Set(evidencePaths).size !== 4) {
      throw new Error('Named failure evidence collided.');
    }
    const filtered = await run('named', { test: '*fresh' });
    if (filtered.length !== 1 || filtered[0].testName !== 'starts fresh') throw new Error('Named test filtering failed.');
    let namedTimeout;
    try {
      await run('named-timeout');
      throw new Error('Expected named timeout.');
    } catch (error) {
      if (!(error instanceof Error) || !(error instanceof WdioStoryTestRunError) || !('results' in error) || !Array.isArray(error.results))
        throw error;
      if (error.results.map(({ status }) => status).join(',') !== 'failed,passed') {
        throw new Error(`Named timeout recovery failed: ${JSON.stringify(error.results)}`, { cause: error });
      }
      namedTimeout = error.results.map(({ testName, status }) => ({ testName, status }));
    }
    const passed = await run('pass');
    const skipped = await run('skip');
    const failures = [];
    for (const story of ['fail', 'timeout', 'spin', 'crash', 'exit-zero', 'stale', 'navigation-failure']) {
      let rejected = false;
      try {
        await run(
          story === 'stale' ? 'pass' : story,
          story === 'stale' ? { manifest: { ...manifest, platformManifestDigest: 'stale' } } : { reporter: 'dot' },
        );
      } catch (error) {
        rejected = true;
        if (!(error instanceof Error) || !error.message.includes('Executable wdio stories failed')) throw error;
        failures.push(story);
      }
      if (!rejected) throw new Error(`Expected ${story} to fail.`);
      const report = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/wdio/run.json'), 'utf8'));
      if (report.tests[0].status !== 'failed') throw new Error(`${story} was not persisted as failed.`);
      if (story === 'fail' && !report.tests[0].error.includes('intentional inline assertion')) {
        throw new Error('Compact reporter lost the worker assertion diagnostic.');
      }
    }
    const repeated = await run('pass');
    await selectStory({ requestId: 'wrong-page', runId: 'wrong-page', storyId: 'fixture-button--fail' });
    selections.length = 0;
    const grouped = await run('*', { tag: 'grouped' });
    const groupedSelections = [...selections];
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({ name: 'inline-fixture', exports: { './package.json': './package.json' } }),
    );
    fs.mkdirSync(path.join(root, 'node_modules/@fluentui-react-native'), { recursive: true });
    fs.symlinkSync(
      packageRoot,
      path.join(root, 'node_modules/@fluentui-react-native/storybook-desktop'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    const smokeManifestPath = path.join(root, 'driver-manifest.json');
    fs.writeFileSync(
      smokeManifestPath,
      JSON.stringify({
        schemaVersion: 2,
        endpoint: 'windows',
        driverPort: Number(new URL(harness.server.url).port),
        targetId: harness.target.id,
        storyManifest: manifest,
        wdio: { tag: 'grouped', reporter: 'tap', timeoutMs: 2000 },
      }),
    );
    await selectStory({ requestId: 'smoke-wrong-page', runId: 'smoke-wrong-page', storyId: 'fixture-button--fail' });
    selections.length = 0;
    const control = await runSmokeControl(packageRoot, root, smokeManifestPath);
    if (control.code !== 0) throw new Error(control.stderr || control.stdout || `Smoke control exited with ${control.code}.`);
    const smokeReport = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/desktop-driver/run.json'), 'utf8'));
    const smoke = {
      plans: smokeReport.tests.map(({ storyId }) => storyId),
      callbacks: smokeReport.wdio.map(({ storyId }) => storyId),
      selections: [...selections],
      status: smokeReport.status,
    };
    const failureManifest = JSON.parse(fs.readFileSync(smokeManifestPath, 'utf8'));
    failureManifest.wdio = { story: 'fixture-button--fail', reporter: 'dot', timeoutMs: 2000 };
    fs.writeFileSync(smokeManifestPath, JSON.stringify(failureManifest));
    const failedControl = await runSmokeControl(packageRoot, root, smokeManifestPath);
    const smokeFailureLogged =
      failedControl.code === 1 &&
      failedControl.stderr.includes('[storybook] FAIL smoke') &&
      failedControl.stderr.includes('fixture-button--fail') &&
      failedControl.stderr.includes('intentional inline assertion');
    if (!smokeFailureLogged) throw new Error(`Smoke control lost the callback failure: ${failedControl.stderr}`);
    const buttonConfig = makeDesktopStorybookConfig({ projectRoot, storyPackages: ['@fluentui-react-native/components'] });
    const buttonManifest = await createDesktopStoryManifest(buttonConfig, 'windows');
    const buttonWindows = createFakeStoryWindows(buttonManifest);
    buttonWindows[0] = {
      ...buttonWindows[0],
      elements: [
        ...buttonWindows[0].elements,
        {
          id: 'wdio-button',
          automationId: 'agentic-storybook-button',
          name: 'Button',
          role: 'button',
          scope: 'preview',
          parentId: 'story-root',
          windowId: buttonWindows[0].id,
          rect: { x: 10, y: 10, width: 120, height: 40 },
        },
      ],
    };
    const buttonHarness = await createDesktopDriverStoryHarness(buttonManifest, { windows: buttonWindows });
    let button;
    try {
      button = await runWdioStoryTests({
        config: { projectRoot: root, resolvePackage: (name) => buttonConfig.resolvePackage(name) },
        manifest: buttonManifest,
        platform: 'windows',
        targetId: buttonHarness.target.id,
        url: buttonHarness.server.url,
        story: 'components-button--default',
        timeoutMs: 5000,
      });
    } finally {
      await buttonHarness.close();
    }
    const restrictedButtonHarness = await createDesktopDriverStoryHarness(buttonManifest, {
      windows: buttonWindows,
      features: { physicalClick: false },
    });
    let restrictedButton;
    try {
      restrictedButton = await runWdioStoryTests({
        config: { projectRoot: root, resolvePackage: (name) => buttonConfig.resolvePackage(name) },
        manifest: buttonManifest,
        platform: 'windows',
        targetId: restrictedButtonHarness.target.id,
        url: restrictedButtonHarness.server.url,
        story: 'components-button--default',
        timeoutMs: 5000,
      });
    } finally {
      await restrictedButtonHarness.close();
    }
    process.stdout.write(
      '\nWDIO_RESULT ' +
        JSON.stringify({
          passed: passed.map(({ storyId }) => storyId),
          skipped: skipped.filter(({ status }) => status === 'skipped').map(({ storyId }) => storyId),
          repeated: repeated.map(({ storyId }) => storyId),
          grouped: grouped.map(({ storyId }) => storyId),
          groupedSelections,
          smoke,
          smokeFailureLogged,
          button: button.map(({ testName, status }) => ({ testName, status })),
          restrictedButton: restrictedButton.map(({ testName, status }) => ({ testName, status })),
          platforms,
          namedFailureResults: namedFailureResults.map(({ testName, status }) => ({ testName, status })),
          namedTimeout,
          failures,
          attachedOnly: harness.host.actions
            .filter(({ type }) => type === 'close-application')
            .every(({ ownership }) => ownership === 'attached'),
          generatedFiles: fs.readdirSync(path.join(root, 'storybook-desktop.generated/wdio')),
        }),
    );
  } finally {
    await harness.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/** @returns {Promise<{code: number | null, stdout: string, stderr: string}>} */
function runSmokeControl(packageRoot, cwd, manifestPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(packageRoot, 'config/storybook-control.cjs'), '--phase', 'tests'], {
      cwd,
      env: { ...process.env, STORYBOOK_DRIVER_MANIFEST: manifestPath, STORYBOOK_SMOKE_MODE: 'stories-and-tests' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on('data', (chunk) => stdout.push(chunk));
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code) =>
      resolve({ code, stdout: Buffer.concat(stdout).toString('utf8'), stderr: Buffer.concat(stderr).toString('utf8') }),
    );
  });
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
