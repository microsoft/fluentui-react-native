import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  desktopStoryPlatforms,
  resolveDesktopStoryTests,
  validateDesktopStoryTests,
} from '@fluentui-react-native/desktop-driver/authoring';
import type {
  DesktopStoryManifest,
  DesktopStoryManifestEntry,
  DesktopStoryPlatform,
  DesktopStoryTests,
} from '@fluentui-react-native/desktop-driver';

import type { DesktopStorybookConfig, ResolvedStoryPackage } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';

type StaticStory = {
  id: string;
  name?: string;
  parameters?: Record<string, unknown>;
  tags?: string[];
};

type BabelNode = {
  argument?: BabelNode;
  computed?: boolean;
  elements?: (BabelNode | null)[];
  expression?: BabelNode;
  expressions?: BabelNode[];
  extra?: { rawValue?: unknown };
  key?: BabelNode;
  loc?: { start?: { line?: number } };
  name?: string;
  operator?: string;
  properties?: BabelNode[];
  quasis?: { value?: { cooked?: string } }[];
  type: string;
  value?: unknown;
};

type CsfFile = {
  _stories?: Record<string, StaticStory>;
  _storyAnnotations?: Record<string, Record<string, BabelNode>>;
  meta?: { tags?: string[]; title?: string };
  stories: StaticStory[];
};

type StorybookCsfTools = {
  loadCsf(code: string, options: { fileName: string; makeTitle(title: string): string }): { parse(): CsfFile };
};

type StoryManifestConfig = Pick<DesktopStorybookConfig, 'projectRoot'> & {
  getStoryPackages(platform: Platforms): readonly ResolvedStoryPackage[];
};

type StorySource = {
  loadablePlatforms: Set<DesktopStoryPlatform>;
  packageName: string;
  packageRoot: string;
  sourceFile: string;
};

type InventoryStory = Omit<DesktopStoryManifestEntry, 'tests'> & {
  loadablePlatforms: readonly DesktopStoryPlatform[];
  tests?: DesktopStoryTests;
};

