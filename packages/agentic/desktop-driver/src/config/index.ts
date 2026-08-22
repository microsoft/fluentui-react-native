import type { DesktopProjectConfig, DesktopProjectConfigV1, DesktopStorySource } from './schema.ts';

export { DESKTOP_CONFIG_SCHEMA_VERSION } from './schema.ts';
export type {
  DesktopEnvironmentConfig,
  DesktopPlatformConfig,
  DesktopProjectConfig,
  DesktopProjectConfigV1,
  DesktopStorySource,
} from './schema.ts';

/** Provides type checking without adding runtime behavior to a project config. */
export function defineDesktopConfig(config: DesktopProjectConfigV1): DesktopProjectConfigV1 {
  return config;
}

function segments(value: string): string[] {
  const output: string[] = [];
  for (const segment of value.replaceAll('\\', '/').split('/')) {
    if (!segment || segment === '.') {
      continue;
    }
    if (segment === '..' && output.length > 0 && output.at(-1) !== '..') {
      output.pop();
    } else {
      output.push(segment);
    }
  }
  return output;
}

function relative(from: string, to: string): string {
  const fromSegments = segments(from);
  const toSegments = segments(to);
  while (fromSegments.length > 0 && toSegments.length > 0 && fromSegments[0] === toSegments[0]) {
    fromSegments.shift();
    toSegments.shift();
  }
  return [...fromSegments.map(() => '..'), ...toSegments].join('/') || '.';
}

/** Projects shared story sources into globs relative to the Storybook config directory. */
export function toStorybookStories(config: DesktopProjectConfig): string[] {
  const rootDir = config.rootDir ?? '.';
  const configDir = `${rootDir}/${config.storybook.configDir}`;
  return config.storybook.stories.map((entry: DesktopStorySource) => {
    const directory = relative(configDir, `${rootDir}/${entry.directory}`);
    return `${directory}/${entry.files}`;
  });
}
