const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '../..');
const pinPath = path.join(packageRoot, 'src/tokens/mappings/upstream-pin.json');
const requiredFileIds = ['semanticCss', 'interactionFallbackCss', 'mappings'];

class UpstreamFetchError extends Error {}

function parseArguments(argv) {
  const options = {
    offline: false,
    ref: undefined,
    updateSnapshots: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--offline') {
      options.offline = true;
    } else if (argument === '--update-snapshots') {
      options.updateSnapshots = true;
    } else if (argument === '--ref') {
      options.ref = argv[index + 1];
      index += 1;
      if (!options.ref) {
        throw new Error('--ref requires a Git commit or ref.');
      }
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (options.offline && (options.ref || options.updateSnapshots)) {
    throw new Error('--offline cannot be combined with --ref or --update-snapshots.');
  }
  if (options.ref && options.updateSnapshots) {
    throw new Error('--ref cannot be combined with --update-snapshots; update the pin record first.');
  }

  return options;
}

function loadPin() {
  const pin = JSON.parse(fs.readFileSync(pinPath, 'utf8'));
  if (typeof pin.repository !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(pin.repository)) {
    throw new Error('upstream-pin.json must declare repository as owner/name.');
  }
  if (typeof pin.commit !== 'string' || !/^[0-9a-f]{40}$/.test(pin.commit)) {
    throw new Error('upstream-pin.json must declare a full 40-character commit SHA.');
  }
  if (typeof pin.verifiedDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(pin.verifiedDate)) {
    throw new Error('upstream-pin.json must declare verifiedDate as YYYY-MM-DD.');
  }
  if (!Array.isArray(pin.files) || pin.files.length === 0) {
    throw new Error('upstream-pin.json must declare at least one upstream file.');
  }

  const fileIds = new Set();
  for (const file of pin.files) {
    if (
      typeof file.id !== 'string' ||
      typeof file.upstreamPath !== 'string' ||
      typeof file.snapshotPath !== 'string' ||
      typeof file.blobSha !== 'string' ||
      !/^[0-9a-f]{40}$/.test(file.blobSha) ||
      path.isAbsolute(file.snapshotPath)
    ) {
      throw new Error('Each upstream pin file requires id, upstreamPath, snapshotPath, and a full blobSha.');
    }
    const resolvedSnapshotPath = path.resolve(packageRoot, file.snapshotPath);
    if (!resolvedSnapshotPath.startsWith(`${packageRoot}${path.sep}`)) {
      throw new Error(`Snapshot path must stay inside the design package: ${file.snapshotPath}`);
    }
    if (fileIds.has(file.id)) {
      throw new Error(`Duplicate upstream pin file id: ${file.id}`);
    }
    fileIds.add(file.id);
  }
  for (const requiredFileId of requiredFileIds) {
    if (!fileIds.has(requiredFileId)) {
      throw new Error(`upstream-pin.json is missing required file id: ${requiredFileId}`);
    }
  }

  return pin;
}

function readSnapshots(pin) {
  return Object.fromEntries(pin.files.map((file) => [file.id, fs.readFileSync(path.join(packageRoot, file.snapshotPath), 'utf8')]));
}

async function fetchUpstreamFile(repository, ref, upstreamPath) {
  const encodedPath = upstreamPath.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${repository}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': '@fluentui-react-native/design-upstream-drift',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, { headers });
  } catch (error) {
    throw new UpstreamFetchError(`Unable to reach the GitHub API for ${upstreamPath}: ${error.message}`);
  }

  if (!response.ok) {
    throw new UpstreamFetchError(`GitHub API returned ${response.status} ${response.statusText} for ${upstreamPath} at ${ref}.`);
  }

  const payload = await response.json();
  if (payload.encoding !== 'base64' || typeof payload.content !== 'string') {
    throw new UpstreamFetchError(`GitHub API returned unsupported content for ${upstreamPath} at ${ref}.`);
  }

  return Buffer.from(payload.content.replace(/\s/g, ''), 'base64').toString('utf8');
}

async function fetchUpstreamFiles(pin, ref) {
  const contents = await Promise.all(
    pin.files.map(async (file) => [file.id, await fetchUpstreamFile(pin.repository, ref, file.upstreamPath)]),
  );
  return Object.fromEntries(contents);
}

function writeSnapshots(pin, contents) {
  for (const file of pin.files) {
    const snapshotPath = path.join(packageRoot, file.snapshotPath);
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    writeFileAtomically(snapshotPath, contents[file.id]);
  }
}

function writePin(pin) {
  writeFileAtomically(pinPath, `${JSON.stringify(pin, null, 2)}\n`);
}

function writeFileAtomically(filePath, content) {
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryPath, content);
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) {
      fs.unlinkSync(temporaryPath);
    }
  }
}

function normalizeSourceContent(source) {
  return source.replace(/\r\n/g, '\n');
}

function gitBlobSha(source) {
  const content = Buffer.from(normalizeSourceContent(source), 'utf8');
  return crypto.createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
}

function namesFromMappingSection(source, sectionName) {
  const parsed = JSON.parse(source);
  const section = parsed[sectionName];
  if (!Array.isArray(section)) {
    throw new Error(`Upstream mappings.json section ${sectionName} must be an array.`);
  }

  return new Set(
    section.map((entry, index) => {
      if (!entry || typeof entry.name !== 'string') {
        throw new Error(`Upstream mappings.json ${sectionName}[${index}] must have a string name.`);
      }
      return entry.name;
    }),
  );
}

