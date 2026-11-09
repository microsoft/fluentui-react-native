import { createHash, createPublicKey, verify } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { SyntaxKind } from 'typescript/unstable/ast';
import { createScanner } from 'typescript/unstable/ast/scanner';

import { hex, object, text, timestamp } from './controlAssessment.ts';
import { member, safeArtifactFile, strings } from './readinessEvidence.ts';
import type { EvidenceEnvironment, EvidenceOutcome, ReadinessEvidence, TestObservation } from './readinessEvidence.ts';
import { readinessLevels, readinessTargets, repositoryFile } from './readinessModel.ts';
import type { ReadinessControl, ReadinessLevel, ReadinessTarget } from './readinessModel.ts';

export const readinessDimensions = [
  'fidelity',
  'contractCoverage',
  'accessibility',
  'platformValidation',
  'apiStability',
  'tokenCompleteness',
] as const;
export const ownerRecordKinds = [
  'visual',
  'manual',
  'spec-fidelity',
  'mapping-completeness',
  'upstream-currency',
  'api-stability',
  'token-decision',
  'keyboard',
  'screen-reader',
  'required-check',
  'maturity-declaration',
  'approval',
] as const;
export type OwnerRecordKind = (typeof ownerRecordKinds)[number];
export type MaturityStatus = ReadinessLevel | 'deprecated';
const maturityStatuses = [...readinessLevels, 'deprecated'] as const;
export type OwnerTrustKey = {
  id: string;
  owner: string;
  publicKey: string;
  expiresAt: string;
  controls: string[];
  kinds: OwnerRecordKind[];
};
export type ReadinessPolicy = {
  schemaVersion: 1;
  policyVersion: string;
  proposal: '#4251';
  provisional: true;
  ownerAdoption: boolean;
  levels: typeof readinessLevels;
  terminalStatus: 'deprecated';
  dimensions: typeof readinessDimensions;
  supportedTargets: ReadinessTarget[];
  trustedKeys: OwnerTrustKey[];
  limitations: string[];
};
export type OwnerRecord = {
  schemaVersion: 1;
  policyVersion: string;
  kind: OwnerRecordKind;
  owner: string;
  controlId: string;
  contractDigest: string;
  reviewDigest: string;
  mappingDigest: string | null;
  sourceCommit: string;
  inputDigest: string;
  buildId: string;
  target: ReadinessTarget | null;
  observedAt: string;
  expiresAt: string;
  observation: string;
  report: { path: string; sha256: string };
  artifacts: { path: string; sha256: string }[];
  details: Record<string, unknown>;
};
export type ReviewedRecord = { record: OwnerRecord; authenticated: boolean; reasons: string[]; signature: string; keyId: string };
const authenticatedRecords = new WeakMap<ReviewedRecord, { payload: string; policy: string }>();

function exactKeys(data: Record<string, unknown>, keys: readonly string[], label: string): void {
  if (Object.keys(data).length !== keys.length || Object.keys(data).some((key) => !keys.includes(key)))
    throw new Error(`${label} has missing or unrecognized fields.`);
}

export function canonicalPayload(value: unknown): string {
  function encode(value: unknown): string {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
    if (typeof value === 'number' && Number.isSafeInteger(value) && !Object.is(value, -0)) return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(encode).join(',')}]`;
    const data = object(value, 'Canonical signed payload');
    if (Object.getPrototypeOf(data) !== Object.prototype && Object.getPrototypeOf(data) !== null)
      throw new Error('Signed payload must use plain JSON objects.');
    return `{${Object.keys(data)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${encode(data[key])}`)
      .join(',')}}`;
  }
  return `furn-readiness-owner-record:v1\n${encode(value)}`;
}

