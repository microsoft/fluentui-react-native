import { createHash } from 'node:crypto';
import { existsSync, globSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';

import { hex, object, readControlContract, text } from './controlAssessment.ts';
import { readPackageAssessments } from './assessmentConfig.ts';
import { readUnitMappingFrom } from './controlAssessmentUnit.ts';

export const readinessLevels = ['experimental', 'preview', 'beta', 'stable'] as const;
export type ReadinessLevel = (typeof readinessLevels)[number];
export const readinessTargets = ['win32-paper', 'windows-fabric', 'macos-fabric', 'macos-paper'] as const;
export type ReadinessTarget = (typeof readinessTargets)[number];
export const readinessKinds = ['unit', 'native', 'type', 'visual', 'manual'] as const;
export type ReadinessKind = (typeof readinessKinds)[number];
export type ReadinessLink = {
  kind: ReadinessKind;
  name: string;
  target?: ReadinessTarget;
  input?: 'accessible' | 'physical';
};
export type ReadinessCheck = {
  id: string;
  description: string;
  source: string;
  evidence: ReadinessKind;
  tests: ReadinessLink[];
};
export type ReadinessMapping = {
  schemaVersion: 1;
  reviewedDigest: string;
  reviewKind: 'agent-reviewed' | 'owner-reviewed';
  reviewInputs: string[];
  requirements: Record<string, { checks: ReadinessCheck[] }>;
  limitations: string[];
};
export type ReadinessControl = {
  id: string;
  component: string;
  kind: 'component' | 'primitive';
  packagePath: string;
  directory: string;
  contractPath: string;
  contractDigest: string;
  reviewDigest: string;
  mappingDigest: string | null;
  mappingCurrent: boolean;
  mapping: ReadinessMapping | null;
  requirements: { id: string; description: string }[];
  files: string[];
  unitFiles: string[];
  typeFiles: string[];
  storyFiles: string[];
  sources: { id: string; lock: string | null; fingerprint: string | null }[];
};

export function readinessHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function repositoryFile(root: string, file: string): string {
  if (
    file.includes('\\') ||
    path.posix.isAbsolute(file) ||
    path.win32.isAbsolute(file) ||
    file.split('/').some((part) => !part || part === '.' || part === '..')
  )
    throw new Error(`Expected a normalized repository-relative file: ${file}`);
  const absolute = realpathSync.native(path.join(root, file));
  const relative = path.relative(realpathSync.native(root), absolute);
  if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative))
    throw new Error(`Assessment input redirects outside the repository: ${file}`);
  return absolute;
}

function member<T extends string>(value: unknown, values: readonly T[], label: string): T {
  const result = values.find((entry) => entry === value);
  if (result === undefined) throw new Error(`Invalid ${label}.`);
  return result;
}

