import { globSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

import { hex, object, text } from './controlAssessment.ts';

export type AssessmentDefinition = {
  schemaVersion: 1;
  component: string;
  displayName: string;
  componentPath: string;
  packagePath: string;
  packageName: string;
  mappingPath: string;
  specPath: string;
  summaryPath: string;
  contract: {
    files: string[];
    assertionFiles: string[];
    reviewedDigest: string;
    mappingVersion: string;
    nativeCheck: { storyId: string; testName: string; requiresPhysicalClick: boolean };
    requirements: Record<string, { observed?: string; remaining: string }>;
  };
  unit: {
    testFiles: string[];
    inputs: string[];
    platform: string;
    reviewedDigest: string;
    mappingVersion: string;
    environment: string;
    cases: { fullName: string; requirements: string[]; scope: string }[];
  };
  limitations: string[];
};

function relativeFile(value: unknown, label: string): string {
  const file = text(value, label);
  if (
    file.includes('\\') ||
    path.posix.isAbsolute(file) ||
    !file.split('/').every((part) => /^[A-Za-z0-9_.-]+$/.test(part) && part !== '.' && part !== '..')
  ) {
    throw new Error(`${label} must be a normalized relative repository path.`);
  }
  return file;
}

function strings(value: unknown, label: string, files = false): string[] {
  if (!Array.isArray(value) || !value.length) throw new Error(`${label} must be a nonempty array.`);
  const result = value.map((entry) => (files ? relativeFile(entry, label) : text(entry, label)));
  if (new Set(result).size !== result.length) throw new Error(`${label} contains duplicates.`);
  return result;
}

export function readPackageAssessments(root: string, packageRoot: string): AssessmentDefinition[] {
  const directory = realpathSync.native(path.resolve(packageRoot));
  const packagePath = path.relative(realpathSync.native(root), directory).replace(/\\/g, '/');
  if (packagePath === '..' || packagePath.startsWith('../') || path.isAbsolute(packagePath))
    throw new Error(`Assessment package must be inside the repository: ${directory} is outside ${root}.`);
  const manifest = object(JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8')), 'Assessment package');
  if (manifest.furn === undefined) return [];
  const profile = object(manifest.furn, 'Package profile');
  if (profile.assessments === undefined) return [];
  const mappings = strings(profile.assessments, 'Package assessment mappings', true);
  const definitions = mappings.map((file) => {
    const absolute = realpathSync.native(path.join(directory, file));
    const relative = path.relative(directory, absolute);
    if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
      throw new Error('Assessment mapping redirects outside its package.');
    return parseAssessmentDefinition(JSON.parse(readFileSync(absolute, 'utf8')), packagePath, text(manifest.name, 'Package name'), file);
  });
  if (new Set(definitions.map(({ component }) => component)).size !== definitions.length)
    throw new Error('Duplicate component assessment configuration.');
  for (const definition of definitions) {
    if (profile.jestPlatform !== definition.unit.platform) throw new Error('Assessment platform must match the package Jest profile.');
    if (typeof object(manifest.scripts, 'Package scripts').test !== 'string')
      throw new Error('Assessment package must declare its test command.');
  }
  return definitions;
}

export function discoverAssessments(root: string, packageRoot?: string): AssessmentDefinition[] {
  if (packageRoot) return readPackageAssessments(root, packageRoot);
  const manifests = globSync('packages/**/package.json', {
    cwd: root,
    exclude: ['**/node_modules/**', '**/lib/**', '**/lib-commonjs/**', '**/dist/**'],
  }).sort();
  return manifests.flatMap((file) => readPackageAssessments(root, path.dirname(path.join(root, file))));
}

export function selectAssessment(root: string, component?: string, packageRoot?: string): AssessmentDefinition {
  const definitions = discoverAssessments(root, packageRoot).filter((entry) => component === undefined || entry.component === component);
  if (definitions.length !== 1)
    throw new Error(
      `Expected one configured assessment${component ? ` for ${component}` : ''}; found ${definitions.length}. Select its component and package explicitly.`,
    );
  return definitions[0];
}

export function parseAssessmentDefinition(
  value: unknown,
  packagePath: string,
  packageName: string,
  mappingFile: string,
): AssessmentDefinition {
  const data = object(value, 'Assessment mapping');
  if (data.schemaVersion !== 1) throw new Error('Unsupported assessment mapping schema.');
  const component = text(data.component, 'Assessment component');
  if (!/^[a-z][a-z0-9-]*$/.test(component)) throw new Error('Invalid assessment component ID.');
  const componentPath = relativeFile(data.componentPath, 'Component path');
  if (mappingFile !== `${componentPath}/assessment.mapping.json`) throw new Error('Each control mapping must live beside its SPEC.md.');
  const contract = object(data.contract, 'Contract mapping');
  const nativeCheck = object(contract.nativeCheck, 'Native assertion mapping');
  if (typeof nativeCheck.requiresPhysicalClick !== 'boolean') throw new Error('Native input requirement must be explicit.');
  const requirements = Object.fromEntries(
    Object.entries(object(contract.requirements, 'Requirement mappings')).map(([id, value]) => {
      if (!/^[A-Z][A-Z0-9]*-\d{3}$/.test(id)) throw new Error('Invalid mapped requirement ID.');
      const entry = object(value, 'Requirement coverage');
      return [
        id,
        {
          ...(entry.observed === undefined ? {} : { observed: text(entry.observed, 'Native scope') }),
          remaining: text(entry.remaining, 'Remaining coverage'),
        },
      ];
    }),
  );
  const unit = object(data.unit, 'Unit mapping');
  if (!Array.isArray(unit.cases) || !unit.cases.length) throw new Error('Unit mapping must declare reviewed cases.');
  const cases = unit.cases.map((value) => {
    const entry = object(value, 'Unit case mapping');
    if (!Array.isArray(entry.requirements) || entry.requirements.some((id) => typeof id !== 'string' || !Object.hasOwn(requirements, id)))
      throw new Error('Unit case references an unknown requirement.');
    return {
      fullName: text(entry.fullName, 'Unit assertion name'),
      requirements: entry.requirements.map((id) => text(id, 'Unit requirement')),
      scope: text(entry.scope, 'Unit assertion scope'),
    };
  });
  if (new Set(cases.map(({ fullName }) => fullName)).size !== cases.length) throw new Error('Duplicate mapped unit assertion.');
  const files = strings(contract.files, 'Contract files', true);
  if (!files.includes('SPEC.md') || !files.includes('spec/source.json'))
    throw new Error('Assessment requires its SPEC and requirement metadata.');
  const testFiles = strings(unit.testFiles, 'Unit runtime files', true);
  const inputs = strings(unit.inputs, 'Unit mapping inputs', true);
  if (testFiles.some((file) => /\.types?\.test\./.test(file) || !inputs.includes(`${packagePath}/${file}`)))
    throw new Error('Each configured runtime suite must be fingerprinted and cannot be a type-only test.');
  const platform = text(unit.platform, 'Unit mock platform');
  if (!['react', 'win32', 'macos', 'ios', 'android', 'windows'].includes(platform))
    throw new Error('Unsupported assessment Jest platform.');
  return {
    schemaVersion: 1,
    component,
    displayName: text(data.displayName, 'Component display name'),
    componentPath,
    packagePath,
    packageName,
    mappingPath: `${packagePath}/${mappingFile}`,
    specPath: `${packagePath}/${componentPath}/SPEC.md`,
    summaryPath: `${packagePath}/${componentPath}/assessment/ASSESSMENT.md`,
    contract: {
      files,
      assertionFiles: strings(contract.assertionFiles, 'Native assertion files', true),
      reviewedDigest: hex(contract.reviewedDigest, 64, 'Reviewed contract digest'),
      mappingVersion: text(contract.mappingVersion, 'Native mapping version'),
      nativeCheck: {
        storyId: text(nativeCheck.storyId, 'Mapped story'),
        testName: text(nativeCheck.testName, 'Mapped callback'),
        requiresPhysicalClick: nativeCheck.requiresPhysicalClick,
      },
      requirements,
    },
    unit: {
      testFiles,
      inputs,
      platform,
      reviewedDigest: hex(unit.reviewedDigest, 64, 'Reviewed unit digest'),
      mappingVersion: text(unit.mappingVersion, 'Unit mapping version'),
      environment: text(unit.environment, 'Unit environment'),
      cases,
    },
    limitations: strings(data.limitations, 'Component assessment limitations'),
  };
}

export function mappingContent(definition: AssessmentDefinition): string {
  const { reviewedDigest: _contractDigest, ...contract } = definition.contract;
  const { reviewedDigest: _unitDigest, ...unit } = definition.unit;
  return JSON.stringify({ ...definition, contract, unit });
}

export function readMappingContent(read: (file: string) => string, definition: AssessmentDefinition): string {
  const mappingFile = definition.mappingPath.slice(definition.packagePath.length + 1);
  return mappingContent(
    parseAssessmentDefinition(JSON.parse(read(definition.mappingPath)), definition.packagePath, definition.packageName, mappingFile),
  );
}

export function assessmentDirectory(root: string, definition: AssessmentDefinition): string {
  return path.join(root, 'apps', 'storybook', 'artifacts', 'win32', 'assessment-ci', definition.packagePath, definition.component);
}

export function unitCaptureDirectory(root: string, definition: AssessmentDefinition): string {
  return path.join(root, definition.packagePath, definition.component);
}

export function unconfiguredControls(packageRoot: string, definitions: AssessmentDefinition[]): string[] {
  return globSync('src/components/*/SPEC.md', { cwd: packageRoot })
    .map((file) => path.dirname(file).replace(/\\/g, '/'))
    .filter((directory) => !definitions.some(({ componentPath }) => componentPath === directory))
    .map((directory) => path.posix.basename(directory))
    .sort();
}
