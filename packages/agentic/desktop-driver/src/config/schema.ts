import type { DesktopBackendId, DesktopPlatform, DesktopReadinessOptions } from '../types.ts';

export const DESKTOP_CONFIG_SCHEMA_VERSION = 1;

export interface DesktopStorySource {
  directory: string;
  files: string;
}

export interface DesktopEnvironmentConfig {
  platform?: string;
  launchApp?: string;
  identity?: string;
  processId?: string;
  windowHandle?: string;
  windowTitle?: string;
  logLevel?: string;
  storyFilter?: string;
}

export interface DesktopPlatformConfig {
  backend: DesktopBackendId;
  target: {
    defaultMode: 'attach';
    attach: {
      identity?: string;
      identityFromApplicationManifest?: string;
      title?: string;
      titleFromApplicationManifest?: string;
    };
  };
  readiness?: Omit<DesktopReadinessOptions, 'requireTestId'> & { requireTestId?: string | null };
}

export interface DesktopProjectConfigV1 {
  schemaVersion: typeof DESKTOP_CONFIG_SCHEMA_VERSION;
  rootDir?: string;
  application: {
    manifest: string;
    readyTestId?: string;
  };
  storybook: {
    configDir: string;
    stories: readonly DesktopStorySource[];
    channel?: {
      host?: string;
      port?: number;
      mcp?: boolean;
    };
  };
  tests: {
    storyParameter?: string;
    generatedDirectory: string;
    fakeScene?: string;
    artifactsDirectory: string;
    framework?: 'mocha' | 'jasmine' | 'cucumber';
    sessionStrategy?: 'suite' | 'spec';
    timeoutMs?: number;
    runner: {
      command: string;
      args?: readonly string[];
      cwd?: string;
      timeoutMs?: number;
    };
  };
  base?: {
    driverHost?: {
      host?: string;
      port?: number;
      startupTimeoutMs?: number;
      logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
    };
    readiness?: DesktopReadinessOptions;
  };
  environment?: DesktopEnvironmentConfig;
  platforms: Readonly<Record<DesktopPlatform, DesktopPlatformConfig>>;
}

export type DesktopProjectConfig = DesktopProjectConfigV1;
