const crypto = require('node:crypto');
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

function validateDivergences(component, spec, source) {
  invariant(Array.isArray(source.divergences), `${component} must declare divergences.`);
  for (const divergence of source.divergences) {
    validateExactKeys(divergence, ['id', 'status'], [], `${component} divergence`);
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(divergence.id), `${component} has an invalid divergence id.`);
    invariant(
      ['accepted', 'deferred', 'aligning', 'not-applicable', 'resolved'].includes(divergence.status),
      `${component}:${divergence.id} has an invalid divergence status.`,
    );
    invariant(spec.includes(`\`${divergence.id}\``), `${component} SPEC.md must describe divergence ${divergence.id}.`);
  }
}

function validateRequirements(component, spec, contract, componentRoot) {
  invariant(Array.isArray(contract.requirements) && contract.requirements.length > 0, `${component} must declare contract requirements.`);
  const requirementIds = new Set();
  const sourceIds = new Set(contract.sources.map((source) => source.id));
  for (const requirement of contract.requirements) {
    validateExactKeys(requirement, ['id'], ['sources', 'evidence', 'plannedEvidence'], `${component} requirement`);
    invariant(/^[A-Z][A-Z0-9]{1,9}-\d{3}$/.test(requirement.id), `${component} has an invalid requirement id.`);
    invariant(!requirementIds.has(requirement.id), `${component} repeats requirement ${requirement.id}.`);
    requirementIds.add(requirement.id);
    invariant(spec.includes(requirement.id), `${component} SPEC.md must describe requirement ${requirement.id}.`);
    if (contract.sources.length > 1) {
      invariant(
        isSortedUnique(requirement.sources) && requirement.sources.length > 0,
        `${requirement.id} must identify its governing sources when a contract has multiple sources.`,
      );
    } else if (Object.hasOwn(requirement, 'sources')) {
      invariant(
        isSortedUnique(requirement.sources) && requirement.sources.length > 0,
        `${requirement.id} sources must be sorted and unique.`,
      );
    }
    for (const sourceId of requirement.sources || []) {
      invariant(sourceIds.has(sourceId), `${requirement.id} references unknown source ${sourceId}.`);
    }
    const evidence = requirement.evidence || [];
    const plannedEvidence = requirement.plannedEvidence || [];
    invariant(Array.isArray(evidence), `${requirement.id} evidence must be an array.`);
    invariant(Array.isArray(plannedEvidence), `${requirement.id} plannedEvidence must be an array.`);
    invariant(evidence.length + plannedEvidence.length > 0, `${requirement.id} must name actual or planned evidence.`);
    if (contract.lifecycle === 'implemented') {
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
}

const sourceAuthorities = [
  'behavior-reference',
  'compatibility-reference',
  'implementation-evidence',
  'normative',
  'platform-contract',
  'token-reference',
  'visual-evidence',
];

function validateSourceIdentity(component, source) {
  invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id), `${component} has an invalid source id.`);
  invariant(sourceAuthorities.includes(source.authority), `${component}:${source.id} has an invalid source authority.`);
}