export function parseReadinessPolicy(value: unknown): ReadinessPolicy {
  const data = object(value, 'Readiness owner policy');
  exactKeys(
    data,
    [
      'schemaVersion',
      'policyVersion',
      'proposal',
      'provisional',
      'ownerAdoption',
      'levels',
      'terminalStatus',
      'dimensions',
      'supportedTargets',
      'trustedKeys',
      'limitations',
    ],
    'Readiness policy',
  );
  if (
    data.schemaVersion !== 1 ||
    data.proposal !== '#4251' ||
    data.provisional !== true ||
    data.terminalStatus !== 'deprecated' ||
    typeof data.ownerAdoption !== 'boolean'
  )
    throw new Error('Unsupported or non-provisional readiness policy.');
  if (
    JSON.stringify(data.levels) !== JSON.stringify(readinessLevels) ||
    JSON.stringify(data.dimensions) !== JSON.stringify(readinessDimensions)
  )
    throw new Error('Readiness policy must retain all levels and six dimensions.');
  const supportedTargets = strings(data.supportedTargets, 'Supported targets').map((target) =>
    member(target, readinessTargets, 'Supported target'),
  );
  if (supportedTargets.length !== readinessTargets.length || new Set(supportedTargets).size !== readinessTargets.length)
    throw new Error('Provisional policy must retain all four target rows.');
  if (!Array.isArray(data.trustedKeys)) throw new Error('Owner trust keys must be an array.');
  const trustedKeys = data.trustedKeys.map((value): OwnerTrustKey => {
    const key = object(value, 'Owner public key');
    exactKeys(key, ['id', 'owner', 'publicKey', 'expiresAt', 'controls', 'kinds'], 'Owner trust key');
    const publicKey = text(key.publicKey, 'Owner public key PEM');
    if (createPublicKey(publicKey).asymmetricKeyType !== 'ed25519') throw new Error('Owner keys must use Ed25519.');
    const controls = strings(key.controls, 'Authorized control IDs');
    const kinds = strings(key.kinds, 'Authorized record kinds').map((kind) => member(kind, ownerRecordKinds, 'Record kind'));
    if (!controls.length || !kinds.length || controls.includes('*'))
      throw new Error('Owner trust must name exact controls and record kinds.');
    return {
      id: text(key.id, 'Key ID'),
      owner: text(key.owner, 'Owner identity'),
      publicKey,
      expiresAt: timestamp(key.expiresAt, 'Owner key expiry'),
      controls,
      kinds,
    };
  });
  if (new Set(trustedKeys.map(({ id }) => id)).size !== trustedKeys.length) throw new Error('Duplicate owner key ID.');
  return {
    schemaVersion: 1,
    policyVersion: text(data.policyVersion, 'Policy version'),
    proposal: '#4251',
    provisional: true,
    ownerAdoption: data.ownerAdoption,
    levels: readinessLevels,
    terminalStatus: 'deprecated',
    dimensions: readinessDimensions,
    supportedTargets,
    trustedKeys,
    limitations: strings(data.limitations, 'Policy limitations'),
  };
}

function artifact(value: unknown): { path: string; sha256: string } {
  const data = object(value, 'Reviewed artifact');
  exactKeys(data, ['path', 'sha256'], 'Reviewed artifact');
  return { path: text(data.path, 'Artifact path'), sha256: hex(data.sha256, 64, 'Artifact SHA256') };
}

export function parseOwnerRecord(value: unknown): OwnerRecord {
  const data = object(value, 'Owner record payload');
  exactKeys(
    data,
    [
      'schemaVersion',
      'policyVersion',
      'kind',
      'owner',
      'controlId',
      'contractDigest',
      'reviewDigest',
      'mappingDigest',
      'sourceCommit',
      'inputDigest',
      'buildId',
      'target',
      'observedAt',
      'expiresAt',
      'observation',
      'report',
      'artifacts',
      'details',
    ],
    'Owner record',
  );
  if (data.schemaVersion !== 1 || !Array.isArray(data.artifacts) || !data.artifacts.length)
    throw new Error('Owner record requires schema 1 and actual reviewed artifacts.');
  const observedAt = timestamp(data.observedAt, 'Owner observation time');
  const expiresAt = timestamp(data.expiresAt, 'Owner observation expiry');
  if (Date.parse(expiresAt) <= Date.parse(observedAt)) throw new Error('Owner record expiry must follow its observation.');
  const kind = member(data.kind, ownerRecordKinds, 'Owner record kind');
  const target = data.target === null ? null : member(data.target, readinessTargets, 'Owner target');
  if (['visual', 'manual', 'keyboard', 'screen-reader'].includes(kind) && target === null)
    throw new Error('Platform observations must name their exact endpoint/renderer target.');
  const details = object(data.details, 'Owner observation details');
  if (['maturity-declaration', 'approval'].includes(kind)) member(details.status, maturityStatuses, 'Maturity status');
  return {
    schemaVersion: 1,
    policyVersion: text(data.policyVersion, 'Owner policy version'),
    kind,
    owner: text(data.owner, 'Observation owner'),
    controlId: text(data.controlId, 'Exact control ID'),
    contractDigest: hex(data.contractDigest, 64, 'Reviewed contract hash'),
    reviewDigest: hex(data.reviewDigest, 64, 'Reviewed source hash'),
    mappingDigest: data.mappingDigest === null ? null : hex(data.mappingDigest, 64, 'Reviewed mapping hash'),
    sourceCommit: hex(data.sourceCommit, 40, 'Reviewed source commit'),
    inputDigest: hex(data.inputDigest, 64, 'Reviewed tracked inputs'),
    buildId: text(data.buildId, 'Reviewed build identity'),
    target,
    observedAt,
    expiresAt,
    observation: text(data.observation, 'Actual observation details'),
    report: artifact(data.report),
    artifacts: data.artifacts.map(artifact),
    details,
  };
}

