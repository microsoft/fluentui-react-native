import mri from 'mri';
import os from 'node:os';
import path from 'node:path';
import { platformData } from '../wdio.conf.js';
import type { ExecSyncOptionsWithStringEncoding } from 'node:child_process';
import { execSync } from 'node:child_process';

type TestConfig = {
  platform: string;
  target: string;
  driver: string;
  e2eDir: string;
  bundleId?: string;
};

function loadConfig(): TestConfig {
  /**
   * Command line configuration for E2E test runs
   * run-e2e.js --platform <platform> --target <path to app package> --bundleId <bundle id>
   */
  const args = mri(process.argv.slice(2), {
    string: ['platform', 'target', 'bundleId'],
    default: {
      platform: os.platform() === 'win32' ? 'windows' : 'macos',
      target: process.cwd(),
    },
  });

  const platform = args.platform.toLowerCase();
  const platformInfo = platformData[platform];
  if (!platformInfo) {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }

  return {
    platform: platform,
    target: args.target,
    driver: platformInfo.driver,
    bundleId: args.bundleId || 'com.microsoft.FluentApp',
    e2eDir: path.resolve(__dirname, '..'),
  };
}

function setupEnvironment(config: TestConfig) {
  process.env.FURN_E2E_PLATFORM = config.platform;
  process.env.FURN_E2E_TARGET = config.target;
  process.env.FURN_E2E_BUNDLE_ID = config.bundleId;
  process.env.APPIUM_HOME = path.join(config.e2eDir, '.appium');
}

// Install appium driver if not already installed

function ensureAppiumDriver(driverName: string, execOptions: ExecSyncOptionsWithStringEncoding) {
  const installedList = JSON.parse(execSync(`yarn exec appium driver list --installed --json`, execOptions));
  if (!installedList || !installedList[driverName]) {
    console.log(`Installing Appium driver: ${driverName}`);
    execSync(`yarn exec appium driver install ${driverName}`, execOptions);
  } else {
    console.log(`Appium driver already installed: ${driverName}`);
  }
}

function main() {
  const config = loadConfig();
  setupEnvironment(config);
  console.log(`E2E Tests for platform: ${config.platform}, path: ${config.target}, bundleId: ${config.bundleId}`);

  const execSyncOptions: ExecSyncOptionsWithStringEncoding = {
    cwd: config.e2eDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf-8',
  };
  ensureAppiumDriver(config.driver, execSyncOptions);
}

main();
