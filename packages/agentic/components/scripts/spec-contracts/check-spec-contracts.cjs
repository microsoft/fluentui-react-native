const fs = require('node:fs');
const path = require('node:path');

const {
  contractDirectories,
  componentsRoot,
  invariant,
  isFullSha,
  loadLock,
  packageRoot,
  parseFrontMatter,
  readJson,
  reportPath,
  repositoryRoot,
  sourcePathFor,
} = require('./common.cjs');

const requiredCompanions = ['tokens.yaml', 'accessibility.md', 'interaction.md', 'usage.md', 'source.json'];
const forbiddenCompanionPatterns = [
  [/<(?:button|div|span|label|textarea)\b/, 'HTML element'],
  [/:focus-visible|:where\(|::before|::after/i, 'CSS selector'],
  [/\bbox-shadow\b|\bpseudo-element\b/i, 'CSS rendering mechanism'],
];

function validateExactKeys(value, required, optional, label) {
  invariant(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object.`);
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    invariant(allowed.has(key), `${label} contains unsupported field ${key}.`);
  }
  for (const key of required) {
    invariant(Object.hasOwn(value, key), `${label} is missing ${key}.`);
  }
}

function isSortedUnique(values) {
  return (
    Array.isArray(values) &&
    values.every((value) => typeof value === 'string') &&
    JSON.stringify(values) === JSON.stringify([...new Set(values)].sort())
  );
}

function validateAgencyProfile(lock) {
  const configPath = path.join(repositoryRoot, 'agency.toml');
  invariant(fs.existsSync(configPath), 'The repository must include agency.toml with the flex-authoring profile.');
  const config = fs.readFileSync(configPath, 'utf8');
  invariant(config.includes('[profiles.flex-authoring]'), 'agency.toml must declare the flex-authoring profile.');
  const entries = [];
  let activeEntry;
  for (const rawLine of config.split('\n')) {
    const line = rawLine.trim();
    if (line === '[[profiles.flex-authoring.plugins.default]]') {
      activeEntry = {};
      entries.push(activeEntry);
    } else if (line.startsWith('[')) {
      activeEntry = undefined;
    } else if (activeEntry && line && !line.startsWith('#')) {
      const field = line.match(/^([a-z_]+)\s*=\s*"([^"]+)"$/);
      invariant(field, `Invalid flex-authoring plugin configuration: ${line}`);
      invariant(!Object.hasOwn(activeEntry, field[1]), `Duplicate flex-authoring plugin field ${field[1]}.`);
      activeEntry[field[1]] = field[2];
    }
  }
  invariant(entries.length === lock.plugins.length, 'The flex-authoring profile must contain exactly three plugin entries.');
  for (const entry of entries) {
    validateExactKeys(entry, ['plugin', 'cache_policy'], [], 'flex-authoring plugin entry');
  }

  for (const plugin of lock.plugins) {
    const entry = entries.find((candidate) => candidate.plugin === plugin.spec);
    invariant(entry, `agency.toml is missing ${plugin.spec}.`);
    invariant(entry.cache_policy === 'no-refresh', `${plugin.name} must use no-refresh.`);
  }
}

function validateSource(component, spec, lock) {
  const componentRoot = path.join(componentsRoot, component);
  const sourcePath = sourcePathFor(component);
  const source = readJson(sourcePath);

  validateExactKeys(
    source,
    [
      'schemaVersion',
      'component',
      'skill',
      'sourceLock',
      'sourceLockFingerprint',
      'lifecycle',
      'conformance',
      'reviewedAt',
      'availableSurfaces',
      'surfacesConsulted',
      'sourceFiles',
      'releaseDifferences',
      'divergences',
      'requirements',
    ],
    [],
    `${component}/spec/source.json`,
  );
  invariant(source.schemaVersion === 1, `${component}/spec/source.json must use schemaVersion 1.`);
  invariant(source.component === component, `${component}/spec/source.json has the wrong component.`);
  invariant(source.sourceLock === lock.id, `${component}/spec/source.json must reference ${lock.id}.`);
  invariant(
    source.sourceLockFingerprint === lock.fingerprint,
    `${component}/spec/source.json must reference the active source-lock fingerprint.`,
  );
  invariant(source.skill === `flex-components:${component}`, `${component}/spec/source.json has the wrong skill.`);
  invariant(['contract-draft', 'contract-reviewed', 'implemented'].includes(source.lifecycle), `${component} has an invalid lifecycle.`);
  invariant(['review-required', 'reviewed'].includes(source.conformance), `${component} has an invalid conformance value.`);
  if (source.lifecycle === 'contract-draft') {
    invariant(source.conformance === 'review-required', `${component} draft contracts must require review.`);
  }
  if (source.conformance === 'review-required') {
    invariant(source.reviewedAt === null, `${component} cannot have reviewedAt while review is required.`);
  } else {
    invariant(/^\d{4}-\d{2}-\d{2}$/.test(source.reviewedAt), `${component} reviewedAt must be YYYY-MM-DD.`);
    invariant(source.surfacesConsulted.length > 0, `${component} reviewed contracts must record consulted surfaces.`);
  }
  invariant(isSortedUnique(source.availableSurfaces), `${component} must record sorted availableSurfaces.`);
  invariant(isSortedUnique(source.surfacesConsulted), `${component} must record sorted surfacesConsulted.`);
  invariant(
    source.surfacesConsulted.every((surface) => source.availableSurfaces.includes(surface)),
    `${component} consulted a source surface that is not available.`,
  );
  invariant(Array.isArray(source.sourceFiles) && source.sourceFiles.length > 0, `${component} must record source files.`);
  invariant(
    JSON.stringify(source.sourceFiles.map((file) => file.marketplacePath)) ===
      JSON.stringify(source.sourceFiles.map((file) => file.marketplacePath).sort((left, right) => left.localeCompare(right))),
    `${component} source files must be sorted by Marketplace path.`,
  );

  const sourceRoles = new Set();
  for (const file of source.sourceFiles) {
    validateExactKeys(
      file,
      [
        'role',
        'marketplacePath',
        'marketplaceBlobSha',
        'marketplaceSha256',
        'originPath',
        'originBlobSha',
        'originSha256',
        'contentDiffers',
      ],
      [],
      `${component} source file`,
    );
    invariant(/^[a-z0-9]+(?::[a-z0-9-]+)*$/.test(file.role), `${component} has an invalid source role.`);
    invariant(!sourceRoles.has(file.role), `${component} repeats source role ${file.role}.`);
    sourceRoles.add(file.role);
    invariant(
      file.marketplacePath.startsWith(`catalogs/flex/plugins/components/skills/${component}/`),
      `${component}:${file.role} has a Marketplace path outside its skill.`,
    );
    invariant(
      file.originPath.startsWith(`plugins/components/skills/${component}/`),
      `${component}:${file.role} has an origin path outside its skill.`,
    );
    invariant(
      file.marketplacePath.slice(`catalogs/flex/plugins/components/skills/${component}/`.length) ===
        file.originPath.slice(`plugins/components/skills/${component}/`.length),
      `${component}:${file.role} does not identify the same Marketplace and origin path.`,
    );
    invariant(isFullSha(file.marketplaceBlobSha), `${component}:${file.role} has an invalid Marketplace blob SHA.`);
    invariant(isFullSha(file.originBlobSha), `${component}:${file.role} has an invalid origin blob SHA.`);
    invariant(/^[0-9a-f]{64}$/.test(file.marketplaceSha256), `${component}:${file.role} has an invalid Marketplace SHA-256.`);
    invariant(/^[0-9a-f]{64}$/.test(file.originSha256), `${component}:${file.role} has an invalid origin SHA-256.`);
    invariant(
      file.contentDiffers === (file.marketplaceSha256 !== file.originSha256),
      `${component}:${file.role} has an inconsistent contentDiffers value.`,
    );
  }
  const expectedAvailableSurfaces = [
    ...new Set(
      source.sourceFiles.map((file) => {
        const [surface] = file.role.split(':');
        return surface === 'skill' || surface === 'usage' ? 'shared' : surface;
      }),
    ),
  ].sort();
  invariant(
    JSON.stringify(source.availableSurfaces) === JSON.stringify(expectedAvailableSurfaces),
    `${component} availableSurfaces do not match its source inventory.`,
  );

  invariant(Array.isArray(source.releaseDifferences), `${component} must declare releaseDifferences.`);
  const differingRoles = source.sourceFiles.filter((file) => file.contentDiffers).map((file) => file.role);
  invariant(
    JSON.stringify(source.releaseDifferences.map((difference) => difference.role)) === JSON.stringify(differingRoles),
    `${component} releaseDifferences do not match its Marketplace and origin digests.`,
  );
  for (const difference of source.releaseDifferences) {
    validateExactKeys(difference, ['role', 'status', 'resolution', 'note'], [], `${component} release difference`);
    invariant(
      ['review-required', 'reviewed'].includes(difference.status),
      `${component}:${difference.role} has an invalid release-difference status.`,
    );
    if (difference.status === 'review-required') {
      invariant(difference.resolution === null, `${component}:${difference.role} requires review and cannot have a resolution.`);
      invariant(difference.note === null, `${component}:${difference.role} requires review and cannot have a review note.`);
    } else {
      invariant(
        ['marketplace-authoring-input', 'origin-lineage-reviewed', 'not-material'].includes(difference.resolution),
        `${component}:${difference.role} has an invalid release-difference resolution.`,
      );
      invariant(
        typeof difference.note === 'string' && difference.note.length > 0,
        `${component}:${difference.role} must explain its reviewed release difference.`,
      );
    }
  }
  if (source.conformance === 'reviewed') {
    invariant(
      source.releaseDifferences.every((difference) => difference.status === 'reviewed'),
      `${component} cannot be reviewed while a release-content difference is unresolved.`,
    );
  }

  invariant(Array.isArray(source.divergences), `${component} must declare divergences.`);
  for (const divergence of source.divergences) {
    validateExactKeys(divergence, ['id', 'status'], [], `${component} divergence`);
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(divergence.id), `${component} has an invalid divergence id.`);
    invariant(
      ['accepted', 'deferred', 'aligning', 'not-applicable'].includes(divergence.status),
      `${component}:${divergence.id} has an invalid divergence status.`,
    );
    invariant(spec.includes(`\`${divergence.id}\``), `${component} SPEC.md must describe divergence ${divergence.id}.`);
  }

  invariant(Array.isArray(source.requirements) && source.requirements.length > 0, `${component} must declare contract requirements.`);
  const requirementIds = new Set();
  for (const requirement of source.requirements) {
    validateExactKeys(requirement, ['id'], ['evidence', 'plannedEvidence'], `${component} requirement`);
    invariant(/^[A-Z][A-Z0-9]{1,9}-\d{3}$/.test(requirement.id), `${component} has an invalid requirement id.`);
    invariant(!requirementIds.has(requirement.id), `${component} repeats requirement ${requirement.id}.`);
    requirementIds.add(requirement.id);
    invariant(spec.includes(requirement.id), `${component} SPEC.md must describe requirement ${requirement.id}.`);
    const evidence = requirement.evidence || [];
    const plannedEvidence = requirement.plannedEvidence || [];
    invariant(Array.isArray(evidence), `${requirement.id} evidence must be an array.`);
    invariant(Array.isArray(plannedEvidence), `${requirement.id} plannedEvidence must be an array.`);
    invariant(evidence.length + plannedEvidence.length > 0, `${requirement.id} must name actual or planned evidence.`);
    if (source.lifecycle === 'implemented') {
      invariant(evidence.length > 0, `${requirement.id} must name realized evidence for an implemented component.`);
    }
    for (const evidencePathValue of evidence) {
      const evidencePath = typeof evidencePathValue === 'string' ? path.resolve(componentRoot, evidencePathValue) : '';
      invariant(
        typeof evidencePathValue === 'string' &&
          !path.isAbsolute(evidencePathValue) &&
          evidencePath.startsWith(`${componentRoot}${path.sep}`) &&
          fs.existsSync(evidencePath),
        `${requirement.id} references missing evidence ${evidencePathValue}.`,
      );
    }
    for (const plannedPathValue of plannedEvidence) {
      const plannedPath = typeof plannedPathValue === 'string' ? path.resolve(componentRoot, plannedPathValue) : '';
      invariant(
        typeof plannedPathValue === 'string' && !path.isAbsolute(plannedPathValue) && plannedPath.startsWith(`${componentRoot}${path.sep}`),
        `${requirement.id} has invalid planned evidence ${plannedPathValue}.`,
      );
    }
  }
  return source;
}

