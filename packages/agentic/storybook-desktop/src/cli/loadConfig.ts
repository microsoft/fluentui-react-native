import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { DesktopStorybookConfig } from '../config/makeDesktopStorybookConfig.js';

const defaultConfigNames = [
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
  if (!(config instanceof DesktopStorybookConfig)) {
    throw new TypeError(`Desktop Storybook config at ${resolvedPath} must default-export the result of makeDesktopStorybookConfig().`);
  }
  return config;
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
