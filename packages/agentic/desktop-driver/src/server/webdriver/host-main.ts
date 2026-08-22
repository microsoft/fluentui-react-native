/**
 * Single-driver host child-process entry point.
 *
 * Started by `driver-host/client.ts`, never by a user. It reads one validated configuration
 * document from an allowlisted file, constructs exactly one backend, binds only to loopback, and
 * exits when its owning parent disappears. It intentionally accepts no module names, no command
 * lines, and no external hosts.
 */

import * as fs from 'node:fs';

import { startBackend } from './backends.ts';
import { DESKTOP_PROTOCOL_VERSION } from '../../protocol.ts';
import type { DesktopBackendId, DesktopFakeScene, DriverHostHealth } from '../../types.ts';

export interface DriverHostConfigFile {
  protocolVersion: number;
  backend: DesktopBackendId;
  host: string;
  port: number;
  packageVersion: string;
  fakeScene?: string | DesktopFakeScene;
  /** Parent process id. The host exits when this process disappears. */
  parentPid: number;
}

const VALID_BACKENDS: readonly DesktopBackendId[] = ['fake', 'mac2', 'novawindows'];
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

export function readDriverHostConfig(file: string): DriverHostConfigFile {
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as DriverHostConfigFile;
  if (parsed.protocolVersion !== DESKTOP_PROTOCOL_VERSION) {
    throw new Error(`Driver host config protocol version ${parsed.protocolVersion} does not match ${DESKTOP_PROTOCOL_VERSION}`);
  }
  if (!VALID_BACKENDS.includes(parsed.backend)) {
    throw new Error(`Unknown driver host backend "${parsed.backend}"`);
  }
  if (!LOOPBACK_HOSTS.has(parsed.host)) {
    throw new Error(`Driver host refuses to bind to non-loopback address "${parsed.host}"`);
  }
  if (!Number.isInteger(parsed.port) || parsed.port < 1 || parsed.port > 65535) {
    throw new Error(`Driver host requires an explicitly allocated port, got "${String(parsed.port)}"`);
  }
  return parsed;
}

/** Runs the host until the parent disappears or a shutdown is requested. */
export async function runDriverHost(configFile: string): Promise<void> {
  const config = readDriverHostConfig(configFile);

  const handle = await startBackend({
    backend: config.backend,
    host: config.host,
    port: config.port,
    fakeScene: config.fakeScene,
  });

  let shuttingDown = false;
  const shutdown = async (code: number): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    try {
      await handle.stop();
      await sendToParent({ type: 'desktop-driver-host/stopped', ok: true });
      process.exit(code);
    } catch (error) {
      await sendToParent({
        type: 'desktop-driver-host/stopped',
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown(0));
  process.on('SIGINT', () => void shutdown(0));
  process.on('message', (message) => {
    if ((message as { type?: string } | undefined)?.type === 'desktop-driver-host/shutdown') {
      void shutdown(0);
    }
  });

  // The host must never outlive the service that owns it, even if that service is killed hard.
  const parentWatch = setInterval(() => {
    try {
      process.kill(config.parentPid, 0);
    } catch {
      void shutdown(0);
    }
  }, 1000);
  parentWatch.unref();

  const health: DriverHostHealth = {
    status: 'ok',
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    packageVersion: config.packageVersion,
    backend: config.backend,
    webDriverUrl: handle.server.url,
    storybookUrl: handle.storybookUrl,
    pid: process.pid,
  };

  // The parent reads health from stdout rather than probing an extra port, which keeps the host
  // to exactly one listening socket.
  process.stdout.write(`${JSON.stringify({ type: 'desktop-driver-host/ready', health })}\n`);
}

function sendToParent(message: Record<string, unknown>): Promise<void> {
  if (!process.send) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    process.send!(message, () => resolve());
  });
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (invokedDirectly) {
  const configFile = process.argv[2];
  if (!configFile) {
    process.stderr.write('Usage: node host-main.ts <config-file>\n');
    process.exit(2);
  }
  runDriverHost(configFile).catch((error: unknown) => {
    // The parent surfaces this verbatim as the run's infrastructure failure, so it carries the
    // stack: a driver that fails to construct almost always fails inside a dependency, and the
    // message alone does not say which one.
    process.stderr.write(
      `${JSON.stringify({
        type: 'desktop-driver-host/error',
        message: error instanceof Error ? error.message : String(error),
        code: (error as NodeJS.ErrnoException | undefined)?.code,
        stack: error instanceof Error ? error.stack : undefined,
      })}\n`,
    );
    process.exit(1);
  });
}