function validateComponent(component, lock) {
  const componentRoot = path.join(componentsRoot, component);
  const specPath = path.join(componentRoot, 'SPEC.md');
  const spec = fs.readFileSync(specPath, 'utf8');
  const frontMatter = parseFrontMatter(spec, specPath);

  invariant(frontMatter.name === component, `${component}/SPEC.md must use name: ${component}.`);
  invariant(frontMatter.platform === 'react-native (Windows, macOS)', `${component}/SPEC.md has the wrong platform.`);
  for (const companion of requiredCompanions) {
    invariant(fs.existsSync(path.join(componentRoot, 'spec', companion)), `${component} is missing spec/${companion}.`);
  }
  const source = validateSource(component, spec, lock);
  invariant(frontMatter.status === source.lifecycle, `${component}/SPEC.md status must match its source lifecycle.`);
  invariant(frontMatter.source === './spec/source.json', `${component}/SPEC.md must reference ./spec/source.json.`);
  invariant(frontMatter.tokens === './spec/tokens.yaml', `${component}/SPEC.md must reference ./spec/tokens.yaml.`);
  invariant(frontMatter.accessibility === './spec/accessibility.md', `${component}/SPEC.md must reference ./spec/accessibility.md.`);
  invariant(frontMatter.interaction === './spec/interaction.md', `${component}/SPEC.md must reference ./spec/interaction.md.`);
  invariant(frontMatter.usage === './spec/usage.md', `${component}/SPEC.md must reference ./spec/usage.md.`);

  for (const heading of ['## Scope', '## Public contract', '## Platform behavior', '## Divergences from Flex', '## Conformance']) {
    invariant(spec.includes(heading), `${component}/SPEC.md is missing ${heading}.`);
  }

  for (const companion of ['tokens.yaml', 'accessibility.md', 'interaction.md', 'usage.md']) {
    const companionPath = path.join(componentRoot, 'spec', companion);
    const content = fs.readFileSync(companionPath, 'utf8');
    for (const [pattern, label] of forbiddenCompanionPatterns) {
      invariant(!pattern.test(content), `${component}/spec/${companion} contains a web-only ${label}.`);
    }
  }

  const tokens = fs.readFileSync(path.join(componentRoot, 'spec/tokens.yaml'), 'utf8');
  invariant(/^schemaVersion:\s*1\s*$/m.test(tokens), `${component}/spec/tokens.yaml must use schemaVersion 1.`);
  invariant(new RegExp(`^component:\\s*${component}\\s*$`, 'm').test(tokens), `${component}/spec/tokens.yaml has the wrong component.`);
  invariant(/^implementation:\s*\S+\s*$/m.test(tokens), `${component}/spec/tokens.yaml must identify its implementation.`);
  invariant(/^tokenGaps:\s*(?:\[\])?\s*$/m.test(tokens), `${component}/spec/tokens.yaml must declare tokenGaps.`);
  return source;
}

