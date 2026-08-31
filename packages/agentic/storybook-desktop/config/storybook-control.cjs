const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const host = process.env.STORYBOOK_WS_HOST || '127.0.0.1';
const port = Number(process.env.STORYBOOK_WS_PORT) || 7007;
const smokeMode = process.env.STORYBOOK_SMOKE_MODE || 'stories';

function baseUrl() {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- native Storybook services are loopback-only
  return `http://${host}:${port}`;
}

async function request(pathname, options) {
  const response = await fetch(`${baseUrl()}${pathname}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Storybook server returned ${response.status}`);
  }
  return body;
}

async function selectStory(storyId, attempts = 45) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
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

async function smoke() {
  if (smokeMode !== 'stories' && smokeMode !== 'stories-and-tests') {
    throw new Error(`Unsupported Storybook smoke mode "${smokeMode}".`);
  }

  const index = await request('/index.json');
  const entries = Object.values(index.entries || {}).filter(({ type }) => type === 'story');
  if (entries.length === 0) {
    throw new Error('The Storybook index did not contain any stories.');
  }

  const settleMilliseconds = Number(process.env.STORYBOOK_SMOKE_SETTLE_MS) || 0;
  const failFast = process.env.STORYBOOK_SMOKE_FAIL_FAST === '1';
  const failures = [];

  for (const { id } of entries) {
    try {
      await selectStory(id);
      if (settleMilliseconds > 0) {
        await new Promise((resolve) => setTimeout(resolve, settleMilliseconds));
      }
      process.stdout.write(`rendered ${id}\n`);
    } catch (error) {
      failures.push({ id, error: error.message });
      process.stderr.write(`failed ${id}: ${error.message}\n`);
      if (failFast) {
        break;
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} of ${entries.length} stories failed to render`);
  }
  process.stdout.write(`Rendered ${entries.length} stories.\n`);

  if (smokeMode === 'stories-and-tests') {
    await runAuthoredTests();
  }
}

async function runAuthoredTests() {
  const manifestPath = process.env.STORYBOOK_DRIVER_MANIFEST;
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    throw new Error('STORYBOOK_DRIVER_MANIFEST must identify the generated driver manifest when running authored tests.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (
    manifest.schemaVersion !== 1 ||
    !['macos', 'win32', 'windows'].includes(manifest.endpoint) ||
    !Number.isInteger(manifest.driverPort) ||
    typeof manifest.targetId !== 'string'
  ) {
    throw new Error(`Invalid Desktop Driver manifest at ${manifestPath}.`);
  }

  const smokeTestsUrl = pathToFileURL(path.join(__dirname, '..', 'lib', 'cli', 'smokeTests.js')).href;
  const { formatDesktopStorybookSmokeTestSummary, runDesktopStorybookSmokeTests } = await import(smokeTestsUrl);
  const result = await runDesktopStorybookSmokeTests({
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the Desktop Driver is loopback-only
    driverUrl: `http://127.0.0.1:${manifest.driverPort}`,
    platform: manifest.endpoint,
    projectRoot: process.cwd(),
    targetId: manifest.targetId,
  });
  process.stdout.write(`${formatDesktopStorybookSmokeTestSummary(result)}\n`);
}

smoke().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