function validateFlexSource(component, contract, source, lock) {
  validateExactKeys(
    source,
    [
      'id',
      'kind',
      'authority',
      'skill',
      'sourceLock',
      'sourceLockFingerprint',
      'availableSurfaces',
      'surfacesConsulted',
      'sourceFiles',
      'releaseDifferences',
    ],
    [],
    `${component}:${source.id}`,
  );
  validateSourceIdentity(component, source);
  invariant(source.kind === 'flex-skill', `${component}:${source.id} has the wrong source kind.`);
  invariant(source.authority === 'normative', `${component}:${source.id} must be normative.`);
  invariant(source.sourceLock === lock.id, `${component}:${source.id} must reference ${lock.id}.`);
  invariant(
    source.sourceLockFingerprint === lock.fingerprint,
    `${component}:${source.id} must reference the active source-lock fingerprint.`,
  );
  invariant(source.skill === `flex-components:${component}`, `${component}:${source.id} has the wrong skill.`);
  invariant(isSortedUnique(source.availableSurfaces), `${component}:${source.id} must record sorted availableSurfaces.`);
  invariant(isSortedUnique(source.surfacesConsulted), `${component}:${source.id} must record sorted surfacesConsulted.`);
  invariant(
    source.surfacesConsulted.every((surface) => source.availableSurfaces.includes(surface)),
    `${component}:${source.id} consulted a source surface that is not available.`,
  );
  if (contract.conformance === 'reviewed') {
    invariant(source.surfacesConsulted.length > 0, `${component}:${source.id} reviewed contracts must record consulted surfaces.`);
  }
  invariant(Array.isArray(source.sourceFiles) && source.sourceFiles.length > 0, `${component}:${source.id} must record source files.`);
  invariant(
    JSON.stringify(source.sourceFiles.map((file) => file.marketplacePath)) ===
      JSON.stringify(source.sourceFiles.map((file) => file.marketplacePath).sort((left, right) => left.localeCompare(right))),
    `${component}:${source.id} source files must be sorted by Marketplace path.`,
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
      `${component}:${source.id} source file`,
    );
    invariant(/^[a-z0-9]+(?::[a-z0-9-]+)*$/.test(file.role), `${component}:${source.id} has an invalid source role.`);
    invariant(!sourceRoles.has(file.role), `${component}:${source.id} repeats source role ${file.role}.`);
    sourceRoles.add(file.role);
    invariant(
      file.marketplacePath.startsWith(`catalogs/flex/plugins/components/skills/${component}/`),
      `${component}:${source.id}:${file.role} has a Marketplace path outside its skill.`,
    );
    invariant(
      file.originPath.startsWith(`plugins/components/skills/${component}/`),
      `${component}:${source.id}:${file.role} has an origin path outside its skill.`,
    );
    invariant(
      file.marketplacePath.slice(`catalogs/flex/plugins/components/skills/${component}/`.length) ===
        file.originPath.slice(`plugins/components/skills/${component}/`.length),
      `${component}:${source.id}:${file.role} does not identify the same Marketplace and origin path.`,
    );
    invariant(isFullSha(file.marketplaceBlobSha), `${component}:${source.id}:${file.role} has an invalid Marketplace blob SHA.`);
    invariant(isFullSha(file.originBlobSha), `${component}:${source.id}:${file.role} has an invalid origin blob SHA.`);
    invariant(/^[0-9a-f]{64}$/.test(file.marketplaceSha256), `${component}:${source.id}:${file.role} has an invalid Marketplace SHA-256.`);
    invariant(/^[0-9a-f]{64}$/.test(file.originSha256), `${component}:${source.id}:${file.role} has an invalid origin SHA-256.`);
    invariant(
      file.contentDiffers === (file.marketplaceSha256 !== file.originSha256),
      `${component}:${source.id}:${file.role} has an inconsistent contentDiffers value.`,
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
    `${component}:${source.id} availableSurfaces do not match its source inventory.`,
  );

  invariant(Array.isArray(source.releaseDifferences), `${component}:${source.id} must declare releaseDifferences.`);
  const differingRoles = source.sourceFiles.filter((file) => file.contentDiffers).map((file) => file.role);
  invariant(
    JSON.stringify(source.releaseDifferences.map((difference) => difference.role)) === JSON.stringify(differingRoles),
    `${component}:${source.id} releaseDifferences do not match its Marketplace and origin digests.`,
  );
  for (const difference of source.releaseDifferences) {
    validateExactKeys(difference, ['role', 'status', 'resolution', 'note'], [], `${component}:${source.id} release difference`);
    invariant(
      ['review-required', 'reviewed'].includes(difference.status),
      `${component}:${source.id}:${difference.role} has an invalid release-difference status.`,
    );
    if (difference.status === 'review-required') {
      invariant(
        difference.resolution === null,
        `${component}:${source.id}:${difference.role} requires review and cannot have a resolution.`,
      );
      invariant(difference.note === null, `${component}:${source.id}:${difference.role} requires review and cannot have a review note.`);
    } else {
      invariant(
        ['marketplace-authoring-input', 'origin-lineage-reviewed', 'not-material'].includes(difference.resolution),
        `${component}:${source.id}:${difference.role} has an invalid release-difference resolution.`,
      );
      invariant(
        typeof difference.note === 'string' && difference.note.length > 0,
        `${component}:${source.id}:${difference.role} must explain its reviewed release difference.`,
      );
    }
  }
  if (contract.conformance === 'reviewed') {
    invariant(
      source.releaseDifferences.every((difference) => difference.status === 'reviewed'),
      `${component}:${source.id} cannot be reviewed while a release-content difference is unresolved.`,
    );
  }
}

