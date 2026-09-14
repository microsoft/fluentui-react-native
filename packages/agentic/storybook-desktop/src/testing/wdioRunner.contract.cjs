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
    { runWdioStoryTests },
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
    export const Pass = { wdio: async ({ browser, expect, desktop }) => {
      const { strictEqual } = await import('node:assert');
      const button = await browser.$('~button-primary');
      await expect(button).toBeEnabled();
      strictEqual(await button.getTagName(), 'button');
      await button.click();
      await desktop.expect({ state: 'focused', target: { testId: 'button-primary' }, value: true });
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
  `,
  );
  const storyPackage = { name: 'inline-fixture', root, manifest: { name: 'inline-fixture' }, storyPatterns: ['*.stories.ts'] };
  const manifest = await createDesktopStoryManifest({ projectRoot, getStoryPackages: () => [storyPackage] }, 'windows');
  const harness = await createDesktopDriverStoryHarness(manifest);
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
    const passed = await run('pass');
    const skipped = await run('skip');
    const failures = [];
    for (const story of ['fail', 'timeout', 'spin', 'crash', 'exit-zero', 'stale']) {
      let rejected = false;
      try {
        await run(
          story === 'stale' ? 'pass' : story,
          story === 'stale' ? { manifest: { ...manifest, platformManifestDigest: 'stale' } } : {},
        );
      } catch (error) {
        rejected = true;
        if (!(error instanceof Error) || !error.message.includes('Executable wdio stories failed')) throw error;
        failures.push(story);
      }
      if (!rejected) throw new Error(`Expected ${story} to fail.`);
      const report = JSON.parse(fs.readFileSync(path.join(root, 'artifacts/windows/wdio/run.json'), 'utf8'));
      if (report.tests[0].status !== 'failed') throw new Error(`${story} was not persisted as failed.`);
    }
    const repeated = await run('pass');
    const buttonConfig = makeDesktopStorybookConfig({ projectRoot, storyPackages: ['@fluentui-react-native/components'] });
    const buttonManifest = await createDesktopStoryManifest(buttonConfig, 'windows');
    const buttonHarness = await createDesktopDriverStoryHarness(buttonManifest, { windows: createFakeStoryWindows(buttonManifest) });
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
    process.stdout.write(
      '\nWDIO_RESULT ' +
        JSON.stringify({
          passed: passed.map(({ storyId }) => storyId),
          skipped: skipped.filter(({ status }) => status === 'skipped').map(({ storyId }) => storyId),
          repeated: repeated.map(({ storyId }) => storyId),
          button: button.map(({ storyId }) => storyId),
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

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