function list(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

export function readReadinessMapping(value: unknown): ReadinessMapping {
  const data = object(value, 'Readiness mapping');
  if (data.schemaVersion !== 1) throw new Error('Unsupported readiness mapping schema.');
  const reviewInputs = list(data.reviewInputs, 'Review inputs').map((file) => text(file, 'Review input'));
  if (new Set(reviewInputs).size !== reviewInputs.length) throw new Error('Duplicate review input.');
  const shared = new Map<string, string>();
  const requirements = Object.fromEntries(
    Object.entries(object(data.requirements, 'Readiness requirement mappings')).map(([id, value]) => {
      const checks = list(object(value, 'Requirement mapping').checks, 'Acceptance checks').map((value): ReadinessCheck => {
        const check = object(value, 'Readiness acceptance check');
        const evidence = member(check.evidence, readinessKinds, 'evidence kind');
        const tests = list(check.tests, 'Acceptance test links').map((value): ReadinessLink => {
          const link = object(value, 'Readiness test link');
          const kind = member(link.kind, readinessKinds, 'test kind');
          if (kind !== evidence) throw new Error('A test link must supply the required evidence kind.');
          return {
            kind,
            name: text(link.name, 'Exact test or observation identity'),
            ...(link.target === undefined ? {} : { target: member(link.target, readinessTargets, 'test target') }),
            ...(link.input === undefined
              ? {}
              : { input: member<'accessible' | 'physical'>(link.input, ['accessible', 'physical'], 'input lane') }),
          };
        });
        if (new Set(tests.map((test) => JSON.stringify(test))).size !== tests.length) throw new Error('Duplicate test link.');
        const result = {
          id: text(check.id, 'Acceptance check ID'),
          description: text(check.description, 'Acceptance check description'),
          source: text(check.source, 'Normative source reference'),
          evidence,
          tests,
        };
        const previous = shared.get(result.id);
        const serialized = JSON.stringify(result);
        if (previous !== undefined && previous !== serialized) throw new Error('Shared checks must have identical definitions.');
        shared.set(result.id, serialized);
        return result;
      });
      if (!checks.length || new Set(checks.map(({ id }) => id)).size !== checks.length)
        throw new Error('Each requirement needs a nonempty, unique acceptance checklist.');
      return [id, { checks }];
    }),
  );
  return {
    schemaVersion: 1,
    reviewedDigest: hex(data.reviewedDigest, 64, 'Reviewed input digest'),
    reviewKind: member(data.reviewKind, ['agent-reviewed', 'owner-reviewed'], 'review kind'),
    reviewInputs,
    requirements,
    limitations: list(data.limitations, 'Mapping limitations').map((entry) => text(entry, 'Mapping limitation')),
  };
}

function digestFiles(root: string, files: readonly string[]): string {
  const hash = createHash('sha256');
  for (const file of [...new Set(files)].sort()) {
    const content = readFileSync(repositoryFile(root, file), 'utf8').replace(/\r\n/g, '\n');
    hash.update(file).update('\0').update(content).update('\0');
  }
  return hash.digest('hex');
}

function requirementsFromMarkdown(markdown: string): { id: string; description: string }[] {
  const result: { id: string; description: string }[] = [];
  let current: { id: string; description: string } | undefined;
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(?:- )?\*\*([A-Z][A-Z0-9]*-\d{3}):\*\*(.*)$/.exec(line);
    if (match) {
      current = { id: match[1], description: match[2].trim() };
      result.push(current);
    } else if (current && line.trim() && !line.startsWith('#')) {
      current.description += ` ${line.trim()}`;
    } else {
      current = undefined;
    }
  }
  return result;
}

function localRequirements(markdown: string): { id: string; description: string }[] {
  return markdown
    .split(/\r?\n\r?\n/)
    .filter((block) => block.trim() && !block.startsWith('#'))
    .map((description, index) => ({ id: `LOCAL-${String(index + 1).padStart(3, '0')}`, description: description.trim() }));
}