export function authenticateOwnerRecord(
  value: unknown,
  directory: string,
  policy: ReadinessPolicy,
  control: ReadinessControl,
  environment: EvidenceEnvironment,
): ReviewedRecord {
  const envelope = object(value, 'Signed owner record');
  exactKeys(envelope, ['keyId', 'signature', 'payload'], 'Signed owner envelope');
  const record = parseOwnerRecord(envelope.payload);
  const keyId = text(envelope.keyId, 'Signing key ID');
  const signature = text(envelope.signature, 'Ed25519 signature');
  if (!/^[A-Za-z0-9+/]{86}==$/.test(signature)) throw new Error('Expected a canonical base64 Ed25519 signature.');
  const reasons: string[] = [];
  const key = policy.trustedKeys.find((key) => key.id === keyId);
  if (!key || key.owner !== record.owner || !key.controls.includes(control.id) || !key.kinds.includes(record.kind))
    reasons.push('Owner signing key is not trusted for this exact control and record kind.');
  else {
    if (!verify(null, Buffer.from(canonicalPayload(envelope.payload)), createPublicKey(key.publicKey), Buffer.from(signature, 'base64')))
      reasons.push('Owner signature does not authenticate the canonical payload.');
    if (Date.parse(key.expiresAt) <= Date.now()) reasons.push('Owner signing key has expired.');
  }
  if (record.policyVersion !== policy.policyVersion) reasons.push('Owner record targets a different policy version.');
  if (
    record.controlId !== control.id ||
    record.contractDigest !== control.contractDigest ||
    record.reviewDigest !== control.reviewDigest ||
    record.mappingDigest !== control.mappingDigest ||
    record.sourceCommit !== environment.source.commit ||
    record.inputDigest !== environment.source.inputDigest ||
    record.buildId !== environment.identity?.buildId ||
    environment.source.dirty
  )
    reasons.push('Owner record does not match the exact current control, contract, review, source, clean inputs, or build.');
  // Caller-provided report dates may not revive an expired owner decision.
  if (Date.parse(record.observedAt) > Date.now() || Date.parse(record.expiresAt) <= Date.now())
    reasons.push('Owner observation is future-dated or expired.');
  for (const reference of [record.report, ...record.artifacts]) {
    if (
      createHash('sha256')
        .update(readFileSync(safeArtifactFile(directory, reference.path)))
        .digest('hex') !== reference.sha256
    )
      reasons.push(`Reviewed artifact bytes changed: ${reference.path}.`);
  }
  const result = { record, authenticated: reasons.length === 0, reasons, signature, keyId };
  if (result.authenticated) authenticatedRecords.set(result, { payload: canonicalPayload(record), policy: canonicalPayload(policy) });
  return result;
}

function completeInventory(value: unknown, expected: readonly string[], label: string): boolean {
  const actual = strings(value, label);
  return actual.length === expected.length && new Set(actual).size === actual.length && expected.every((id) => actual.includes(id));
}

function passingAssertions(record: OwnerRecord, observations: TestObservation[], field: string): boolean {
  const assertions = strings(record.details[field], field);
  return (
    assertions.length > 0 &&
    assertions.every((name) =>
      observations.some(
        (entry) => entry.name === name && entry.outcome === 'passed' && (record.target === null || entry.target === record.target),
      ),
    )
  );
}