function validateLocalFoundationSource(component, source, lock) {
  validateExactKeys(source, ['id', 'kind', 'authority', 'references'], [], `${component}:${source.id}`);
  validateSourceIdentity(component, source);
  invariant(source.kind === 'local-foundation', `${component}:${source.id} has the wrong source kind.`);
  invariant(source.authority === 'normative', `${component}:${source.id} must be normative.`);
  invariant(!lock.catalog.entries.includes(component), `${component} has a Flex catalog entry and cannot use a local-foundation source.`);
  invariant(Array.isArray(source.references) && source.references.length > 0, `${component}:${source.id} must record references.`);
  invariant(
    JSON.stringify(source.references.map((reference) => reference.id)) ===
      JSON.stringify(source.references.map((reference) => reference.id).sort()),
    `${component}:${source.id} references must be sorted by id.`,
  );
  const referenceIds = new Set();
  for (const reference of source.references) {
    validateExactKeys(reference, ['id', 'type', 'authority', 'location'], [], `${component}:${source.id} reference`);
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(reference.id), `${component}:${source.id} has an invalid reference id.`);
    invariant(!referenceIds.has(reference.id), `${component}:${source.id} repeats reference ${reference.id}.`);
    referenceIds.add(reference.id);
    invariant(sourceAuthorities.includes(reference.authority), `${component}:${source.id}:${reference.id} has an invalid authority.`);
    invariant(
      ['external', 'repository'].includes(reference.type),
      `${component}:${source.id}:${reference.id} has an invalid reference type.`,
    );
    if (reference.type === 'external') {
      invariant(reference.location.startsWith('https://'), `${component}:${source.id}:${reference.id} must use an HTTPS reference.`);
    } else {
      const referencePath = path.resolve(repositoryRoot, reference.location);
      invariant(
        !path.isAbsolute(reference.location) && referencePath.startsWith(`${repositoryRoot}${path.sep}`) && fs.existsSync(referencePath),
        `${component}:${source.id}:${reference.id} references missing repository content ${reference.location}.`,
      );
    }
  }
}

function validateArtifactLocation(component, source, artifact) {
  invariant(
    typeof artifact.location === 'string' && artifact.location.length > 0,
    `${component}:${source.id}:${artifact.id} needs a location.`,
  );
  invariant(/^[0-9a-f]{64}$/.test(artifact.sha256), `${component}:${source.id}:${artifact.id} has an invalid SHA-256.`);
  if (!artifact.location.startsWith('https://')) {
    const artifactPath = path.resolve(repositoryRoot, artifact.location);
    invariant(
      !path.isAbsolute(artifact.location) && artifactPath.startsWith(`${repositoryRoot}${path.sep}`) && fs.existsSync(artifactPath),
      `${component}:${source.id}:${artifact.id} references missing repository content ${artifact.location}.`,
    );
    const digest = crypto.createHash('sha256').update(fs.readFileSync(artifactPath)).digest('hex');
    invariant(digest === artifact.sha256, `${component}:${source.id}:${artifact.id} has a stale SHA-256.`);
  }
}

