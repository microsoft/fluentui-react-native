const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '../..');
const repositoryRoot = path.resolve(packageRoot, '../../..');
const componentsRoot = path.join(packageRoot, 'src/components');
const lockPath = path.join(packageRoot, 'spec-source-lock.json');
const reportPath = path.join(packageRoot, 'spec-source-report.json');

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) {
      fs.unlinkSync(temporaryPath);
    }
  }
}

function isFullSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

function sha256(content) {
  return crypto.createHash('sha256').update(normalizeText(content)).digest('hex');
}

function normalizeText(content) {
  return content.replace(/\r\n/g, '\n');
}

function parseFrontMatter(markdown, filePath) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  invariant(match, `${filePath} must start with YAML front matter.`);
  const values = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/);
    if (field) {
      values[field[1]] = field[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return values;
}

function contractDirectories() {
  return fs
    .readdirSync(componentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(componentsRoot, entry.name, 'SPEC.md')))
    .map((entry) => entry.name)
    .sort();
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function sourceLockFingerprint(lock) {
  const identity = {
    release: lock.release,
    plugins: lock.plugins,
    catalog: lock.catalog,
  };
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(identity)))
    .digest('hex');
}

function loadLock() {
  const lock = readJson(lockPath);
  invariant(lock.schemaVersion === 1, 'spec-source-lock.json must use schemaVersion 1.');
  invariant(typeof lock.id === 'string' && lock.id.length > 0, 'spec-source-lock.json must declare an id.');
  invariant(lock.fingerprint === sourceLockFingerprint(lock), 'spec-source-lock.json has a stale release fingerprint.');
  invariant(/^\d{4}-\d{2}-\d{2}$/.test(lock.verifiedDate), 'spec-source-lock.json verifiedDate must be YYYY-MM-DD.');
  invariant(isFullSha(lock.release.marketplaceIndexCommit), 'Marketplace index commit must be a full SHA.');
  invariant(isFullSha(lock.release.promotionCommit), 'Promotion commit must be a full SHA.');
  invariant(isFullSha(lock.release.playgroundSyncCommit), 'Playground sync commit must be a full SHA.');
  invariant(isFullSha(lock.release.originCommit), 'Origin commit must be a full SHA.');
  invariant(isFullSha(lock.release.originComponentTreeSha), 'Origin component tree must be a full SHA.');
  invariant(isFullSha(lock.release.originCatalogBlobSha), 'Origin catalog blob must be a full SHA.');
  invariant(Array.isArray(lock.plugins) && lock.plugins.length === 3, 'The source lock must declare exactly three Flex plugins.');

  const expectedNames = ['flex-components', 'flex-system', 'flex-tokens'];
  invariant(
    JSON.stringify(lock.plugins.map((plugin) => plugin.name).sort()) === JSON.stringify(expectedNames),
    `The source lock must declare ${expectedNames.join(', ')}.`,
  );
  for (const plugin of lock.plugins) {
    invariant(plugin.versionIsAdvisory === true, `${plugin.name} must mark its version as advisory.`);
    invariant(isFullSha(plugin.treeSha), `${plugin.name} must declare a full tree SHA.`);
    invariant(
      plugin.spec === `market:${plugin.name}@curated#${lock.release.marketplaceIndexCommit}`,
      `${plugin.name} must use its curated Marketplace entry at the release commit.`,
    );
  }

  invariant(Array.isArray(lock.catalog.entries) && lock.catalog.entries.length > 0, 'The source lock must declare catalog entries.');
  const sortedCatalog = [...new Set(lock.catalog.entries)].sort();
  invariant(JSON.stringify(sortedCatalog) === JSON.stringify(lock.catalog.entries), 'Catalog entries must be unique and sorted.');
  invariant(Array.isArray(lock.legacyStagedSpecs), 'The source lock must declare its legacy staged-spec inventory.');
  invariant(
    lock.legacySpecEvidence?.repository === 'microsoft/fluentui-react-native' &&
      isFullSha(lock.legacySpecEvidence.commit) &&
      lock.legacySpecEvidence.pathTemplate === 'packages/agentic/components/specs/{component}/blockers.md',
    'The source lock must identify the immutable legacy blocker evidence.',
  );
  const legacyComponents = lock.legacyStagedSpecs.map((entry) => entry.component);
  invariant(
    JSON.stringify(legacyComponents) === JSON.stringify([...new Set(legacyComponents)].sort()),
    'Legacy staged-spec records must be unique and sorted.',
  );
  for (const entry of lock.legacyStagedSpecs) {
    invariant(
      entry &&
        typeof entry.component === 'string' &&
        /^https:\/\/github\.com\/microsoft\/fluentui-react-native\/issues\/\d+$/.test(entry.issue) &&
        entry.status === 'decision-required' &&
        ['partial', 'feasible-in-principle', 'blocked-as-authored', 'blocked'].includes(entry.feasibility) &&
        typeof entry.reason === 'string' &&
        entry.reason.length > 0 &&
        typeof entry.reevaluation === 'string' &&
        entry.reevaluation.length > 0 &&
        /^\d{4}-\d{2}-\d{2}$/.test(entry.lastEvaluated),
      'Each legacy staged spec must declare structured status, reason, reevaluation, and date.',
    );
  }
  return lock;
}

function sourcePathFor(component) {
  return path.join(componentsRoot, component, 'spec/source.json');
}

function parseCatalogNames(source) {
  return source
    .split('\n')
    .map((line) => line.match(/^([A-Za-z0-9][A-Za-z0-9-]*):\s*$/)?.[1])
    .filter(Boolean)
    .sort();
}

function roleForSourcePath(relativePath) {
  if (relativePath === 'SKILL.md') {
    return 'skill';
  }
  if (relativePath === 'usage.md') {
    return 'usage';
  }
  if (!relativePath.includes('/')) {
    return `shared:${relativePath.replace(/\.(md|yaml)$/, '')}`;
  }
  return relativePath.replace(/\//g, ':').replace(/\.(md|yaml)$/, '');
}

module.exports = {
  contractDirectories,
  componentsRoot,
  invariant,
  isFullSha,
  loadLock,
  lockPath,
  packageRoot,
  parseCatalogNames,
  parseFrontMatter,
  readJson,
  reportPath,
  repositoryRoot,
  roleForSourcePath,
  sha256,
  sourceLockFingerprint,
  sourcePathFor,
  writeJsonAtomic,
};
