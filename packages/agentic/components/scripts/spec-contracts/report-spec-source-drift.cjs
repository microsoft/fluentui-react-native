const fs = require('node:fs');
const path = require('node:path');

const {
  contractDirectories,
  invariant,
  loadLock,
  parseCatalogNames,
  readJson,
  reportPath,
  roleForSourcePath,
  sha256,
  sourcePathFor,
  writeJsonAtomic,
} = require('./common.cjs');

const commandLine = process.argv.slice(2);
let component;
let offline = false;
let updateSources = false;
let write = false;

for (let index = 0; index < commandLine.length; index += 1) {
  const argument = commandLine[index];
  if (argument === '--offline') {
    offline = true;
  } else if (argument === '--update-sources') {
    updateSources = true;
  } else if (argument === '--write') {
    write = true;
  } else if (argument === '--component') {
    invariant(component === undefined, '--component may be specified only once.');
    component = commandLine[index + 1];
    invariant(component && !component.startsWith('--'), '--component requires a component name.');
    index += 1;
  } else if (argument.startsWith('--component=')) {
    invariant(component === undefined, '--component may be specified only once.');
    component = argument.slice('--component='.length);
    invariant(component.length > 0, '--component requires a component name.');
  } else {
    throw new Error(`Unknown argument: ${argument}`);
  }
}
invariant(!(offline && updateSources), '--offline cannot update component source metadata.');
invariant(!updateSources || write, '--update-sources must be paired with --write.');
invariant(!component || updateSources, '--component is only valid with --update-sources.');

function githubToken() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  invariant(token, 'Live source reporting requires GITHUB_TOKEN or GH_TOKEN.');
  return token;
}

