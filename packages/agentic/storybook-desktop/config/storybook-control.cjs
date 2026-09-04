const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const host = process.env.STORYBOOK_WS_HOST || '127.0.0.1';
const port = Number(process.env.STORYBOOK_WS_PORT) || 7007;
const smokeMode = process.env.STORYBOOK_SMOKE_MODE || 'stories';
const smokePhase = parseSmokePhase(process.argv.slice(2));

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
  if (smokePhase !== 'tests') {
    const index = await request('/index.json');
    const indexedEntries = Object.values(index.entries || {}).filter(({ type }) => type === 'story');
    if (indexedEntries.length === 0) {
      throw new Error('The Storybook index did not contain any stories.');
    }
    const manifest = loadStoryManifest();
    const indexedIds = new Set(indexedEntries.map(({ id }) => id));
    const entries = manifest ? manifest.entries.filter(({ traverse }) => traverse !== false).map(({ id }) => ({ id })) : indexedEntries;
    if (manifest && entries.length === 0) {
      throw new Error(`The ${manifest.endpoint} Story Manifest does not contain any supported stories.`);
    }
    const missing = entries.filter(({ id }) => !indexedIds.has(id));
    if (missing.length > 0) {
      throw new Error(`The Storybook index is missing ${missing.length} manifest stories: ${missing.map(({ id }) => id).join(', ')}`);
    }
    if (manifest) {
      const expectedIndexedIds = new Set([
        ...manifest.entries.map(({ id }) => id),
        ...manifest.excluded.filter(({ reason }) => reason === 'unsupported-platform').map(({ id }) => id),
      ]);
      const unexpected = [...indexedIds].filter((id) => !expectedIndexedIds.has(id));
      if (unexpected.length > 0) {
        throw new Error(`The Storybook index contains ${unexpected.length} unexpected stories: ${unexpected.join(', ')}`);
      }
      const missingUnsupported = [...expectedIndexedIds].filter((id) => !indexedIds.has(id));
      if (missingUnsupported.length > 0) {
        throw new Error(
          `The Storybook index is missing ${missingUnsupported.length} loadable manifest stories: ${missingUnsupported.join(', ')}`,
        );
      }
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
  }

  if (smokeMode === 'stories-and-tests' && smokePhase !== 'stories') {
    await runAuthoredTests();
  }
}

function loadStoryManifest() {
  const manifestPath = process.env.STORYBOOK_STORY_MANIFEST;
  if (!manifestPath) {
    return undefined;
  }
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`STORYBOOK_STORY_MANIFEST does not exist at ${manifestPath}.`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 2 || !Array.isArray(manifest.entries) || !Array.isArray(manifest.excluded)) {
    throw new Error(`Invalid Desktop Story Manifest at ${manifestPath}.`);
  }
  return manifest;
}

async function runAuthoredTests() {
  const manifestPath = process.env.STORYBOOK_DRIVER_MANIFEST;
  if (!manifestPath || !fs.existsSync(manifestPath)) {
    throw new Error('STORYBOOK_DRIVER_MANIFEST must identify the generated driver manifest when running authored tests.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (
    manifest.schemaVersion !== 2 ||
    !['macos', 'win32', 'windows'].includes(manifest.endpoint) ||
    !Number.isInteger(manifest.driverPort) ||
    typeof manifest.targetId !== 'string' ||
    !Array.isArray(manifest.storyManifest?.entries)
  ) {
    throw new Error(`Invalid Desktop Driver manifest at ${manifestPath}.`);
  }
  const warmupStory = manifest.storyManifest.entries.find(
    ({ tests, traverse }) => traverse !== false && Array.isArray(tests?.tests) && tests.tests.length > 0,
  );
  if (!warmupStory?.id) {
    throw new Error(`Desktop Driver manifest at ${manifestPath} contains no authored story tests.`);
  }
  await selectStory(warmupStory.id, 120);
  process.stdout.write(`warmed ${warmupStory.id}\n`);

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