export function upstreamCurrency(control: ReadinessControl, record?: OwnerRecord): { current: boolean; reasons: string[] } {
  if (!control.sources.length)
    return {
      current: true,
      reasons: ['Local foundation contract has no normative external pin; no fabricated upstream currency claim is needed.'],
    };
  if (!record)
    return {
      current: false,
      reasons: ['Every normative external source needs a current authenticated upstream observation, not a local file hash.'],
    };
  if (!Array.isArray(record.details.sources)) throw new Error('Upstream observation requires a source inventory.');
  const observations = record.details.sources.map((value) => object(value, 'Current normative source observation'));
  const reasons: string[] = [];
  if (observations.length !== control.sources.length) reasons.push('Upstream observation omits or adds normative sources.');
  for (const source of control.sources) {
    const matching = observations.filter((value) => value.id === source.id);
    if (matching.length !== 1) {
      reasons.push(`Missing unique current upstream observation for ${source.id}.`);
      continue;
    }
    const observed = matching[0];
    text(observed.observationLocation, 'Actual current upstream source location');
    timestamp(observed.observedAt, 'Upstream observation time');
    if (
      !source.lock ||
      !source.fingerprint ||
      observed.sourceLock !== source.lock ||
      observed.fingerprint !== source.fingerprint ||
      observed.currentSourceLock !== source.lock ||
      observed.currentFingerprint !== source.fingerprint ||
      observed.resolution !== 'unchanged' ||
      Date.parse(String(observed.observedAt)) > Date.now() ||
      Date.parse(String(observed.observedAt)) > Date.parse(record.observedAt) ||
      Date.now() - Date.parse(String(observed.observedAt)) > 168 * 3_600_000
    )
      reasons.push(`Unresolved changed pin, missing pin, or stale current-upstream observation for ${source.id}.`);
  }
  return { current: reasons.length === 0, reasons };
}

function implementationExported(root: string, control: ReadinessControl): boolean {
  const entry = `${control.packagePath}/src/${control.kind === 'primitive' ? 'primitives/' : ''}index.ts`;
  if (!existsSync(path.join(root, entry))) return false;
  const content = readFileSync(repositoryFile(root, entry), 'utf8');
  const module = `${control.kind === 'primitive' ? './' : './components/'}${control.component}/${control.component}`;
  const implementation = `${control.directory}/${control.component}.tsx`;
  const tsImplementation = `${control.directory}/${control.component}.ts`;
  if (!control.files.includes(implementation) && !control.files.includes(tsImplementation)) return false;
  const scanner = createScanner(true, undefined, content);
  let depth = 0;
  for (let token = scanner.scan(); token !== SyntaxKind.EndOfFile; token = scanner.scan()) {
    if (token === SyntaxKind.OpenBraceToken) depth++;
    if (token === SyntaxKind.CloseBraceToken) depth--;
    if (depth !== 0 || token !== SyntaxKind.ExportKeyword || scanner.scan() !== SyntaxKind.OpenBraceToken) continue;
    let runtimeExport = false;
    let specifierStart = true;
    for (token = scanner.scan(); token !== SyntaxKind.CloseBraceToken && token !== SyntaxKind.EndOfFile; token = scanner.scan()) {
      if (token === SyntaxKind.CommaToken) specifierStart = true;
      else if (specifierStart) {
        runtimeExport ||= token !== SyntaxKind.TypeKeyword;
        specifierStart = false;
      }
    }
    if (
      runtimeExport &&
      scanner.scan() === SyntaxKind.FromKeyword &&
      scanner.scan() === SyntaxKind.StringLiteral &&
      scanner.getTokenValue() === module
    )
      return true;
  }
  return false;
}

function checkedOutcome(tests: { outcome: EvidenceOutcome }[]): EvidenceOutcome {
  if (!tests.length) return 'missing';
  if (tests.some(({ outcome }) => outcome === 'failed')) return 'failed';
  return tests.every(({ outcome }) => outcome === 'passed') ? 'passed' : tests.find(({ outcome }) => outcome !== 'passed')!.outcome;
}

export type PreviousReadinessStatus = {
  controlId: string;
  evidenceSupportedStatus: ReadinessLevel | null;
  approvedStatus: MaturityStatus | null;
  declaredStatus?: MaturityStatus | null;
};
export function compareReadinessStatus(
  previous: ReadinessLevel | null,
  current: ReadinessLevel | null,
): 'promotion' | 'demotion' | 'unchanged' {
  const rank = (status: ReadinessLevel | null) => (status === null ? -1 : readinessLevels.indexOf(status));
  return rank(current) > rank(previous) ? 'promotion' : rank(current) < rank(previous) ? 'demotion' : 'unchanged';
}