async function githubJson(repository, route, token) {
  const url = `https://api.github.com/repos/${repository}${route}`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': '@fluentui-react-native/components-spec-source',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
    } catch (error) {
      if (attempt === 2) {
        throw new Error(`GitHub request failed for ${repository}${route}: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      continue;
    }
    if (response.ok) {
      return response.json();
    }
    if (attempt < 2 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      continue;
    }
    throw new Error(`GitHub API returned ${response.status} ${response.statusText} for ${repository}${route}.`);
  }
  throw new Error(`GitHub request failed for ${repository}${route}.`);
}

async function commitSha(repository, ref, token) {
  return (await githubJson(repository, `/commits/${encodeURIComponent(ref)}`, token)).sha;
}

async function recursiveTree(repository, ref, token) {
  const payload = await githubJson(repository, `/git/trees/${encodeURIComponent(ref)}?recursive=1`, token);
  invariant(!payload.truncated, `GitHub returned a truncated tree for ${repository}@${ref}.`);
  return new Map(payload.tree.map((entry) => [entry.path, entry]));
}

async function decodedContent(repository, filePath, ref, token) {
  const route = `/contents/${filePath.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`;
  const payload = await githubJson(repository, route, token);
  invariant(payload.encoding === 'base64' && typeof payload.content === 'string', `Unsupported content for ${filePath}.`);
  return Buffer.from(payload.content.replace(/\s/g, ''), 'base64').toString('utf8');
}

async function blobContent(repository, blobSha, token) {
  const payload = await githubJson(repository, `/git/blobs/${blobSha}`, token);
  invariant(payload.encoding === 'base64' && typeof payload.content === 'string', `Unsupported blob ${blobSha}.`);
  return Buffer.from(payload.content.replace(/\s/g, ''), 'base64').toString('utf8');
}

function componentSourceEntries(tree, prefix) {
  return [...tree.values()]
    .filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix) && /\.(?:md|yaml)$/.test(entry.path))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function relativeSourcePath(fullPath, prefix) {
  return fullPath.slice(prefix.length);
}

function normalizedSourceIdentity(file) {
  return {
    role: file.role,
    marketplacePath: file.marketplacePath,
    marketplaceBlobSha: file.marketplaceBlobSha,
    marketplaceSha256: file.marketplaceSha256 || file.sha256,
    originPath: file.originPath,
    originBlobSha: file.originBlobSha,
    originSha256: file.originSha256 || file.sha256,
  };
}

function sourceIdentityMatches(existingFiles, sourceFiles) {
  if (!Array.isArray(existingFiles) || existingFiles.length !== sourceFiles.length) {
    return false;
  }
  const normalize = (files) =>
    files.map(normalizedSourceIdentity).sort((left, right) => left.marketplacePath.localeCompare(right.marketplacePath));
  return JSON.stringify(normalize(existingFiles)) === JSON.stringify(normalize(sourceFiles));
}

async function updateComponentSources(lock, marketplaceTree, originTree, token) {
  const targets = component ? [component] : contractDirectories();
  const updates = new Map();
  for (const target of targets) {
    invariant(contractDirectories().includes(target), `${target} must have a local SPEC.md before source metadata is generated.`);
    const marketplacePrefix = `catalogs/flex/plugins/components/skills/${target}/`;
    const originPrefix = `plugins/components/skills/${target}/`;
    const marketplaceEntries = componentSourceEntries(marketplaceTree, marketplacePrefix);
    invariant(marketplaceEntries.length > 0, `The release does not contain flex-components:${target}.`);

    const sourceFiles = [];
    for (const marketplaceEntry of marketplaceEntries) {
      const relativePath = relativeSourcePath(marketplaceEntry.path, marketplacePrefix);
      const originPath = `${originPrefix}${relativePath}`;
      const originEntry = originTree.get(originPath);
      invariant(originEntry?.type === 'blob', `The release origin is missing ${originPath}.`);
      const marketplaceContent = await blobContent(lock.release.marketplaceRepository, marketplaceEntry.sha, token);
      const originContent =
        marketplaceEntry.sha === originEntry.sha
          ? marketplaceContent
          : await blobContent(lock.release.originRepository, originEntry.sha, token);
      const marketplaceSha256 = sha256(marketplaceContent);
      const originSha256 = sha256(originContent);
      sourceFiles.push({
        role: roleForSourcePath(relativePath),
        marketplacePath: marketplaceEntry.path,
        marketplaceBlobSha: marketplaceEntry.sha,
        marketplaceSha256,
        originPath,
        originBlobSha: originEntry.sha,
        originSha256,
        contentDiffers: marketplaceSha256 !== originSha256,
      });
    }

    const sourcePath = sourcePathFor(target);
    const existing = fs.existsSync(sourcePath) ? readJson(sourcePath) : {};
    const availableSurfaces = [
      ...new Set(
        sourceFiles.map((file) => {
          const [surface] = file.role.split(':');
          return surface === 'skill' || surface === 'usage' ? 'shared' : surface;
        }),
      ),
    ].sort();
    const sameSource =
      existing.sourceLock === lock.id &&
      existing.sourceLockFingerprint === lock.fingerprint &&
      sourceIdentityMatches(existing.sourceFiles, sourceFiles);
    const conformance = sameSource ? existing.conformance || 'review-required' : 'review-required';
    const existingDifferences = new Map(
      (sameSource ? existing.releaseDifferences || [] : []).map((difference) => [difference.role, difference]),
    );
    const releaseDifferences = sourceFiles
      .filter((file) => file.contentDiffers)
      .map(
        (file) =>
          existingDifferences.get(file.role) || {
            role: file.role,
            status: 'review-required',
            resolution: null,
            note: null,
          },
      );
    const source = {
      schemaVersion: 1,
      component: target,
      skill: `flex-components:${target}`,
      sourceLock: lock.id,
      sourceLockFingerprint: lock.fingerprint,
      lifecycle: existing.lifecycle || 'contract-draft',
      conformance,
      reviewedAt: conformance === 'review-required' ? null : existing.reviewedAt,
      availableSurfaces,
      surfacesConsulted: sameSource
        ? (existing.surfacesConsulted || []).filter((surface) => availableSurfaces.includes(surface)).sort()
        : [],
      sourceFiles,
      releaseDifferences,
      divergences: existing.divergences || [],
      requirements: existing.requirements || [],
    };
    updates.set(target, source);
  }
  return updates;
}

function verifyReleaseIntegrity(lock, marketplaceTree, originTree, releaseCatalogSource) {
  for (const plugin of lock.plugins) {
    const pluginDirectory = plugin.name.replace(/^flex-/, '');
    const entry = marketplaceTree.get(`catalogs/flex/plugins/${pluginDirectory}`);
    invariant(entry?.type === 'tree', `The Marketplace release is missing ${plugin.name}.`);
    invariant(entry.sha === plugin.treeSha, `${plugin.name} tree SHA does not match the source lock.`);
  }

  const originComponentTree = originTree.get('plugins/components');
  invariant(originComponentTree?.type === 'tree', 'The origin release is missing plugins/components.');
  invariant(
    originComponentTree.sha === lock.release.originComponentTreeSha,
    'The origin component tree SHA does not match the source lock.',
  );

  const originCatalog = originTree.get(lock.catalog.sourcePath);
  invariant(originCatalog?.type === 'blob', `The origin release is missing ${lock.catalog.sourcePath}.`);
  invariant(originCatalog.sha === lock.release.originCatalogBlobSha, 'The origin catalog blob SHA does not match the source lock.');
  invariant(
    JSON.stringify(parseCatalogNames(releaseCatalogSource)) === JSON.stringify(lock.catalog.entries),
    'The locked catalog entries do not match the immutable origin catalog.',
  );
}

async function verifyComponentSourceIntegrity(lock, marketplaceTree, originTree, token, proposedSources = new Map()) {
  const digestCache = new Map();
  async function digest(repository, blobSha) {
    const key = `${repository}:${blobSha}`;
    if (!digestCache.has(key)) {
      digestCache.set(
        key,
        blobContent(repository, blobSha, token).then((content) => sha256(content)),
      );
    }
    return digestCache.get(key);
  }

  for (const target of contractDirectories()) {
    const source = proposedSources.get(target) || readJson(sourcePathFor(target));
    invariant(source.sourceLock === lock.id, `${target} does not reference the active source lock.`);
    invariant(source.sourceLockFingerprint === lock.fingerprint, `${target} does not reference the active source-lock fingerprint.`);
    const marketplacePrefix = `catalogs/flex/plugins/components/skills/${target}/`;
    const originPrefix = `plugins/components/skills/${target}/`;
    const marketplaceEntries = componentSourceEntries(marketplaceTree, marketplacePrefix);
    const originEntries = componentSourceEntries(originTree, originPrefix);
    const marketplacePaths = marketplaceEntries.map((entry) => relativeSourcePath(entry.path, marketplacePrefix));
    const originPaths = originEntries.map((entry) => relativeSourcePath(entry.path, originPrefix));
    const recordedMarketplacePaths = source.sourceFiles.map((file) => relativeSourcePath(file.marketplacePath, marketplacePrefix));
    const recordedOriginPaths = source.sourceFiles.map((file) => relativeSourcePath(file.originPath, originPrefix));
    invariant(
      JSON.stringify(marketplacePaths) === JSON.stringify(recordedMarketplacePaths),
      `${target} Marketplace source inventory does not match the immutable release.`,
    );
    invariant(
      JSON.stringify(originPaths) === JSON.stringify(recordedOriginPaths),
      `${target} origin source inventory does not match the immutable release.`,
    );

    for (const file of source.sourceFiles) {
      const marketplaceEntry = marketplaceTree.get(file.marketplacePath);
      const originEntry = originTree.get(file.originPath);
      invariant(
        marketplaceEntry?.type === 'blob' && marketplaceEntry.sha === file.marketplaceBlobSha,
        `${target}:${file.role} Marketplace blob does not match the immutable release.`,
      );
      invariant(
        originEntry?.type === 'blob' && originEntry.sha === file.originBlobSha,
        `${target}:${file.role} origin blob does not match the immutable release.`,
      );
      invariant(
        (await digest(lock.release.marketplaceRepository, file.marketplaceBlobSha)) === file.marketplaceSha256,
        `${target}:${file.role} Marketplace SHA-256 does not match the immutable release.`,
      );
      invariant(
        (await digest(lock.release.originRepository, file.originBlobSha)) === file.originSha256,
        `${target}:${file.role} origin SHA-256 does not match the immutable release.`,
      );
    }
  }
}

function sourceDrift(source, tree, channel) {
  const pathField = channel === 'marketplace' ? 'marketplacePath' : 'originPath';
  const shaField = channel === 'marketplace' ? 'marketplaceBlobSha' : 'originBlobSha';
  const prefix =
    channel === 'marketplace'
      ? `catalogs/flex/plugins/components/skills/${source.component}/`
      : `plugins/components/skills/${source.component}/`;
  const baseline = new Map(source.sourceFiles.map((file) => [relativeSourcePath(file[pathField], prefix), file[shaField]]));
  const candidate = new Map(componentSourceEntries(tree, prefix).map((entry) => [relativeSourcePath(entry.path, prefix), entry.sha]));
  return {
    added: [...candidate.keys()].filter((filePath) => !baseline.has(filePath)).sort(),
    removed: [...baseline.keys()].filter((filePath) => !candidate.has(filePath)).sort(),
    modified: [...baseline.keys()]
      .filter((filePath) => candidate.has(filePath) && candidate.get(filePath) !== baseline.get(filePath))
      .sort(),
  };
}

function localComponentReport(marketplaceTree, originTree) {
  return contractDirectories().map((target) => {
    const source = readJson(sourcePathFor(target));
    const marketplaceDrift = marketplaceTree ? sourceDrift(source, marketplaceTree, 'marketplace') : null;
    const originDrift = originTree ? sourceDrift(source, originTree, 'origin') : null;
    const hasCandidateDrift =
      marketplaceDrift &&
      originDrift &&
      [marketplaceDrift, originDrift].some((drift) => drift.added.length > 0 || drift.removed.length > 0 || drift.modified.length > 0);
    return {
      component: target,
      lifecycle: source.lifecycle,
      conformance: source.conformance,
      releaseDifferences: source.releaseDifferences,
      marketplaceDrift,
      originDrift,
      candidateStatus: marketplaceTree && originTree ? (hasCandidateDrift ? 'review-required' : 'current') : 'unchecked',
    };
  });
}

function localState(lock) {
  const contracts = contractDirectories();
  const implemented = contracts.filter((target) => readJson(sourcePathFor(target)).lifecycle === 'implemented');
  return {
    contracts,
    adaptedDrafts: contracts.filter((target) => !implemented.includes(target)),
    implemented,
    implementationGap: lock.catalog.entries.filter((entry) => !implemented.includes(entry)),
    noLocalContract: lock.catalog.entries.filter((entry) => !contracts.includes(entry)),
    legacyMigration: lock.legacyStagedSpecs.map((entry) => ({
      ...entry,
      outcome: 'source-copy-removed',
      record: 'SPEC-MIGRATION.md',
    })),
  };
}

async function liveReport(lock) {
  const token = githubToken();
  const marketplaceHead = await commitSha(lock.release.marketplaceRepository, 'main', token);
  const originHead = await commitSha(lock.release.originRepository, 'main', token);
  const [releaseMarketplaceTree, releaseOriginTree, marketplaceTree, originTree, releaseCatalogSource, candidateCatalogSource] =
    await Promise.all([
      recursiveTree(lock.release.marketplaceRepository, lock.release.marketplaceIndexCommit, token),
      recursiveTree(lock.release.originRepository, lock.release.originCommit, token),
      recursiveTree(lock.release.marketplaceRepository, marketplaceHead, token),
      recursiveTree(lock.release.originRepository, originHead, token),
      decodedContent(lock.release.originRepository, lock.catalog.sourcePath, lock.release.originCommit, token),
      decodedContent(lock.release.originRepository, lock.catalog.sourcePath, originHead, token),
    ]);

  verifyReleaseIntegrity(lock, releaseMarketplaceTree, releaseOriginTree, releaseCatalogSource);

  const sourceUpdates = updateSources ? await updateComponentSources(lock, releaseMarketplaceTree, releaseOriginTree, token) : new Map();
  await verifyComponentSourceIntegrity(lock, releaseMarketplaceTree, releaseOriginTree, token, sourceUpdates);
  for (const [target, source] of sourceUpdates) {
    const sourcePath = sourcePathFor(target);
    fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
    writeJsonAtomic(sourcePath, source);
  }

  const candidateEntries = parseCatalogNames(candidateCatalogSource);
  const releaseEntries = lock.catalog.entries;
  const components = localComponentReport(marketplaceTree, originTree);
  const added = candidateEntries.filter((entry) => !releaseEntries.includes(entry));
  const removed = releaseEntries.filter((entry) => !candidateEntries.includes(entry));
  const driftDetected = added.length > 0 || removed.length > 0 || components.some((entry) => entry.candidateStatus === 'review-required');

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceLock: lock.id,
    sourceLockFingerprint: lock.fingerprint,
    baseline: {
      marketplaceIndexCommit: lock.release.marketplaceIndexCommit,
      originCommit: lock.release.originCommit,
    },
    external: {
      mode: 'live',
      status: driftDetected ? 'drift-detected' : 'current',
      marketplaceHead,
      originHead,
    },
    catalog: {
      releaseEntries,
      candidateEntries,
      added,
      removed,
    },
    local: localState(lock),
    components,
  };
}

function offlineReport(lock) {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceLock: lock.id,
    sourceLockFingerprint: lock.fingerprint,
    baseline: {
      marketplaceIndexCommit: lock.release.marketplaceIndexCommit,
      originCommit: lock.release.originCommit,
    },
    external: {
      mode: 'offline',
      status: 'unchecked',
      marketplaceHead: null,
      originHead: null,
    },
    catalog: {
      releaseEntries: lock.catalog.entries,
      candidateEntries: null,
      added: null,
      removed: null,
    },
    local: localState(lock),
    components: localComponentReport(),
  };
}

function offlineRefresh(lock) {
  invariant(fs.existsSync(reportPath), 'Offline refresh requires an existing committed live report.');
  const existing = readJson(reportPath);
  invariant(existing.sourceLock === lock.id, 'The existing report uses a different source lock.');
  invariant(existing.sourceLockFingerprint === lock.fingerprint, 'The existing report uses a different source-lock fingerprint.');
  invariant(existing.external?.mode === 'live', 'Offline refresh requires prior live source evidence.');
  const existingComponents = new Map(existing.components.map((entry) => [entry.component, entry]));
  const components = contractDirectories().map((target) => {
    const source = readJson(sourcePathFor(target));
    const previous = existingComponents.get(target);
    return {
      component: target,
      lifecycle: source.lifecycle,
      conformance: source.conformance,
      releaseDifferences: source.releaseDifferences,
      marketplaceDrift: previous?.marketplaceDrift ?? null,
      originDrift: previous?.originDrift ?? null,
      candidateStatus: previous?.candidateStatus ?? 'unchecked',
    };
  });
  return {
    ...existing,
    local: localState(lock),
    components,
  };
}

async function main() {
  const lock = loadLock();
  if (component) {
    invariant(lock.catalog.entries.includes(component), `${component} is not in the locked Flex component catalog.`);
  }
  const report = offline ? (write ? offlineRefresh(lock) : offlineReport(lock)) : await liveReport(lock);
  if (write) {
    writeJsonAtomic(reportPath, report);
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
