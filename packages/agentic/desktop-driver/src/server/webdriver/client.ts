/**
 * Parent-side lifecycle for the single-driver host.
 *
 * Allocates the port, writes the allowlisted configuration, spawns the host, waits for its ready
 * handshake, streams its logs, and tears down exactly what it started.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { appendCleanupFailure, DesktopDriverError } from '../../errors.ts';
import { allocatePort } from '../../net.ts';
import { DESKTOP_PROTOCOL_VERSION } from '../../protocol/versions.ts';
import { PACKAGE_VERSION } from '../../package-version.ts';
import { terminateProcessTree } from '../../process-supervisor.ts';
import type { DesktopBackendId, DesktopFakeScene, DriverHostHealth } from '../../types.ts';
import type { DriverHostConfigFile } from './host-main.ts';

export interface StartDriverHostOptions {
  backend: DesktopBackendId;
  host?: string;
  /** `0` allocates a free loopback port. */
  port?: number;
  startupTimeout?: number;
  fakeScene?: string | DesktopFakeScene;
  /** Directory that receives `driver-host.log` and the generated host configuration. */
  logDirectory?: string;
}

export interface DriverHostHandle {
  health: DriverHostHealth;
  pid: number;
  port: number;
  logFile?: string;
  /** Subscribes to host termination after startup. */
  onExit(listener: (event: DriverHostExit) => void): () => void;
  stop(): Promise<void>;
}

export interface DriverHostExit {
  code: number | null;
  signal: NodeJS.Signals | null;
  error?: Error;
}

/** Resolves the host entry next to this module, in either source or built form. */
function resolveHostEntry(): string {
  const extension = import.meta.url.endsWith('.ts') ? '.ts' : '.js';
  return fileURLToPath(new URL(`./host-main${extension}`, import.meta.url));
}

/** Flags that register a module loader or transpiler hook into a Node process. */
const LOADER_FLAGS = ['--require', '-r', '--import', '--loader', '--experimental-loader'];

/**
 * Removes loader registrations from an inherited `NODE_OPTIONS`.
 *
 * The driver host is plain JavaScript and must start in a clean module resolver. A parent that
 * runs TypeScript sources — the WebdriverIO testrunner registers `tsx` this way to load
 * `wdio.conf.ts` — would otherwise push its transpiler hook into the host, where it rewrites
 * resolution for the platform driver's dependency tree and breaks it. Other options (heap size,
 * proxies, TLS roots) are deliberately preserved.
 */
export function sanitizeNodeOptions(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }
  const tokens = value.split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const flag = token.includes('=') ? token.slice(0, token.indexOf('=')) : token;
    if (!LOADER_FLAGS.includes(flag)) {
      kept.push(token);
      continue;
    }
    if (!token.includes('=')) {
      // The value is the next token, and it goes with the flag.
      index++;
    }
  }
  return kept.join(' ');
}

export async function startDriverHost(options: StartDriverHostOptions): Promise<DriverHostHandle> {
  const host = options.host ?? '127.0.0.1';
  const port = options.port && options.port > 0 ? options.port : await allocatePort(host);
  const startupTimeout = options.startupTimeout ?? 120_000;

  const ownsWorkDirectory = options.logDirectory === undefined;
  const workDirectory = options.logDirectory ?? fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-host-'));
  fs.mkdirSync(workDirectory, { recursive: true });

  const config: DriverHostConfigFile = {
    protocolVersion: DESKTOP_PROTOCOL_VERSION,
    backend: options.backend,
    host,
    port,
    packageVersion: PACKAGE_VERSION,
    fakeScene: options.fakeScene,
    parentPid: process.pid,
  };
  const configFile = path.join(workDirectory, 'driver-host.config.json');
  fs.writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  const logFile = path.join(workDirectory, 'driver-host.log');
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  const child = spawn(process.execPath, [resolveHostEntry(), configFile], {
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    detached: process.platform !== 'win32',
    env: { ...process.env, NODE_NO_WARNINGS: '1', NODE_OPTIONS: sanitizeNodeOptions(process.env.NODE_OPTIONS) },
  });

  const health = await waitForReady(child, logStream, startupTimeout).catch(async (error: unknown) => {
    await stopChild(child);
    await new Promise<void>((resolve) => logStream.end(resolve));
    if (ownsWorkDirectory) {
      fs.rmSync(workDirectory, { recursive: true, force: true });
    }
    throw error;
  });
  const exitListeners = new Set<(event: DriverHostExit) => void>();
  let exitEvent: DriverHostExit | undefined;
  const publishExit = (event: DriverHostExit): void => {
    if (exitEvent) {
      return;
    }
    exitEvent = event;
    for (const listener of exitListeners) {
      listener(event);
    }
  };
  child.once('error', (error) => publishExit({ code: child.exitCode, signal: child.signalCode, error }));
  child.once('exit', (code, signal) => publishExit({ code, signal }));

  return {
    health,
    pid: child.pid ?? -1,
    port,
    logFile,
    onExit: (listener) => {
      exitListeners.add(listener);
      if (exitEvent) {
        listener(exitEvent);
      }
      return () => exitListeners.delete(listener);
    },
    stop: async () => {
      let failure: unknown;
      try {
        await stopChild(child);
      } catch (error) {
        failure = error;
      }
      await new Promise<void>((resolve) => logStream.end(resolve));
      if (ownsWorkDirectory) {
        try {
          fs.rmSync(workDirectory, { recursive: true, force: true });
        } catch (error) {
          failure = appendCleanupFailure(failure, error);
        }
      }
      if (failure) {
        throw failure;
      }
    },
  };
}

