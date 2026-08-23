/**
 * Desktop Storybook hosts.
 *
 * `startDesktopStorybookHost` is the user-facing combined channel, MCP, and test coordinator.
 *
 * Everything stays host-side: the device only ever sends a story id that must already exist in the
 * generated manifest, and receives progress back.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type * as http from 'node:http';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { startDesktopChannelBridge, type ChannelServerLike, type ChannelSocketLike } from './channel/bridge.ts';
import { createWebdriverIoRunExecutor, type DesktopRunnerCommand } from './runner/wdio-runner.ts';
import { RunCoordinator } from './coordinator.ts';
import { appendCleanupFailure, DesktopValidationError } from '../errors.ts';
import { hostForUrl, waitForHttp } from '../net.ts';
import { isLoopbackHost } from '../core/loopback.ts';
import { validateStoryTestManifest } from '../storybook/manifest.ts';
import type { StoryTestManifest } from '../types.ts';

export interface DesktopStorybookHostOptions {
  /** Storybook configuration directory used to build the story index and MCP documentation. */
  configPath: string;
  /** Path to the generated `story-tests.manifest.json`. */
  manifestPath: string;
  /** How WebdriverIO is invoked for an on-device run request. */
  runner: DesktopRunnerCommand;
  host?: string;
  /** Storybook channel/MCP port. Defaults to 7007. */
  port?: number;
  experimentalMcp?: boolean;
  announceIntervalMs?: number;
  onOutput?: (chunk: string) => void;
}

export interface DesktopStorybookHostHandle {
  url: string;
  serviceId: string;
  manifest: StoryTestManifest;
  stop(): Promise<void>;
}

interface OwnedChannelSocket extends ChannelSocketLike {
  terminate?(): void;
}

interface OwnedChannelServer extends ChannelServerLike {
  clients: Set<OwnedChannelSocket>;
  close(callback: (error?: Error) => void): void;
  options?: { server?: http.Server };
}

/** Reads and validates a generated manifest. */
export function loadStoryTestManifest(manifestPath: string): StoryTestManifest {
  const resolved = path.resolve(manifestPath);
  if (!fs.existsSync(resolved)) {
    throw new DesktopValidationError('Missing generated story-test manifest', [
      `${resolved} does not exist; run "desktop-driver stories generate" first`,
    ]);
  }
  let value: unknown;
  try {
    value = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (error) {
    throw new DesktopValidationError('Malformed story-test manifest', [`${resolved}: ${(error as Error).message}`]);
  }
  return validateStoryTestManifest(value, resolved);
}

/**
 * Starts the user-facing desktop host.
 *
 * Storybook's channel server is the only client conduit. The proven HTTP run service binds to an
 * ephemeral loopback port inside this process and is bridged to channel events, so applications
 * and external clients never discover or configure a second endpoint.
 */
export async function startDesktopStorybookHost(options: DesktopStorybookHostOptions): Promise<DesktopStorybookHostHandle> {
  const host = options.host ?? '127.0.0.1';
  if (!isLoopbackHost(host)) {
    throw new DesktopValidationError('Cannot start the Storybook desktop host', [
      `The desktop host refuses to bind to non-loopback address "${host}"`,
    ]);
  }
  const port = options.port ?? 7007;
  const configPath = path.resolve(options.configPath);
  const manifest = loadStoryTestManifest(options.manifestPath);
  const coordinator = new RunCoordinator({
    manifest,
    execute: createWebdriverIoRunExecutor({ manifest, runner: options.runner, onOutput: options.onOutput }),
  });
  const createChannelServer = await resolveCreateChannelServer(configPath);
  const created = createChannelServer({
    host,
    port,
    configPath,
    websockets: true,
    experimental_mcp: options.experimentalMcp ?? true,
    keepNodeProcessAlive: true,
  });
  if (!created) {
    throw new DesktopValidationError('Failed to start the Storybook channel server', ['WebSocket support is required']);
  }
  const channel = created as unknown as OwnedChannelServer;
  const url = `http://${hostForUrl(host)}:${port}`;

  try {
    await waitForOwnedChannelServer(channel, port);
    await waitForHttp(`${url}/index.json`, { timeout: 30_000 });
    const bridge = startDesktopChannelBridge({
      channel,
      coordinator,
      manifest,
      announceIntervalMs: options.announceIntervalMs,
    });

    return {
      url,
      serviceId: bridge.serviceId,
      manifest,
      stop: async () => {
        let failure: unknown;
        try {
          bridge.stop();
        } catch (error) {
          failure = error;
        }
        try {
          await coordinator.stop();
        } catch (error) {
          failure = appendCleanupFailure(failure, error);
        }
        try {
          await closeChannelServer(channel);
        } catch (error) {
          failure = appendCleanupFailure(failure, error);
        }
        if (failure) {
          throw failure;
        }
      },
    };
  } catch (error) {
    await coordinator.stop().catch(() => undefined);
    await closeChannelServer(channel).catch(() => undefined);
    throw error;
  }

  type CreateChannelServer = (options: {
    host: string;
    port: number;
    configPath: string;
    websockets: boolean;
    experimental_mcp: boolean;
    keepNodeProcessAlive: boolean;
  }) => unknown;

  async function resolveCreateChannelServer(configPath: string): Promise<CreateChannelServer> {
    const packageRequire = createRequire(path.join(configPath, 'package.json'));
    let modulePath: string;
    try {
      modulePath = packageRequire.resolve('@storybook/react-native/node');
    } catch (error) {
      throw new DesktopValidationError('Cannot start the Storybook desktop host', [
        `Resolve @storybook/react-native from the package that owns "${configPath}": ${(error as Error).message}`,
      ]);
    }
    const module = (await import(pathToFileURL(modulePath).href)) as {
      createChannelServer?: CreateChannelServer;
      default?: { createChannelServer?: CreateChannelServer };
    };
    const createChannelServer = module.createChannelServer ?? module.default?.createChannelServer;
    if (!createChannelServer) {
      throw new DesktopValidationError('Cannot start the Storybook desktop host', [`${modulePath} does not export createChannelServer`]);
    }
    return createChannelServer;
  }

  async function waitForOwnedChannelServer(channel: OwnedChannelServer, port: number): Promise<void> {
    const server = channel.options?.server;
    if (!server) {
      throw new DesktopValidationError('Cannot verify Storybook channel ownership', ['createChannelServer did not expose its HTTP server']);
    }
    if (server.listening) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const cleanup = (): void => {
        server.off('listening', onListening);
        server.off('error', onError);
      };
      const onListening = (): void => {
        cleanup();
        resolve();
      };
      const onError = (error: NodeJS.ErrnoException): void => {
        cleanup();
        reject(
          new DesktopValidationError('Cannot bind the Storybook desktop host', [
            error.code === 'EADDRINUSE' ? `Port ${port} is already in use` : error.message,
          ]),
        );
      };
      server.once('listening', onListening);
      server.once('error', onError);
    });
  }
}

async function closeChannelServer(channel: OwnedChannelServer): Promise<void> {
  for (const client of channel.clients) {
    client.terminate?.();
  }
  await new Promise<void>((resolve, reject) => {
    channel.close((error) => (error ? reject(error) : resolve()));
  });
  const server = channel.options?.server;
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
}