function validateGitFilesSource(component, source) {
  validateExactKeys(source, ['id', 'kind', 'authority', 'repository', 'commit', 'files'], [], `${component}:${source.id}`);
  validateSourceIdentity(component, source);
  invariant(source.kind === 'git-files', `${component}:${source.id} has the wrong source kind.`);
  invariant(
    /^(?:https:\/\/\S+|[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/.test(source.repository),
    `${component}:${source.id} has an invalid repository.`,
  );
  invariant(isFullSha(source.commit), `${component}:${source.id} must identify an immutable commit.`);
  invariant(Array.isArray(source.files) && source.files.length > 0, `${component}:${source.id} must record files.`);
  invariant(
    JSON.stringify(source.files.map((file) => file.path)) === JSON.stringify(source.files.map((file) => file.path).sort()),
    `${component}:${source.id} files must be sorted by path.`,
  );
  const paths = new Set();
  for (const file of source.files) {
    validateExactKeys(file, ['role', 'path', 'sha256'], [], `${component}:${source.id} file`);
    invariant(/^[a-z0-9]+(?::[a-z0-9-]+)*$/.test(file.role), `${component}:${source.id} has an invalid file role.`);
    invariant(
      typeof file.path === 'string' &&
        file.path.length > 0 &&
        !path.isAbsolute(file.path) &&
        !file.path.includes('\\') &&
        !file.path.split('/').includes('..'),
      `${component}:${source.id} has an invalid file path.`,
    );
    invariant(!paths.has(file.path), `${component}:${source.id} repeats file ${file.path}.`);
    paths.add(file.path);
    invariant(/^[0-9a-f]{64}$/.test(file.sha256), `${component}:${source.id}:${file.path} has an invalid SHA-256.`);
  }
}

function validateHtmlCssSource(component, source) {
  validateExactKeys(source, ['id', 'kind', 'authority', 'origin', 'artifacts'], [], `${component}:${source.id}`);
  validateSourceIdentity(component, source);
  invariant(source.kind === 'html-css', `${component}:${source.id} has the wrong source kind.`);
  invariant(typeof source.origin === 'string' && source.origin.length > 0, `${component}:${source.id} must identify its origin.`);
  invariant(Array.isArray(source.artifacts) && source.artifacts.length > 0, `${component}:${source.id} must record artifacts.`);
  invariant(
    JSON.stringify(source.artifacts.map((artifact) => artifact.id)) ===
      JSON.stringify(source.artifacts.map((artifact) => artifact.id).sort()),
    `${component}:${source.id} artifacts must be sorted by id.`,
  );
  const artifactIds = new Set();
  for (const artifact of source.artifacts) {
    validateExactKeys(artifact, ['id', 'kind', 'location', 'sha256'], [], `${component}:${source.id} artifact`);
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(artifact.id), `${component}:${source.id} has an invalid artifact id.`);
    invariant(!artifactIds.has(artifact.id), `${component}:${source.id} repeats artifact ${artifact.id}.`);
    artifactIds.add(artifact.id);
    invariant(
      ['accessibility-tree', 'computed-styles', 'css', 'html', 'screenshot'].includes(artifact.kind),
      `${component}:${source.id}:${artifact.id} has an invalid artifact kind.`,
    );
    validateArtifactLocation(component, source, artifact);
  }
}

function validateVisualReferenceSource(component, source) {
  validateExactKeys(source, ['id', 'kind', 'authority', 'artifacts'], [], `${component}:${source.id}`);
  validateSourceIdentity(component, source);
  invariant(source.kind === 'visual-reference', `${component}:${source.id} has the wrong source kind.`);
  invariant(source.authority === 'visual-evidence', `${component}:${source.id} must use visual-evidence authority.`);
  invariant(Array.isArray(source.artifacts) && source.artifacts.length > 0, `${component}:${source.id} must record artifacts.`);
  invariant(
    JSON.stringify(source.artifacts.map((artifact) => artifact.id)) ===
      JSON.stringify(source.artifacts.map((artifact) => artifact.id).sort()),
    `${component}:${source.id} artifacts must be sorted by id.`,
  );
  const artifactIds = new Set();
  for (const artifact of source.artifacts) {
    validateExactKeys(
      artifact,
      ['id', 'location', 'sha256'],
      ['appearance', 'state', 'platform', 'scale', 'viewport', 'locale'],
      `${component}:${source.id} artifact`,
    );
    invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(artifact.id), `${component}:${source.id} has an invalid artifact id.`);
    invariant(!artifactIds.has(artifact.id), `${component}:${source.id} repeats artifact ${artifact.id}.`);
    artifactIds.add(artifact.id);
    validateArtifactLocation(component, source, artifact);
    for (const field of ['appearance', 'state', 'platform', 'viewport', 'locale']) {
      if (Object.hasOwn(artifact, field)) {
        invariant(
          typeof artifact[field] === 'string' && artifact[field].length > 0,
          `${component}:${source.id}:${artifact.id} has invalid ${field}.`,
        );
      }
      if (Object.hasOwn(artifact, 'scale')) {
        invariant(
          typeof artifact.scale === 'number' && artifact.scale > 0,
          `${component}:${source.id}:${artifact.id} has an invalid scale.`,
        );
      }
    }
  }
}