function validateReport(lock, components) {
  const report = readJson(reportPath);
  validateExactKeys(
    report,
    ['schemaVersion', 'generatedAt', 'sourceLock', 'sourceLockFingerprint', 'baseline', 'external', 'catalog', 'local', 'components'],
    [],
    'spec-source-report.json',
  );
  validateExactKeys(report.baseline, ['marketplaceIndexCommit', 'originCommit'], [], 'report baseline');
  validateExactKeys(report.external, ['mode', 'status', 'marketplaceHead', 'originHead'], [], 'report external state');
  validateExactKeys(report.catalog, ['releaseEntries', 'candidateEntries', 'added', 'removed'], [], 'report catalog');
  invariant(report.schemaVersion === 1, 'spec-source-report.json must use schemaVersion 1.');
  invariant(!Number.isNaN(Date.parse(report.generatedAt)), 'spec-source-report.json must have a valid generatedAt value.');
  invariant(report.generatedAt.slice(0, 10) >= lock.verifiedDate, 'spec-source-report.json predates the active source lock.');
  invariant(report.sourceLock === lock.id, 'spec-source-report.json must reference the active source lock.');
  invariant(report.sourceLockFingerprint === lock.fingerprint, 'spec-source-report.json has a stale source-lock fingerprint.');
  invariant(report.baseline.marketplaceIndexCommit === lock.release.marketplaceIndexCommit, 'The report uses the wrong release.');
  invariant(report.baseline.originCommit === lock.release.originCommit, 'The report uses the wrong origin release.');
  invariant(['current', 'drift-detected', 'unchecked'].includes(report.external.status), 'The report has an invalid external status.');
  if (report.external.mode === 'live') {
    invariant(isFullSha(report.external.marketplaceHead), 'A live report must include the Marketplace head SHA.');
    invariant(isFullSha(report.external.originHead), 'A live report must include the origin head SHA.');
  } else {
    invariant(report.external.mode === 'offline', 'The report has an invalid external mode.');
    invariant(report.external.status === 'unchecked', 'An offline report must leave external state unchecked.');
  }
  invariant(JSON.stringify(report.catalog.releaseEntries) === JSON.stringify(lock.catalog.entries), 'The report release catalog is stale.');
  if (report.external.mode === 'live') {
    invariant(isSortedUnique(report.catalog.candidateEntries), 'The report candidate catalog must be sorted and unique.');
    invariant(
      JSON.stringify(report.catalog.added) ===
        JSON.stringify(report.catalog.candidateEntries.filter((entry) => !lock.catalog.entries.includes(entry))),
      'The report catalog additions are stale.',
    );
    invariant(
      JSON.stringify(report.catalog.removed) ===
        JSON.stringify(lock.catalog.entries.filter((entry) => !report.catalog.candidateEntries.includes(entry))),
      'The report catalog removals are stale.',
    );
  } else {
    invariant(
      report.catalog.candidateEntries === null && report.catalog.added === null && report.catalog.removed === null,
      'An offline report cannot claim candidate catalog state.',
    );
  }

  const sources = new Map(components.map((component) => [component, readJson(sourcePathFor(component))]));
  const implemented = components.filter((component) => sources.get(component).lifecycle === 'implemented');
  const expectedLocal = {
    contracts: components,
    adaptedDrafts: components.filter((component) => sources.get(component).lifecycle !== 'implemented'),
    implemented,
    implementationGap: lock.catalog.entries.filter((entry) => !implemented.includes(entry)),
    noLocalContract: lock.catalog.entries.filter((entry) => !components.includes(entry)),
    legacyMigration: lock.legacyStagedSpecs.map((entry) => ({
      ...entry,
      outcome: 'source-copy-removed',
      record: 'SPEC-MIGRATION.md',
    })),
  };
  invariant(JSON.stringify(report.local) === JSON.stringify(expectedLocal), 'The report local component state is stale.');
  invariant(
    JSON.stringify(report.components.map((entry) => entry.component)) === JSON.stringify(components),
    'The report component details are stale.',
  );
  for (const entry of report.components) {
    const source = readJson(sourcePathFor(entry.component));
    validateExactKeys(
      entry,
      ['component', 'lifecycle', 'conformance', 'releaseDifferences', 'marketplaceDrift', 'originDrift', 'candidateStatus'],
      [],
      `${entry.component} report entry`,
    );
    invariant(entry.lifecycle === source.lifecycle, `${entry.component} has stale lifecycle reporting.`);
    invariant(entry.conformance === source.conformance, `${entry.component} has stale conformance reporting.`);
    invariant(
      JSON.stringify(entry.releaseDifferences) === JSON.stringify(source.releaseDifferences),
      `${entry.component} has stale release-content difference reporting.`,
    );
    if (entry.candidateStatus === 'unchecked') {
      invariant(
        entry.marketplaceDrift === null && entry.originDrift === null,
        `${entry.component} cannot claim unchecked source drift details.`,
      );
    } else {
      invariant(report.external.mode === 'live', `${entry.component} cannot claim checked source drift in an offline report.`);
      for (const drift of [entry.marketplaceDrift, entry.originDrift]) {
        validateExactKeys(drift, ['added', 'removed', 'modified'], [], `${entry.component} source drift`);
        invariant(isSortedUnique(drift.added), `${entry.component} added source paths must be sorted and unique.`);
        invariant(isSortedUnique(drift.removed), `${entry.component} removed source paths must be sorted and unique.`);
        invariant(isSortedUnique(drift.modified), `${entry.component} modified source paths must be sorted and unique.`);
      }
      const hasDrift = [entry.marketplaceDrift, entry.originDrift].some(
        (drift) => drift.added.length > 0 || drift.removed.length > 0 || drift.modified.length > 0,
      );
      invariant(
        entry.candidateStatus === (hasDrift ? 'review-required' : 'current'),
        `${entry.component} has inconsistent candidate source status.`,
      );
    }
  }
  if (report.external.mode === 'live') {
    const driftDetected =
      report.catalog.added.length > 0 ||
      report.catalog.removed.length > 0 ||
      report.components.some((entry) => entry.candidateStatus === 'review-required');
    if (!report.components.some((entry) => entry.candidateStatus === 'unchecked')) {
      invariant(
        report.external.status === (driftDetected ? 'drift-detected' : 'current'),
        'The report external status is inconsistent with its candidate drift.',
      );
    }
  }
}

