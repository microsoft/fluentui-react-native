import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';
import { loadDesktopConfig, validateDesktopConfig } from '@fluentui-react-native/desktop-test/config';
import { getStorybookIntegration } from '../config/integration.js';

const defaultConfigNames = [
  'desktop.config.mts',
  'desktop.config.ts',
  'desktop.config.mjs',
  'desktop.config.js',
  'desktop.config.cjs',
  'storybook.config.ts',
  'storybook.config.mts',
  'storybook.config.js',
  'storybook.config.mjs',
  'storybook.config.cjs',
] as const;

export async function loadDesktopStorybookConfig(configPath?: string, cwd = process.cwd()): Promise<DesktopStorybookConfig> {
  const resolvedPath = configPath ? resolveConfigPath(configPath, cwd) : findConfigPath(cwd);
  const loadedModule = (await import(pathToFileURL(resolvedPath).href)) as Record<string, unknown>;
  const config = loadedModule.default ?? loadedModule.config;
  if (config && typeof config === 'object' && 'schemaVersion' in config) {
    validateDesktopConfig(config);
    const resolved = await loadDesktopConfig(resolvedPath);
    return getStorybookIntegration(config).configure(resolved.projectRoot, resolved);
  }
  if (!isLegacyConfig(config)) {
    throw new TypeError(
      `Desktop Storybook config at ${resolvedPath} must export a desktop config with the Storybook integration or makeDesktopStorybookConfig().`,
    );
  }
  return config;
}

function isLegacyConfig(config: unknown): config is DesktopStorybookConfig {
  return (
    !!config &&
    typeof config === 'object' &&
    'projectRoot' in config &&
    typeof config.projectRoot === 'string' &&
    [
      'getStorybookConfig',
      'getPlatformOptions',
      'getStoryPackages',
      'getCommandPlan',
      'getSmokeOptions',
      'getNativeDriverOptions',
      'resolvePackage',
    ].every((key) => key in config && typeof Reflect.get(config, key) === 'function')
  );
}

function resolveConfigPath(configPath: string, cwd: string): string {
  const resolvedPath = path.isAbsolute(configPath) ? configPath : path.resolve(cwd, configPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Desktop Storybook config does not exist at ${resolvedPath}.`);
  }
  return resolvedPath;
}

function findConfigPath(cwd: string): string {
  for (const configName of defaultConfigNames) {
    const configPath = path.resolve(cwd, configName);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  throw new Error(`Could not find ${defaultConfigNames.join(', or ')} beneath ${cwd}.`);
}