export function assessReadinessControl(options: {
  root: string;
  control: ReadinessControl;
  policy: ReadinessPolicy;
  environment: EvidenceEnvironment;
  evidence: ReadinessEvidence;
  records?: ReviewedRecord[];
  previous?: PreviousReadinessStatus;
}) {
  const { root, control, policy, environment, evidence, previous } = options;
  const records = options.records ?? [];
  const authenticated = records
    .filter((reviewed) => {
      const binding = authenticatedRecords.get(reviewed);
      const { record } = reviewed;
      const key = policy.trustedKeys.find(({ id }) => id === reviewed.keyId);
      return (
        reviewed.authenticated &&
        binding?.payload === canonicalPayload(record) &&
        binding.policy === canonicalPayload(policy) &&
        key !== undefined &&
        Date.parse(key.expiresAt) > Date.now() &&
        record.controlId === control.id &&
        record.contractDigest === control.contractDigest &&
        record.reviewDigest === control.reviewDigest &&
        record.mappingDigest === control.mappingDigest &&
        record.sourceCommit === environment.source.commit &&
        record.inputDigest === environment.source.inputDigest &&
        record.buildId === environment.identity?.buildId &&
        !environment.source.dirty &&
        Date.parse(record.observedAt) <= Date.now() &&
        Date.parse(record.expiresAt) > Date.now()
      );
    })
    .map(({ record }) => record);
  const get = (kind: OwnerRecordKind) => {
    const matches = authenticated.filter((record) => record.kind === kind);
    if (matches.length > 1 && !['visual', 'manual', 'keyboard', 'screen-reader'].includes(kind))
      throw new Error(`Ambiguous authenticated ${kind} records for ${control.id}.`);
    return matches[0];
  };
  const reviewedObservations: TestObservation[] = authenticated
    .filter((record) => ['visual', 'manual'].includes(record.kind))
    .flatMap((record) => {
      const names = strings(record.details.assertionNames, 'Reviewed exact observation identities');
      const passed = record.details.result === 'passed';
      if (!['passed', 'failed', 'skipped', 'unsupported'].includes(String(record.details.result)))
        throw new Error('Invalid reviewed observation outcome.');
      if (record.kind === 'visual') {
        member(record.details.comparison, ['reviewed-baseline', 'manual'], 'Visual comparison method');
        const baseline = hex(record.details.baselineSha256, 64, 'Visual baseline hash');
        const actual = hex(record.details.actualSha256, 64, 'Visual actual hash');
        if (![baseline, actual].every((digest) => record.artifacts.some(({ sha256 }) => sha256 === digest)))
          throw new Error('Visual baseline and actual bytes must both be bound reviewed artifacts.');
      }
      return names.map(
        (name): TestObservation => ({
          kind: member(record.kind, ['visual', 'manual'], 'Observation adapter'),
          name,
          ...(record.target === null ? {} : { target: record.target }),
          recordedOutcome: member(record.details.result, ['passed', 'failed', 'skipped', 'unsupported'], 'Reviewed result'),
          outcome: passed ? 'passed' : member(record.details.result, ['failed', 'skipped', 'unsupported'], 'Reviewed non-pass'),
          reasons: [record.observation],
          reportSha256: record.report.sha256,
          buildId: record.buildId,
        }),
      );
    });
  const observations = [
    ...evidence.observations.filter((entry) => entry.controlId === undefined || entry.controlId === control.id),
    ...reviewedObservations,
  ];
  const requirements = control.requirements.map((requirement) => {
    const checks = (control.mapping?.requirements[requirement.id]?.checks ?? []).map((check) => {
      const tests = check.tests.map((link) => {
        const matches = observations.filter(
          (entry) =>
            entry.kind === link.kind &&
            entry.name === link.name &&
            (link.target === undefined || entry.target === link.target) &&
            (link.input === undefined || entry.input === link.input),
        );
        const outcome: EvidenceOutcome = !control.mappingCurrent ? 'stale' : matches.length ? checkedOutcome(matches) : 'missing';
        return { ...link, outcome, observations: matches };
      });
      return { ...check, tests, outcome: control.mappingCurrent ? checkedOutcome(tests) : 'stale' };
    });
    return {
      ...requirement,
      checks,
      outcome: control.mappingCurrent ? checkedOutcome(checks) : control.mapping === null ? 'missing' : 'stale',
    };
  });
  const checks = requirements.flatMap(({ checks }) => checks);
  const checkIds = [...new Set(checks.map(({ id }) => id))];
  const requirementIds = control.requirements.map(({ id }) => id);
  const mappingReview = get('mapping-completeness');
  const coverageComplete =
    control.mappingCurrent &&
    checks.length > 0 &&
    requirements.every(({ checks }) => checks.length > 0) &&
    checks.every(({ outcome }) => outcome === 'passed');
  const supplementalMappingReview = mappingReview
    ? {
        owner: mappingReview.owner,
        matchesInventory:
          mappingReview.details.complete === true &&
          completeInventory(mappingReview.details.requirementIds, requirementIds, 'Reviewed requirement inventory') &&
          completeInventory(mappingReview.details.checkIds, checkIds, 'Reviewed acceptance-check inventory') &&
          Boolean(text(mappingReview.details.reviewBasis, 'Requirement-first review basis')),
      }
    : null;
  const fidelity = get('spec-fidelity');
  const axisChecks = checks.filter(
    (check) =>
      check.outcome === 'passed' &&
      (check.source.split('#')[0] === 'spec/tokens.yaml' || ['axes', 'props-and-defaults'].includes(check.source.split('#')[1])) &&
      check.tests.some(({ kind }) => kind === 'unit' || kind === 'native'),
  );
  const accessibilityChecks = checks.filter(
    (check) =>
      check.outcome === 'passed' &&
      (check.source.split('#')[0] === 'spec/accessibility.md' || check.source.split('#')[1] === 'accessibility') &&
      check.tests.some(({ kind }) => kind === 'unit' || kind === 'native'),
  );
  const reviewedFidelityAssertions = fidelity
    ? completeInventory(fidelity.details.requirementIds, requirementIds, 'Fidelity requirements') &&
      passingAssertions(fidelity, observations, 'axisAssertions') &&
      passingAssertions(fidelity, observations, 'accessibilityAssertions')
    : false;
  const assertions = coverageComplete && ((axisChecks.length > 0 && accessibilityChecks.length > 0) || reviewedFidelityAssertions);
  const currency = upstreamCurrency(control, get('upstream-currency'));
  const pinned = control.sources.every(({ lock, fingerprint }) => lock !== null && fingerprint !== null);
  const implemented = implementationExported(root, control);
  const unit = observations.some((entry) => entry.kind === 'unit' && entry.outcome === 'passed');
  const types =
    control.typeFiles.length > 0 &&
    control.typeFiles.every((file) =>
      observations.some((entry) => entry.kind === 'type' && entry.name === file && entry.outcome === 'passed'),
    );
  const story = control.storyFiles.length > 0;
  const targets = readinessTargets.map((target) => ({
    target,
    supported: policy.supportedTargets.includes(target),
    lanes: (['accessible', 'physical', 'all'] as const).map((input) => {
      const entries = observations.filter((entry) => entry.kind === 'native' && entry.target === target && entry.input === input);
      const selections = evidence.nativeSelections.filter((selection) => selection.target === target && selection.input === input);
      const linked = checks
        .flatMap(({ tests }) => tests)
        .filter(
          (link) =>
            link.kind === 'native' &&
            (link.target === undefined || link.target === target) &&
            (link.input === undefined || link.input === input),
        );
      return {
        input,
        outcome: entries.length ? checkedOutcome(entries) : selections.length ? checkedOutcome(selections) : 'missing',
        requirementCoverage:
          linked.length &&
          linked.every(
            (link) => link.outcome === 'passed' && entries.some((entry) => entry.name === link.name && entry.outcome === 'passed'),
          )
            ? 'passed'
            : 'missing',
        observations: entries,
        selections,
      };
    }),
  }));
  const native = targets.every(
    ({ supported, lanes }) =>
      !supported || lanes.some(({ outcome, requirementCoverage }) => outcome === 'passed' && requirementCoverage === 'passed'),
  );
  const targetRecords = (kind: OwnerRecordKind) =>
    policy.supportedTargets.every((target) =>
      authenticated.some(
        (record) =>
          record.kind === kind &&
          record.target === target &&
          record.details.result === 'passed' &&
          strings(record.details.scenarios, 'Manual conformance scenarios').length > 0 &&
          text(record.details.assistiveTechnology, 'Keyboard or screen-reader environment'),
      ),
    );
  const visual = policy.supportedTargets.every((target) =>
    reviewedObservations.some((entry) => entry.kind === 'visual' && entry.target === target && entry.outcome === 'passed'),
  );
  const api = get('api-stability');
  const apiCommitted = Boolean(
    api && text(api.details.commitment, 'API stability commitment') && text(api.details.compatibilityWindow, 'API compatibility window'),
  );
  const tokens = get('token-decision');
  const tokenDecided = Boolean(
    tokens &&
    text(tokens.details.decision, 'Explicit token-gap decision') &&
    Array.isArray(tokens.details.gaps) &&
    tokens.details.unresolved === false,
  );
  const enforcement = get('required-check');
  const requiredChecks = enforcement ? strings(enforcement.details.requiredChecks, 'Actually enforced required checks') : [];
  const enforced = Boolean(
    enforcement &&
    enforcement.details.enforcement === 'required' &&
    enforcement.details.repository === environment.identity?.repository &&
    requiredChecks.length > 0 &&
    enforcement.details.workflow === environment.identity?.workflow &&
    requiredChecks.includes(environment.identity?.job ?? '') &&
    text(enforcement.details.branch, 'Enforced branch') &&
    hex(enforcement.details.observedConfigurationDigest, 64, 'Observed required-check configuration hash') === enforcement.report.sha256,
  );
  const dimensionGates = {
    fidelity: {
      experimental: implemented && story,
      preview: assertions && pinned,
      beta: visual && currency.current,
      stable: visual && currency.current,
    },
    contractCoverage: { experimental: implemented, preview: coverageComplete, beta: coverageComplete, stable: coverageComplete },
    accessibility: {
      experimental: unit,
      preview: assertions,
      beta: assertions && native,
      stable: targetRecords('keyboard') && targetRecords('screen-reader'),
    },
    platformValidation: { experimental: unit && story, preview: types, beta: native, stable: native && enforced },
    apiStability: { experimental: implemented, preview: types, beta: types, stable: apiCommitted },
    tokenCompleteness: { experimental: implemented, preview: pinned, beta: visual, stable: tokenDecided },
  };
  const explanations = {
    fidelity:
      'Needs exported implementation/story, reviewed SPEC/axis assertions, recorded pins, then visual comparisons and current upstream observations.',
    contractCoverage: 'Needs complete requirement-first reviewed mapping, a current review digest, and every acceptance check passing.',
    accessibility:
      'Needs runtime accessibility assertions and native evidence; stable additionally needs per-target keyboard and screen-reader signoffs.',
    platformValidation: 'Needs actual runtime/type execution, all supported target evidence, and actual required-check enforcement.',
    apiStability: 'Needs real compiler/type-test execution, then an authenticated API-stability commitment.',
    tokenCompleteness: 'Needs recorded source pins, visual evidence, then an authenticated explicit token-gap decision.',
  };
  const dimensions = readinessDimensions.map((dimension) => ({
    dimension,
    gates: dimensionGates[dimension],
    blockers: readinessLevels.filter((level) => !dimensionGates[dimension][level]).map((level) => `${level}: ${explanations[dimension]}`),
  }));
  let ceiling: ReadinessLevel | null = null;
  for (const level of readinessLevels) {
    if (!dimensions.every(({ gates }) => gates[level])) break;
    ceiling = level;
  }
  const declaration = get('maturity-declaration');
  const declaredStatus = declaration ? member(declaration.details.status, maturityStatuses, 'Declared status') : null;
  const approval = get('approval');
  const requestedApproval = approval ? member(approval.details.status, maturityStatuses, 'Approved status') : null;
  const terminalDeprecated =
    declaredStatus === 'deprecated' || previous?.declaredStatus === 'deprecated' || previous?.approvedStatus === 'deprecated';
  const approvedStatus: MaturityStatus | null =
    policy.ownerAdoption &&
    requestedApproval !== null &&
    (requestedApproval === 'deprecated'
      ? terminalDeprecated
      : !terminalDeprecated && ceiling !== null && readinessLevels.indexOf(requestedApproval) <= readinessLevels.indexOf(ceiling))
      ? requestedApproval
      : null;
  const blockers = [
    ...(control.mapping === null
      ? ['Requirement mapping is missing.']
      : !control.mappingCurrent
        ? ['Requirement mapping review is stale.']
        : []),
    ...dimensions.flatMap(({ dimension, blockers }) => blockers.map((blocker) => `${dimension}: ${blocker}`)),
    ...(!currency.current ? currency.reasons : []),
    ...(terminalDeprecated ? ['Deprecated is terminal; active maturity approvals cannot be revived by later evidence.'] : []),
    ...records.flatMap(({ reasons }) => reasons),
  ];
  const linkedNames = checks.flatMap(({ tests }) => tests);
  return {
    id: control.id,
    component: control.component,
    kind: control.kind,
    contractPath: control.contractPath,
    contractDigest: control.contractDigest,
    reviewDigest: control.reviewDigest,
    mappingDigest: control.mappingDigest,
    mappingState: control.mapping === null ? 'missing' : control.mappingCurrent ? 'current' : 'stale',
    policy: { version: policy.policyVersion, proposal: policy.proposal, provisional: true, ownerAdoption: policy.ownerAdoption },
    requirements,
    observations,
    unmappedObservations: observations.filter(
      (entry) =>
        !linkedNames.some(
          (link) =>
            link.name === entry.name &&
            link.kind === entry.kind &&
            (link.target === undefined || link.target === entry.target) &&
            (link.input === undefined || link.input === entry.input),
        ),
    ),
    targets,
    dimensions,
    declaredStatus,
    terminalDeprecated,
    evidenceSupportedStatus: ceiling,
    approvedStatus,
    approvalState: { optional: true, ownerAdoption: policy.ownerAdoption, trustedKeyCount: policy.trustedKeys.length },
    supplementalMappingReview,
    fidelityEvidence: {
      axisChecks: axisChecks.map(({ id }) => id),
      accessibilityChecks: accessibilityChecks.map(({ id }) => id),
      supplementalReviewedAssertions: reviewedFidelityAssertions,
    },
    change: previous
      ? {
          evidence: compareReadinessStatus(previous.evidenceSupportedStatus, ceiling),
          previousEvidenceSupportedStatus: previous.evidenceSupportedStatus,
          previousApprovedStatus: previous.approvedStatus,
          approvalWithdrawn: previous.approvedStatus !== null && previous.approvedStatus !== approvedStatus,
        }
      : null,
    reviewedRecords: records,
    upstreamCurrency: currency,
    blockers,
    missingEvidence: checks.filter(({ outcome }) => outcome !== 'passed').map(({ id, outcome }) => ({ check: id, outcome })),
    limitations: [
      ...policy.limitations,
      ...evidence.limitations,
      ...(control.mapping?.limitations ?? []),
      'Agent-reviewed mappings are not owner endorsements. Evidence-supported status is a ceiling, not an approval.',
      'Optional maturity approval is never a prerequisite for calculating or publishing the evidence-supported ceiling.',
      'All four targets remain visible; input-lane success never substitutes for manual keyboard or screen-reader conformance.',
    ],
  };
}

export type ReadinessControlReport = ReturnType<typeof assessReadinessControl>;

export function parsePreviousReadinessReport(value: unknown): PreviousReadinessStatus[] {
  const data = object(value, 'Previous consumer report');
  if (data.schemaVersion !== 1 || !Array.isArray(data.controls)) throw new Error('Unsupported previous consumer report.');
  const controls = data.controls.map((value): PreviousReadinessStatus => {
    const entry = object(value, 'Previous control status');
    return {
      controlId: text(entry.id, 'Previous control ID'),
      evidenceSupportedStatus:
        entry.evidenceSupportedStatus === null ? null : member(entry.evidenceSupportedStatus, readinessLevels, 'Previous ceiling'),
      approvedStatus: entry.approvedStatus === null ? null : member(entry.approvedStatus, maturityStatuses, 'Previous approval'),
      declaredStatus:
        entry.declaredStatus === undefined || entry.declaredStatus === null
          ? null
          : member(entry.declaredStatus, maturityStatuses, 'Previous declaration'),
    };
  });
  if (new Set(controls.map(({ controlId }) => controlId)).size !== controls.length) throw new Error('Duplicate previous control status.');
  return controls;
}