export async function createDesktopStoryManifest(
  config: StoryManifestConfig,
  platform: Platforms,
  tools?: StorybookCsfTools,
): Promise<DesktopStoryManifest> {
  const requireFromProject = createRequire(path.join(config.projectRoot, 'package.json'));
  const { loadCsf } = tools ?? (await loadStorybookCsfTools(requireFromProject));
  const inventory: InventoryStory[] = [];
  const storyIds = new Map<string, string>();

  for (const source of collectStorySources(config)) {
    const code = fs.readFileSync(source.sourceFile, 'utf8');
    let csf: CsfFile;
    try {
      csf = loadCsf(code, { fileName: source.sourceFile, makeTitle: (title) => title }).parse();
    } catch (error) {
      throw new Error(`Failed to statically parse Storybook file ${source.sourceFile}: ${(error as Error).message}`, { cause: error });
    }
    const stories = csf._stories ? Object.entries(csf._stories) : csf.stories.map((story) => [story.name ?? story.id, story] as const);
    for (const [exportName, staticStory] of stories) {
      const previousSource = storyIds.get(staticStory.id);
      if (previousSource) {
        throw new Error(`Story id "${staticStory.id}" is declared by both ${previousSource} and ${source.sourceFile}.`);
      }
      storyIds.set(staticStory.id, source.sourceFile);
      const tests = readDesktopStoryTests(
        extractDesktopStoryTests(csf._storyAnnotations?.[exportName]?.parameters, source.sourceFile, staticStory.id) ??
          staticStory.parameters?.desktopDriver,
        source.sourceFile,
        staticStory.id,
      );
      const supportedPlatforms = sortPlatforms(tests?.supportedPlatforms ?? desktopStoryPlatforms);
      inventory.push({
        id: staticStory.id,
        loadablePlatforms: sortPlatforms(source.loadablePlatforms),
        name: staticStory.name ?? staticStory.id,
        packageName: source.packageName,
        sourcePath: toPosixPath(path.relative(source.packageRoot, source.sourceFile)),
        supportedPlatforms,
        tags: [...new Set([...(csf.meta?.tags ?? []), ...(staticStory.tags ?? []), 'story'])].sort(),
        title: csf.meta?.title ?? staticStory.id.split('--')[0],
        ...(tests ? { tests } : {}),
      });
    }
  }

  inventory.sort((left, right) => left.id.localeCompare(right.id));
  const entries: DesktopStoryManifestEntry[] = [];
  const excluded: DesktopStoryManifest['excluded'][number][] = [];
  for (const story of inventory) {
    const { loadablePlatforms, tests, ...entry } = story;
    if (!loadablePlatforms.includes(platform)) {
      excluded.push({
        id: story.id,
        packageName: story.packageName,
        reason: 'package-pattern',
        sourcePath: story.sourcePath,
        supportedPlatforms: story.supportedPlatforms,
      });
      continue;
    }
    if (!story.supportedPlatforms.includes(platform)) {
      excluded.push({
        id: story.id,
        packageName: story.packageName,
        reason: 'unsupported-platform',
        sourcePath: story.sourcePath,
        supportedPlatforms: story.supportedPlatforms,
      });
      continue;
    }
    const resolvedTests = tests ? resolveDesktopStoryTests(tests, platform) : undefined;
    entries.push({
      ...entry,
      ...(tests?.traversePlatforms && !tests.traversePlatforms.includes(platform) ? { traverse: false as const } : {}),
      ...(resolvedTests ? { tests: resolvedTests } : {}),
    });
  }

  entries.sort((left, right) => left.id.localeCompare(right.id));
  const endpoint = platform;
  const catalogSetDigest = digest(
    inventory.map(({ id, loadablePlatforms, packageName, sourcePath, supportedPlatforms }) => ({
      id,
      loadablePlatforms,
      packageName,
      sourcePath,
      supportedPlatforms,
    })),
  );
  const portablePlanDigest = digest(
    inventory.filter(({ tests }) => tests && tests.portable !== false).map(({ id, tests }) => ({ id, tests })),
  );
  const platformManifestDigest = digest({ catalogSetDigest, endpoint, entries, excluded });

  return Object.freeze({
    catalogSetDigest,
    endpoint,
    entries: Object.freeze(entries),
    excluded: Object.freeze(excluded),
    platformManifestDigest,
    portablePlanDigest,
    schemaVersion: 2,
  });
}

function collectStorySources(config: StoryManifestConfig): StorySource[] {
  const sources = new Map<string, StorySource>();
  for (const platform of desktopStoryPlatforms) {
    for (const storyPackage of config.getStoryPackages(platform)) {
      const sourceFiles = new Set(
        storyPackage.storyPatterns.flatMap((pattern) =>
          fs.globSync(pattern, { cwd: storyPackage.root }).map((sourceFile) => path.resolve(storyPackage.root, sourceFile)),
        ),
      );
      for (const sourceFile of sourceFiles) {
        const key = `${storyPackage.name}\0${sourceFile}`;
        const source = sources.get(key) ?? {
          loadablePlatforms: new Set<DesktopStoryPlatform>(),
          packageName: storyPackage.name,
          packageRoot: storyPackage.root,
          sourceFile,
        };
        source.loadablePlatforms.add(platform);
        sources.set(key, source);
      }
    }
  }
  return [...sources.values()].sort((left, right) => left.sourceFile.localeCompare(right.sourceFile));
}

