/**
 * Internal driver-host surface.
 *
 * Exported so tooling and tests can own a host directly. Test authors never import this: they get
 * an ordinary WebdriverIO session from the `./wdio` subpath.
 */

export { availableBackends, startBackend } from './backends.ts';
export type { BackendHandle, BackendStartOptions } from './backends.ts';
export { startDriverHost } from './client.ts';
export type { DriverHostHandle, StartDriverHostOptions } from './client.ts';
export { readDriverHostConfig, runDriverHost } from './host-main.ts';
export type { DriverHostConfigFile } from './host-main.ts';
export { createFakeRoutes, ELEMENT_KEY, FakeDriver, loadFakeScene } from './fake-driver.ts';
export { createRouteDispatcher, startW3CServer, W3CError } from './w3c-server.ts';
export type { DispatchResult, RouteDefinition, W3CServerHandle } from './w3c-server.ts';
