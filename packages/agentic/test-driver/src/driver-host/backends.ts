/**
 * Backend registry for the single-driver host.
 *
 * The Appium driver classes and their base-driver types never leave this module tree: they are
 * constructed inside the host child process, and the parent only ever sees a plain WebDriver
 * endpoint. That boundary is what lets the package reuse `appium-mac2-driver` and
 * `appium-windows-driver` without making Appium part of the product's test-authoring model, and
 * what makes an Appium 4 migration (or a fully local route host) a change nobody's specs notice.
 *
 * The imports below are dynamic and optional on purpose: a macOS machine must not be required to
 * install the Windows driver, and neither driver may be loaded when the `fake` backend is used.
 */

import { createFakeRoutes, FakeDriver, loadFakeScene } from './fake-driver.ts';
import { startW3CServer, type RouteDefinition, type W3CServerHandle } from './w3c-server.ts';
import { appendCleanupFailure } from '../errors.ts';
import type { DesktopBackendId, DesktopFakeScene } from '../types.ts';

export interface BackendStartOptions {
  backend: DesktopBackendId;
  host: string;
  port: number;
  /** Scene document or path, only used by the `fake` backend. */
  fakeScene?: string | DesktopFakeScene;
}

export interface BackendHandle {
  server: W3CServerHandle;
  /** URL of the Storybook-compatible surface, when the backend provides one. */
  storybookUrl?: string;
  stop(): Promise<void>;
}

/**
 * Appium's `routeConfiguringFunction` / `server` pair is a driver-author API, and the base-driver
 * convenience `server` export is marked deprecated for Appium 4. It is isolated behind this one
 * function so the migration is a single-file change.
 */
async function startAppiumHostedDriver(options: BackendStartOptions): Promise<BackendHandle> {
  const { routeConfiguringFunction, server } = (await import('appium/driver.js')) as {
    routeConfiguringFunction: (driver: unknown) => unknown;
    server: (config: { hostname: string; port: number; routeConfiguringFunction: unknown }) => Promise<{ close(): Promise<void> }>;
  };

  const driver = await constructDriver(options.backend);
  const hosted = await server({
    hostname: options.host,
    port: options.port,
    routeConfiguringFunction: routeConfiguringFunction(driver),
  });

  const url = `http://${options.host}:${options.port}`;
  return {
    server: { url, port: options.port, close: () => hosted.close() },
    stop: async () => {
      let failure: unknown;
      const sessionDriver = driver as { sessionId?: string; deleteSession?: () => Promise<void> };
      const deleteSession = sessionDriver.deleteSession;
      if (typeof deleteSession === 'function' && sessionDriver.sessionId) {
        try {
          await deleteSession.call(driver);
        } catch (error) {
          failure = error;
        }
      }
      try {
        await hosted.close();
      } catch (error) {
        failure = appendCleanupFailure(failure, error);
      }
      if (failure) {
        throw failure;
      }
    },
  };
}

async function constructDriver(backend: DesktopBackendId): Promise<unknown> {
  switch (backend) {
    case 'mac2': {
      const module = (await import('appium-mac2-driver')) as { Mac2Driver: new (options: Record<string, unknown>) => unknown };
      return new module.Mac2Driver({});
    }
    case 'windows': {
      const module = (await import('appium-windows-driver')) as { WindowsDriver: new (options: Record<string, unknown>) => unknown };
      return new module.WindowsDriver({});
    }
    case 'novawindows': {
      const module = (await import('appium-novawindows-driver' as string)) as {
        NovaWindowsDriver: new (options: Record<string, unknown>) => unknown;
      };
      return new module.NovaWindowsDriver({});
    }
    default:
      throw new Error(`Backend "${backend}" is not hosted by an Appium driver`);
  }
}

async function startFakeBackend(options: BackendStartOptions): Promise<BackendHandle> {
  const driver = new FakeDriver(loadFakeScene(options.fakeScene));
  const routes: readonly RouteDefinition[] = createFakeRoutes(driver);
  const server = await startW3CServer({ host: options.host, port: options.port, routes });
  return {
    server,
    storybookUrl: server.url,
    stop: () => server.close(),
  };
}

/** Starts exactly one backend behind the loopback route host. */
export async function startBackend(options: BackendStartOptions): Promise<BackendHandle> {
  if (options.backend === 'fake') {
    return startFakeBackend(options);
  }
  return startAppiumHostedDriver(options);
}

/** Backends that can be constructed on the current operating system. */
export function availableBackends(platform: NodeJS.Platform = process.platform): readonly DesktopBackendId[] {
  if (platform === 'darwin') {
    return ['fake', 'mac2'];
  }
  if (platform === 'win32') {
    return ['fake', 'windows', 'novawindows'];
  }
  return ['fake'];
}