function extractDesktopStoryTests(parameters: BabelNode | undefined, sourceFile: string, storyId: string): unknown {
  if (!parameters) {
    return undefined;
  }
  const object = unwrapExpression(parameters);
  if (object.type !== 'ObjectExpression') {
    const line = object.loc?.start?.line;
    throw new Error(`Story parameters for "${storyId}" in ${sourceFile}${line ? `:${line}` : ''} must be a static object literal.`);
  }
  const spreadProperty = object.properties?.find((candidate) => candidate.type === 'SpreadElement');
  if (spreadProperty) {
    const line = spreadProperty.loc?.start?.line;
    throw new Error(
      `Story parameters for "${storyId}" in ${sourceFile}${line ? `:${line}` : ''} use a spread and cannot be statically inspected.`,
    );
  }
  const computedProperty = object.properties?.find((candidate) => candidate.computed);
  if (computedProperty) {
    const line = computedProperty.loc?.start?.line;
    throw new Error(
      `Story parameters for "${storyId}" in ${sourceFile}${line ? `:${line}` : ''} use a computed property and cannot be statically inspected.`,
    );
  }
  const property = object.properties?.find(
    (candidate) => candidate.type === 'ObjectProperty' && propertyName(candidate.key) === 'desktopDriver',
  );
  if (!property) {
    return undefined;
  }
  if (!property.value || typeof property.value !== 'object') {
    throw new Error(`Desktop-driver plan for "${storyId}" in ${sourceFile} does not have a static value.`);
  }
  try {
    return evaluateStaticValue(property.value as BabelNode);
  } catch (error) {
    const line = property.loc?.start?.line;
    throw new Error(
      `Desktop-driver plan for "${storyId}" in ${sourceFile}${line ? `:${line}` : ''} must be a static JSON literal: ${
        (error as Error).message
      }`,
      { cause: error },
    );
  }
}

function evaluateStaticValue(node: BabelNode): unknown {
  const value = unwrapExpression(node);
  switch (value.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return value.value;
    case 'NullLiteral':
      return null;
    case 'TemplateLiteral':
      if ((value.expressions?.length ?? 0) === 0 && value.quasis?.length === 1) {
        return value.quasis[0].value?.cooked ?? '';
      }
      break;
    case 'UnaryExpression':
      if (value.operator === '-' && value.argument?.type === 'NumericLiteral') {
        return -(value.argument.value as number);
      }
      break;
    case 'ArrayExpression':
      return (value.elements ?? []).map((element) => (element ? evaluateStaticValue(element) : null));
    case 'ObjectExpression':
      return Object.fromEntries(
        (value.properties ?? []).map((property) => {
          if (property.type !== 'ObjectProperty') {
            throw new Error(`Unsupported object member "${property.type}".`);
          }
          if (property.computed) {
            throw new Error('Computed object properties are not supported.');
          }
          const name = propertyName(property.key);
          if (!name || !property.value || typeof property.value !== 'object') {
            throw new Error('Object properties require static names and values.');
          }
          return [name, evaluateStaticValue(property.value as BabelNode)];
        }),
      );
  }
  throw new Error(`Unsupported expression "${value.type}".`);
}

function unwrapExpression(node: BabelNode): BabelNode {
  let current = node;
  while (
    current.expression &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression' ||
      current.type === 'ParenthesizedExpression')
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node: BabelNode | undefined): string | undefined {
  if (!node) {
    return undefined;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'StringLiteral') {
    return typeof node.value === 'string' ? node.value : undefined;
  }
  return undefined;
}

async function loadStorybookCsfTools(requireFromProject: NodeJS.Require): Promise<StorybookCsfTools> {
  const modulePath = requireFromProject.resolve('storybook/internal/csf-tools');
  return import(pathToFileURL(modulePath).href) as Promise<StorybookCsfTools>;
}

export function writeDesktopStoryManifest(manifest: DesktopStoryManifest, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== content) {
    fs.writeFileSync(outputPath, content);
  }
}

function readDesktopStoryTests(value: unknown, sourceFile: string, storyId: string): DesktopStoryTests | undefined {
  if (value === undefined) {
    return undefined;
  }
  try {
    return validateDesktopStoryTests(value, `${sourceFile}#${storyId}.parameters.desktopDriver`);
  } catch (error) {
    throw new Error(`Invalid desktop-driver plan in ${sourceFile} for story "${storyId}": ${(error as Error).message}`, {
      cause: error,
    });
  }
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function sortPlatforms(platforms: Iterable<DesktopStoryPlatform>): DesktopStoryPlatform[] {
  const values = new Set(platforms);
  return desktopStoryPlatforms.filter((platform) => values.has(platform));
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}
