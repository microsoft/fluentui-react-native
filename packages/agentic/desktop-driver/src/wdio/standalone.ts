import { appendCleanupFailure, DesktopDriverError } from '../errors.ts';
import { OwnershipManifest } from '../ownership.ts';
import { resolveDesktopOptions } from '../config.ts';
import type { DesktopDriverHandle, DesktopDriverOptions, ResolvedDesktopDriverOptions } from '../types.ts';
import { buildCapabilities, buildRootSessionCapabilities } from './capability-map.ts';
import { createRootSessionEnumerator, discoverAttachWindow, type DesktopWindowMatch } from './window-discovery.ts';

async function driverHostClient(): Promise<typeof import('../server/webdriver/client.ts')> {
  return import('../server/webdriver/client.ts');
}

export async function resolveAttachWindow(
  options: ResolvedDesktopDriverOptions,
  webDriverUrl: string,
): Promise<DesktopWindowMatch | undefined> {
  const target = options.target;
  if (target.mode !== 'attach' || options.backend !== 'novawindows') {
    return undefined;
  }
  const enumerate = createRootSessionEnumerator({
    webDriverUrl,
    capabilities: buildRootSessionCapabilities(options),
    need: { identity: target.identity !== undefined },
  });
  try {
    return await discoverAttachWindow(target, enumerate);
  } catch (error) {
    throw new DesktopDriverError(`Failed to resolve the attach target to a single top-level window: ${(error as Error).message}`, {
      kind: error instanceof DesktopDriverError ? error.kind : 'ownership',
      cause: error,
      detail: { target, ...(error instanceof DesktopDriverError ? error.detail : undefined) },
    });
  }
}

/** Starts an owned driver host for a standalone non-testrunner session. */
export async function startDesktopDriver(options: DesktopDriverOptions): Promise<DesktopDriverHandle> {
  const resolved = resolveDesktopOptions(options);
  const ownership = new OwnershipManifest(`standalone-${process.pid}`);
  const { startDriverHost } = await driverHostClient();
  const host = await startDriverHost({
    backend: resolved.backend,
    host: resolved.host,
    port: resolved.port,
    startupTimeout: resolved.startupTimeout,
    fakeScene: resolved.fakeScene,
  });
  ownership.record('driverHost', host.pid, 'self', `${resolved.backend} driver host`);
  ownership.record('port', host.port, 'self');

  const window = await resolveAttachWindow(resolved, host.health.webDriverUrl).catch(async (error: unknown) => {
    await host.stop();
    throw error;
  });
  if (window) {
    ownership.record('window', window.candidate.handle, 'external', window.candidate.name);
    if (window.candidate.processId !== undefined) {
      ownership.record('app', window.candidate.processId, 'external', window.candidate.name);
    }
  }
  const capabilities = buildCapabilities(resolved, { windowHandle: window?.candidate.handle });
  return {
    webdriverOptions: {
      protocol: 'http',
      hostname: resolved.host,
      port: host.port,
      path: '/',
      capabilities,
      logLevel: resolved.logLevel,
    },
    options: resolved,
    health: host.health,
    ownedResources: ownership.list(),
    stop: async () => {
      let failure: unknown;
      try {
        await host.stop();
      } catch (error) {
        failure = error;
      }
      for (const cleanupFailure of await ownership.terminateOwnedProcesses()) {
        failure = appendCleanupFailure(failure, cleanupFailure);
      }
      if (failure) {
        throw failure;
      }
    },
  };
}