function waitForReady(child: ChildProcess, logStream: fs.WriteStream, timeout: number): Promise<DriverHostHealth> {
  return new Promise<DriverHostHealth>((resolve, reject) => {
    let settled = false;
    let stdoutBuffer = '';
    const stderrTail: string[] = [];

    const timer = setTimeout(() => {
      finish(
        new DesktopDriverError(`Driver host did not become ready within ${timeout}ms`, {
          kind: 'driverHost',
          detail: { stderr: stderrTail.join('') },
        }),
      );
    }, timeout);
    timer.unref();

    const finish = (error?: Error, health?: DriverHostHealth): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (error) {
        reject(error);
        return;
      }
      resolve(health!);
    };

    child.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      logStream.write(text);
      if (settled) {
        return;
      }
      stdoutBuffer += text;
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop() ?? '';
      if (stdoutBuffer.length > 1024 * 1024) {
        stdoutBuffer = stdoutBuffer.slice(-1024 * 1024);
      }
      for (const line of lines) {
        if (line.trim().length === 0) {
          continue;
        }
        try {
          const message = JSON.parse(line) as { type?: string; health?: DriverHostHealth; message?: string };
          if (message.type === 'desktop-driver-host/ready' && message.health) {
            finish(undefined, message.health);
            return;
          }
          if (message.type === 'desktop-driver-host/error') {
            finish(new DesktopDriverError(`Driver host failed to start: ${message.message ?? 'unknown error'}`, { kind: 'driverHost' }));
            return;
          }
        } catch {
          // Non-JSON output is ordinary driver logging; it is captured, not parsed.
        }
      }
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      logStream.write(text);
      stderrTail.push(text.slice(-8192));
      if (stderrTail.length > 50) {
        stderrTail.shift();
      }
      if (settled) {
        return;
      }
      // The host reports a structured startup failure on stderr. Surfacing it here means the run
      // fails with the real cause rather than "exited before becoming ready".
      for (const line of text.split('\n')) {
        if (!line.includes('desktop-driver-host/error')) {
          continue;
        }
        try {
          const message = JSON.parse(line) as { type?: string; message?: string; stack?: string };
          if (message.type === 'desktop-driver-host/error') {
            finish(
              new DesktopDriverError(`Driver host failed to start: ${message.message ?? 'unknown error'}`, {
                kind: 'driverHost',
                detail: { stack: message.stack },
              }),
            );
            return;
          }
        } catch {
          // Partial or non-JSON stderr is ordinary driver logging.
        }
      }
    });

    child.on('error', (error) => finish(new DesktopDriverError('Failed to spawn the driver host', { kind: 'driverHost', cause: error })));
    child.on('exit', (code, signal) => {
      finish(
        new DesktopDriverError(`Driver host exited before becoming ready (code ${String(code)}, signal ${String(signal)})`, {
          kind: 'driverHost',
          detail: { stderr: stderrTail.join('') },
        }),
      );
    });
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  const pid = child.pid;
  if (!pid) {
    throw new DesktopDriverError('Cannot stop driver host because it has no process id', { kind: 'driverHost' });
  }
  await terminateProcessTree({
    pid,
    processGroup: process.platform !== 'win32',
    gracefulShutdown: () => requestHostShutdown(child),
  });
}

function requestHostShutdown(child: ChildProcess): Promise<void> {
  if (!child.connected) {
    child.kill('SIGTERM');
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      child.off('message', onMessage);
      child.off('exit', onExit);
    };
    const onMessage = (message: unknown): void => {
      const result = message as { type?: string; ok?: boolean; message?: string };
      if (result.type !== 'desktop-driver-host/stopped') {
        return;
      }
      cleanup();
      if (result.ok) {
        resolve();
      } else {
        reject(new DesktopDriverError(`Driver host cleanup failed: ${result.message ?? 'unknown error'}`, { kind: 'driverHost' }));
      }
    };
    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
      cleanup();
      if (code === 0) {
        resolve();
      } else {
        reject(
          new DesktopDriverError(`Driver host exited during cleanup (code ${String(code)}, signal ${String(signal)})`, {
            kind: 'driverHost',
          }),
        );
      }
    };
    child.on('message', onMessage);
    child.once('exit', onExit);
    child.send({ type: 'desktop-driver-host/shutdown' }, (error) => {
      if (error) {
        cleanup();
        reject(new DesktopDriverError('Failed to request driver host shutdown', { kind: 'driverHost', cause: error }));
      }
    });
  });
}
