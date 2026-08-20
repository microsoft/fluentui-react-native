/**
 * The desktop test server.
 *
 * Composes the loopback run service, the WebdriverIO run executor, and the Storybook channel
 * announcer into one owned process. This is what `desktop-driver serve` starts, and what a
 * consumer embeds when it wants the same thing from Node.
 *
 * Everything stays host-side: the device only ever sends a story id that must already exist in the
 * generated manifest, and receives progress back.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { createAnnouncement, startServiceAnnouncer, type AnnouncerHandle } from './announce.ts';
import { createWebdriverIoRunExecutor, type DesktopRunnerCommand } from './run-executor.ts';
import { DesktopTestService } from './test-service.ts';
import { DesktopValidationError } from '../errors.ts';
import { StoryController } from './controller.ts';
import { STORY_PLAN_SCHEMA_VERSION } from '../protocol.ts';
import type { StoryTestManifest } from '../types.ts';

export interface DesktopTestServerOptions {
  /** Path to the generated `story-tests.manifest.json`. */
  manifestPath: string;
  /** How the WebdriverIO runner is invoked. Fully specified here, never by a request. */
  runner: DesktopRunnerCommand;
  host?: string;
  port?: number;
  /** Storybook channel server used for discovery. Defaults to `127.0.0.1:7007`. */
  storybook?: { host?: string; port?: number };
  /** Re-broadcast interval for the announcement. Defaults to 5000. */
  announceIntervalMs?: number;
  onOutput?: (chunk: string) => void;
}

export interface DesktopTestServerHandle {
  url: string;
  token: string;
  manifest: StoryTestManifest;
  /** Broadcasts the announcement once; resolves false when the channel is unreachable. */
  announceNow(): Promise<boolean>;
  stop(): Promise<void>;
}

/** Reads and validates a generated manifest. */
export function loadStoryTestManifest(manifestPath: string): StoryTestManifest {
  const resolved = path.resolve(manifestPath);
  if (!fs.existsSync(resolved)) {
    throw new DesktopValidationError('Missing generated story-test manifest', [
      `${resolved} does not exist; run "desktop-driver stories generate" first`,
    ]);
  }
  const manifest = JSON.parse(fs.readFileSync(resolved, 'utf8')) as StoryTestManifest;
  if (manifest.version !== STORY_PLAN_SCHEMA_VERSION) {
    throw new DesktopValidationError('Unsupported story-test manifest', [
      `version ${String(manifest.version)} does not match ${STORY_PLAN_SCHEMA_VERSION}`,
    ]);
  }
  if (!Array.isArray(manifest.entries)) {
    throw new DesktopValidationError('Malformed story-test manifest', ['entries must be an array']);
  }
  return manifest;
}

/** Starts the desktop test server and announces it to the running application. */
export async function startDesktopTestServer(options: DesktopTestServerOptions): Promise<DesktopTestServerHandle> {
  const manifest = loadStoryTestManifest(options.manifestPath);

  const service = new DesktopTestService({
    manifest,
    host: options.host,
    port: options.port,
    execute: createWebdriverIoRunExecutor({ manifest, runner: options.runner, onOutput: options.onOutput }),
  });

  const { url, token } = await service.start();

  const controller = new StoryController({
    baseUrl: `http://${options.storybook?.host ?? '127.0.0.1'}:${options.storybook?.port ?? 7007}`,
  });

  let announcer: AnnouncerHandle | undefined;
  try {
    announcer = startServiceAnnouncer({
      controller,
      announcement: createAnnouncement(url, token, manifest.digest),
      intervalMs: options.announceIntervalMs,
    });
    await announcer.announceNow();
  } catch (error) {
    await service.stop();
    throw error;
  }

  return {
    url,
    token,
    manifest,
    announceNow: () => announcer!.announceNow(),
    stop: async () => {
      announcer?.stop();
      await service.stop();
    },
  };
}
