import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { validateDesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopStoryManifest, DesktopStoryManifestEntry, DesktopStoryTests } from '@fluentui-react-native/desktop-driver';

import type { DesktopStorybookConfig, ResolvedStoryPackage } from '../config/makeDesktopStorybookConfig.js';
import type { Platforms } from '../config/platforms.js';

type StaticStory = {
  id: string;
  name?: string;
  parameters?: Record<string, unknown>;
  tags?: string[];
};

type CsfFile = {
  meta?: { tags?: string[]; title?: string };
  stories: StaticStory[];
};

type StorybookCsfTools = {
  loadCsf(code: string, options: { fileName: string; makeTitle(title: string): string }): { parse(): CsfFile };
};

type StoryManifestConfig = Pick<DesktopStorybookConfig, 'projectRoot'> & {
  getStoryPackages(platform: Platforms): readonly ResolvedStoryPackage[];
};

export async function createDesktopStoryManifest(
  config: StoryManifestConfig,
  platform: Platforms,
  tools?: StorybookCsfTools,
): Promise<DesktopStoryManifest> {
  const requireFromProject = createRequire(path.join(config.projectRoot, 'package.json'));
  const { loadCsf } = tools ?? (await loadStorybookCsfTools(requireFromProject));
  const packages = config.getStoryPackages(platform);
  const entries: DesktopStoryManifestEntry[] = [];

  for (const storyPackage of packages) {
    const sourceFiles = [
      ...new Set(
        storyPackage.storyPatterns.flatMap((pattern) =>
          fs.globSync(pattern, { cwd: storyPackage.root }).map((sourceFile) => path.resolve(storyPackage.root, sourceFile)),
        ),
      ),
    ].sort();
    for (const sourceFile of sourceFiles) {
      const code = fs.readFileSync(sourceFile, 'utf8');
      let csf: CsfFile;
      try {
        csf = loadCsf(code, { fileName: sourceFile, makeTitle: (title) => title }).parse();
      } catch (error) {
        throw new Error(`Failed to statically parse Storybook file ${sourceFile}: ${(error as Error).message}`, { cause: error });
      }
      for (const staticStory of csf.stories) {
        const tests = readDesktopStoryTests(staticStory.parameters?.desktopDriver, sourceFile, staticStory.id);
        entries.push({
          id: staticStory.id,
          name: staticStory.name ?? staticStory.id,
          packageName: storyPackage.name,
          sourcePath: toPosixPath(path.relative(storyPackage.root, sourceFile)),
          tags: [...new Set([...(csf.meta?.tags ?? []), ...(staticStory.tags ?? []), 'story'])].sort(),
          title: csf.meta?.title ?? staticStory.id.split('--')[0],
          ...(tests ? { tests } : {}),
        });
      }
    }
  }

  entries.sort((left, right) => left.id.localeCompare(right.id));
  const endpoint = platform;
  const platformManifestDigest = digest({ endpoint, entries });
  const portablePlanDigest = digest(
    entries.filter(({ tests }) => tests && tests.portable !== false).map(({ id, tests }) => ({ id, tests })),
  );

  return Object.freeze({
    endpoint,
    entries: Object.freeze(entries),
    platformManifestDigest,
    portablePlanDigest,
    schemaVersion: 1,
  });
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

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}