function validateLegacyStagingRemoval() {
  const legacyRoot = path.join(packageRoot, 'specs');
  if (!fs.existsSync(legacyRoot)) {
    return;
  }
  invariant(fs.readdirSync(legacyRoot).length === 0, 'The legacy staged spec path must be removed.');
}

function main() {
  const lock = loadLock();
  const components = contractDirectories();
  validateAgencyProfile(lock);
  validateLegacyStagingRemoval();
  invariant(fs.existsSync(path.join(packageRoot, 'SPEC-MIGRATION.md')), 'SPEC-MIGRATION.md must record legacy outcomes.');
  const requirementIds = new Set();
  const unratifiedContracts = [];
  for (const component of components) {
    const source = validateComponent(component, lock);
    if (source.lifecycle !== 'contract-draft' && source.conformance === 'review-required') {
      unratifiedContracts.push(component);
    }
    for (const requirement of source.requirements) {
      invariant(!requirementIds.has(requirement.id), `Contract requirement ${requirement.id} is not globally unique.`);
      requirementIds.add(requirement.id);
    }
  }
  validateReport(lock, components);
  invariant(
    unratifiedContracts.length === 0,
    `Reviewed or implemented contracts require source review: ${unratifiedContracts.join(
      ', ',
    )}. Review the locked source changes, then record reviewed conformance, consulted surfaces, and reviewedAt.`,
  );
  console.log(`Validated ${components.length} React Native component contracts against ${lock.id}.`);
}

main();