function cssDeclarations(source) {
  const valuesByName = new Map();
  const pattern = /(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g;
  for (const match of source.matchAll(pattern)) {
    const name = match[1];
    const value = match[2].replace(/\s+/g, ' ').trim();
    const values = valuesByName.get(name) ?? new Set();
    values.add(value);
    valuesByName.set(name, values);
  }
  return new Map([...valuesByName].map(([name, values]) => [name, [...values].sort().join(' | ')]));
}

function validateUpstreamContents(contents) {
  for (const requiredFileId of requiredFileIds) {
    if (typeof contents[requiredFileId] !== 'string') {
      throw new Error(`Upstream content is missing required file id: ${requiredFileId}`);
    }
  }

  for (const sectionName of ['generics', 'interaction']) {
    if (namesFromMappingSection(contents.mappings, sectionName).size === 0) {
      throw new Error(`Upstream mappings.json section ${sectionName} must not be empty.`);
    }
  }
  if (cssDeclarations(contents.semanticCss).size === 0) {
    throw new Error('Upstream semantic.css must declare at least one custom property.');
  }
  if (cssDeclarations(contents.interactionFallbackCss).size === 0) {
    throw new Error('Upstream interaction-fallback.css must declare at least one custom property.');
  }
}

function compareNames(baseline, candidate) {
  return {
    added: [...candidate].filter((name) => !baseline.has(name)).sort(),
    removed: [...baseline].filter((name) => !candidate.has(name)).sort(),
  };
}

function compareDeclarations(baseline, candidate) {
  const names = compareNames(new Set(baseline.keys()), new Set(candidate.keys()));
  const changed = [...baseline.keys()]
    .filter((name) => candidate.has(name) && baseline.get(name) !== candidate.get(name))
    .sort()
    .map((name) => ({
      name,
      before: baseline.get(name),
      after: candidate.get(name),
    }));
  return { ...names, changed };
}

function hasNameChanges(comparison) {
  return comparison.added.length > 0 || comparison.removed.length > 0;
}

function createReport(pin, baseline, candidate, candidateRef, mode) {
  const normalizedBaseline = Object.fromEntries(Object.entries(baseline).map(([id, source]) => [id, normalizeSourceContent(source)]));
  const normalizedCandidate = Object.fromEntries(Object.entries(candidate).map(([id, source]) => [id, normalizeSourceContent(source)]));
  const genericTokens = compareNames(
    namesFromMappingSection(normalizedBaseline.mappings, 'generics'),
    namesFromMappingSection(normalizedCandidate.mappings, 'generics'),
  );
  const interactionTokens = compareNames(
    namesFromMappingSection(normalizedBaseline.mappings, 'interaction'),
    namesFromMappingSection(normalizedCandidate.mappings, 'interaction'),
  );
  const semanticProperties = compareNames(
    new Set(cssDeclarations(normalizedBaseline.semanticCss).keys()),
    new Set(cssDeclarations(normalizedCandidate.semanticCss).keys()),
  );
  const interactionFallbackTokens = compareDeclarations(
    cssDeclarations(normalizedBaseline.interactionFallbackCss),
    cssDeclarations(normalizedCandidate.interactionFallbackCss),
  );
  const contentChangedFiles = pin.files
    .filter((file) => normalizedBaseline[file.id] !== normalizedCandidate[file.id])
    .map((file) => file.upstreamPath);
  const snapshotIntegrity = pin.files.map((file) => {
    const actualBlobSha = gitBlobSha(normalizedBaseline[file.id]);
    return {
      path: file.upstreamPath,
      expectedBlobSha: file.blobSha,
      actualBlobSha,
      matches: file.blobSha === actualBlobSha,
    };
  });
  const hasDrift =
    contentChangedFiles.length > 0 ||
    snapshotIntegrity.some((file) => !file.matches) ||
    hasNameChanges(genericTokens) ||
    hasNameChanges(interactionTokens) ||
    hasNameChanges(semanticProperties) ||
    hasNameChanges(interactionFallbackTokens) ||
    interactionFallbackTokens.changed.length > 0;

  return {
    repository: pin.repository,
    baselineCommit: pin.commit,
    candidateRef,
    verifiedDate: pin.verifiedDate,
    mode,
    hasDrift,
    contentChangedFiles,
    snapshotIntegrity,
    mappings: {
      generics: genericTokens,
      interaction: interactionTokens,
    },
    semanticCss: {
      customProperties: semanticProperties,
    },
    interactionFallbackCss: {
      tokens: interactionFallbackTokens,
    },
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const pin = loadPin();
  let baseline = options.updateSnapshots ? undefined : readSnapshots(pin);
  let candidate;
  let mode;
  const candidateRef = options.ref || pin.commit;

  if (options.offline) {
    candidate = baseline;
    mode = 'offline-snapshot';
  } else {
    try {
      candidate = await fetchUpstreamFiles(pin, candidateRef);
      mode = options.updateSnapshots ? 'fetched-and-updated' : 'fetched';
    } catch (error) {
      if (error instanceof UpstreamFetchError && !options.ref && !options.updateSnapshots) {
        console.error(`${error.message} Falling back to checked-in snapshots.`);
        candidate = baseline;
        mode = 'offline-fallback';
      } else {
        throw error;
      }
    }
  }

  if (options.updateSnapshots) {
    validateUpstreamContents(candidate);
    writeSnapshots(pin, candidate);
    for (const file of pin.files) {
      file.blobSha = gitBlobSha(candidate[file.id]);
    }
    writePin(pin);
    baseline = readSnapshots(pin);
  }

  const report = createReport(pin, baseline, candidate, candidateRef, mode);
  console.log(JSON.stringify(report, null, 2));

  if (!options.updateSnapshots && candidateRef === pin.commit && report.hasDrift) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