export function discoverReadinessControls(root: string, packageRoot?: string): ReadinessControl[] {
  root = realpathSync.native(root);
  const packages = packageRoot
    ? [path.relative(root, realpathSync.native(packageRoot)).replaceAll('\\', '/')]
    : globSync('packages/**/package.json', {
        cwd: root,
        exclude: ['**/node_modules/**', '**/lib/**', '**/dist/**'],
      })
        .map((file) => file.replaceAll('\\', '/'))
        .filter((file) => {
          const manifest = object(JSON.parse(readFileSync(repositoryFile(root, file), 'utf8')), 'Package');
          return manifest.furn !== undefined && object(manifest.furn, 'Package profile').readiness !== undefined;
        })
        .map((file) => path.posix.dirname(file));
  return packages.flatMap((packagePath) => {
    const manifest = object(JSON.parse(readFileSync(repositoryFile(root, `${packagePath}/package.json`), 'utf8')), 'Package');
    const profile = manifest.furn === undefined ? {} : object(manifest.furn, 'Package profile');
    if (profile.readiness === undefined) return [];
    const configuration = object(profile.readiness, 'Readiness configuration');
    const legacyDefinitions = readPackageAssessments(root, path.join(root, packagePath));
    const patterns = list(configuration.contracts, 'Contract discovery patterns').map((value) => text(value, 'Contract pattern'));
    if (!patterns.length) throw new Error('Readiness discovery requires contract patterns.');
    for (const pattern of patterns) {
      if (pattern.includes('\\') || path.posix.isAbsolute(pattern) || path.win32.isAbsolute(pattern) || pattern.split('/').includes('..'))
        throw new Error('Readiness contract patterns must stay inside their package.');
      const filename = path.posix.basename(pattern);
      if (filename !== 'SPEC.md' && filename !== 'CONTRACT.md')
        throw new Error('Readiness discovery supports SPEC.md and CONTRACT.md contracts.');
      for (const directory of globSync(`${packagePath}/${path.posix.dirname(pattern)}`, { cwd: root })) {
        if (!statSync(path.join(root, directory)).isDirectory() || existsSync(path.join(root, directory, filename))) continue;
        const hasImplementation = globSync(`${directory}/*`, { cwd: root }).some(
          (file) => /\.(?:ts|tsx)$/.test(file) && !/\.(?:stories|test|wdio)\.[^.]+$/.test(file),
        );
        if (hasImplementation) throw new Error(`Missing readiness contract: ${path.join(directory, filename)}`);
      }
    }
    const contracts = [...new Set(patterns.flatMap((pattern) => globSync(`${packagePath}/${pattern}`, { cwd: root })))].sort();
    return contracts.map((contractPath): ReadinessControl => {
      contractPath = contractPath.replaceAll('\\', '/');
      const directory = path.posix.dirname(contractPath);
      const component = path.posix.basename(directory);
      const files = globSync(`${directory}/**/*`, { cwd: root })
        .map((file) => file.replaceAll('\\', '/'))
        .filter(
          (file) =>
            /\.(?:ts|tsx|md|json|yaml|yml|snap)$/.test(file) &&
            !file.includes('/assessment/') &&
            !file.endsWith('/assessment.mapping.json') &&
            !file.endsWith('/assessment.readiness.json'),
        )
        .sort();
      const mappingPath = `${directory}/assessment.readiness.json`;
      const legacy = legacyDefinitions.find((definition) => `${packagePath}/${definition.componentPath}` === directory);
      const rawMapping = existsSync(path.join(root, mappingPath))
        ? readFileSync(repositoryFile(root, mappingPath), 'utf8')
        : legacy
          ? readFileSync(repositoryFile(root, legacy.mappingPath), 'utf8')
          : null;
      const legacyContract = legacy && !existsSync(path.join(root, mappingPath)) ? readControlContract(root, legacy) : undefined;
      const legacyUnit =
        legacyContract && legacy ? readUnitMappingFrom((file) => readFileSync(repositoryFile(root, file), 'utf8'), legacy) : undefined;
      const mapping: ReadinessMapping | null =
        legacyContract && legacy
          ? {
              schemaVersion: 1,
              reviewedDigest: readinessHash(`${legacy.contract.reviewedDigest}\0${legacy.unit.reviewedDigest}`),
              reviewKind: 'agent-reviewed',
              reviewInputs: [
                ...new Set([...legacy.contract.assertionFiles.map((file) => `${packagePath}/${file}`), ...legacy.unit.inputs]),
              ],
              requirements: Object.fromEntries(
                Object.entries(legacy.contract.requirements).map(([id, value]) => [
                  id,
                  {
                    checks: value.checks.map(
                      (check): ReadinessCheck => ({
                        ...check,
                        tests: check.tests.map((test) =>
                          test.kind === 'unit'
                            ? { kind: 'unit', name: test.fullName }
                            : {
                                kind: 'native',
                                name: `${test.storyId}::${test.testName}`,
                                target: 'win32-paper',
                                input: legacy.contract.nativeCheck.requiresPhysicalClick ? 'physical' : 'accessible',
                              },
                        ),
                      }),
                    ),
                  },
                ]),
              ),
              limitations: [
                ...legacy.limitations,
                ...Object.values(legacy.contract.requirements).map(({ remaining }) => remaining),
                'Legacy schema-v2 links retain their reviewed scope; additional platform callbacks receive no implicit credit.',
              ],
            }
          : rawMapping === null
            ? null
            : readReadinessMapping(JSON.parse(rawMapping));
      const normative = files.filter((file) => file === contractPath || file.includes(`${directory}/spec/`));
      const contractDigest = digestFiles(root, normative);
      const reviewDigest =
        legacyContract && legacyUnit
          ? readinessHash(`${legacyContract.digest}\0${legacyUnit.digest}`)
          : digestFiles(root, [...files, ...(mapping?.reviewInputs ?? [])]);
      const markdown = readFileSync(repositoryFile(root, contractPath), 'utf8');
      const primitive = contractPath.endsWith('/CONTRACT.md');
      const requirements = primitive ? localRequirements(markdown) : requirementsFromMarkdown(markdown);
      if (!requirements.length || new Set(requirements.map(({ id }) => id)).size !== requirements.length)
        throw new Error(`Contract needs a unique requirement inventory: ${contractPath}`);
      const sourceFile = `${directory}/spec/source.json`;
      const source = existsSync(path.join(root, sourceFile))
        ? object(JSON.parse(readFileSync(repositoryFile(root, sourceFile), 'utf8')), 'Contract provenance')
        : undefined;
      if (source && Array.isArray(source.requirements)) {
        const ids = source.requirements.map((entry) => text(object(entry, 'Source requirement').id, 'Requirement ID'));
        if (ids.length !== requirements.length || ids.some((id) => !requirements.some((entry) => entry.id === id)))
          throw new Error(`SPEC requirement inventory differs from its source metadata: ${contractPath}`);
      }
      if (mapping) {
        const ids = Object.keys(mapping.requirements);
        if (ids.length !== requirements.length || requirements.some(({ id }) => !ids.includes(id)))
          throw new Error(`Readiness mapping must retain every contract requirement: ${contractPath}`);
        for (const { checks } of Object.values(mapping.requirements))
          for (const check of checks) {
            const file = check.source.split('#')[0];
            if (!normative.includes(`${directory}/${file}`))
              throw new Error(`Acceptance check must cite a normative contract file: ${check.source}`);
          }
      }
      const sources = source?.sources === undefined ? [] : list(source.sources, 'Contract sources');
      return {
        id: `${packagePath}/${path.posix.relative(packagePath, directory)}`,
        component,
        kind: primitive ? 'primitive' : 'component',
        packagePath,
        directory,
        contractPath,
        contractDigest,
        reviewDigest,
        mappingDigest: rawMapping === null ? null : readinessHash(rawMapping.replace(/\r\n/g, '\n')),
        mappingCurrent: mapping !== null && mapping.reviewedDigest === reviewDigest,
        mapping,
        requirements,
        files,
        unitFiles: files.filter((file) => /\.test\.tsx?$/.test(file) && !/\.types?\.test\./.test(file)),
        typeFiles: files.filter((file) => /\.types?\.test\.tsx?$/.test(file)),
        storyFiles: files.filter((file) => /\.stories\.tsx?$/.test(file)),
        sources: sources
          .map((value) => object(value, 'Contract source'))
          .filter((value) => value.authority === 'normative' && value.kind !== 'local-foundation')
          .map((value) => ({
            id: text(value.id, 'Normative source ID'),
            lock: value.sourceLock === undefined ? null : text(value.sourceLock, 'Source lock'),
            fingerprint: value.sourceLockFingerprint === undefined ? null : hex(value.sourceLockFingerprint, 64, 'Source fingerprint'),
          })),
      };
    });
  });
}