function validateSource(component, spec, lock) {
  const componentRoot = path.join(componentsRoot, component);
  const sourcePath = sourcePathFor(component);
  const contract = readJson(sourcePath);

  validateExactKeys(
    contract,
    ['schemaVersion', 'component', 'lifecycle', 'conformance', 'reviewedAt', 'sources', 'divergences', 'requirements'],
    [],
    `${component}/spec/source.json`,
  );
  invariant(contract.schemaVersion === 2, `${component}/spec/source.json must use schemaVersion 2.`);
  invariant(contract.component === component, `${component}/spec/source.json has the wrong component.`);
  invariant(['contract-draft', 'contract-reviewed', 'implemented'].includes(contract.lifecycle), `${component} has an invalid lifecycle.`);
  invariant(['review-required', 'reviewed'].includes(contract.conformance), `${component} has an invalid conformance value.`);
  if (contract.lifecycle === 'contract-draft') {
    invariant(contract.conformance === 'review-required', `${component} draft contracts must require review.`);
  } else {
    invariant(contract.conformance === 'reviewed', `${component} ${contract.lifecycle} contracts must be reviewed.`);
  }
  if (contract.conformance === 'review-required') {
    invariant(contract.reviewedAt === null, `${component} cannot have reviewedAt while review is required.`);
  } else {
    invariant(/^\d{4}-\d{2}-\d{2}$/.test(contract.reviewedAt), `${component} reviewedAt must be YYYY-MM-DD.`);
  }

  invariant(Array.isArray(contract.sources) && contract.sources.length > 0, `${component} must declare sources.`);
  invariant(
    JSON.stringify(contract.sources.map((source) => source.id)) === JSON.stringify(contract.sources.map((source) => source.id).sort()),
    `${component} sources must be sorted by id.`,
  );
  const sourceIds = new Set();
  for (const source of contract.sources) {
    invariant(!sourceIds.has(source.id), `${component} repeats source ${source.id}.`);
    sourceIds.add(source.id);
    if (source.kind === 'flex-skill') {
      validateFlexSource(component, contract, source, lock);
    } else if (source.kind === 'local-foundation') {
      validateLocalFoundationSource(component, source, lock);
    } else if (source.kind === 'git-files') {
      validateGitFilesSource(component, source);
    } else if (source.kind === 'html-css') {
      validateHtmlCssSource(component, source);
    } else if (source.kind === 'visual-reference') {
      validateVisualReferenceSource(component, source);
    } else {
      throw new Error(`${component}:${source.id} has unsupported source kind ${source.kind}.`);
    }
  }
  const localFoundationSources = contract.sources.filter((source) => source.kind === 'local-foundation');
  invariant(
    localFoundationSources.length === 0 || (localFoundationSources.length === 1 && contract.sources.length === 1),
    `${component} local-foundation must be the only source.`,
  );
  invariant(
    contract.sources.filter((source) => source.kind === 'flex-skill').length <= 1,
    `${component} cannot declare more than one Flex skill source.`,
  );

  validateDivergences(component, spec, contract);
  validateRequirements(component, spec, contract, componentRoot);
  return contract;
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

  for (const heading of ['## Scope', '## Public contract', '## Platform behavior', '## Conformance']) {
    invariant(spec.includes(heading), `${component}/SPEC.md is missing ${heading}.`);
  }
  invariant(
    spec.includes('## Divergences') || spec.includes('## Divergences from Flex'),
    `${component}/SPEC.md is missing its divergences section.`,
  );

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
    const contract = readJson(sourcePathFor(entry.component));
    const flexSource = contract.sources.find((source) => source.kind === 'flex-skill');
    validateExactKeys(
      entry,
      ['component', 'lifecycle', 'conformance', 'releaseDifferences', 'marketplaceDrift', 'originDrift', 'candidateStatus'],
      [],
      `${entry.component} report entry`,
    );
    invariant(entry.lifecycle === contract.lifecycle, `${entry.component} has stale lifecycle reporting.`);
    invariant(entry.conformance === contract.conformance, `${entry.component} has stale conformance reporting.`);
    invariant(
      JSON.stringify(entry.releaseDifferences) === JSON.stringify(flexSource?.releaseDifferences || []),
      `${entry.component} has stale release-content difference reporting.`,
    );
    if (!flexSource) {
      invariant(entry.candidateStatus === 'not-applicable', `${entry.component} must omit Flex candidate drift.`);
      invariant(
        entry.marketplaceDrift === null && entry.originDrift === null,
        `${entry.component} without a Flex source cannot report Flex drift.`,
      );
    } else if (entry.candidateStatus === 'unchecked') {
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
