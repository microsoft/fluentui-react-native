export {
  createDesktopDriverClient,
  DesktopDriverClient,
  DesktopElementClient,
  DesktopSessionClient,
} from './client/DesktopDriverClient.js';
export type { DesktopDriverClientOptions } from './client/DesktopDriverClient.js';
export { validateDesktopStoryTests } from './authoring/storyTests.js';
export type {
  DesktopStoryCapability,
  DesktopStorySelector,
  DesktopStoryStep,
  DesktopStoryTest,
  DesktopStoryTests,
} from './authoring/storyTests.js';
export type {
  ApplicationLease,
  DesktopHost,
  DesktopHostFeatures,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  NativeElementScope,
  NativeElementSnapshot,
  NativeImage,
  NativeSearchRoot,
  NativeSelector,
  Rect,
  SupportedValue,
} from './host/types.js';
export { webElementIdentifier } from './protocol/constants.js';
export { HostStaleError, HostUnsupportedError, WebDriverError } from './protocol/errors.js';
export type { WebDriverErrorCode } from './protocol/errors.js';
export {
  type DesktopClickMode,
  type DesktopEndpoint,
  type DesktopPlatformName,
  type DesktopRenderer,
  type DesktopTimeouts,
  type NewSessionCapabilities,
  type NewSessionRequest,
  type WebDriverAction,
  type WebDriverActionSequence,
  type WebDriverElement,
  type WebDriverErrorResponse,
  type WebDriverResponse,
  type WebDriverTimeouts,
} from './protocol/types.js';
export { createDesktopDriverServer, SessionManager, TargetRegistry } from './server/index.js';
export type { DesktopDriverServer, DesktopDriverServerOptions, DesktopSession, ElementRecord } from './server/index.js';
export type {
  DesktopStoryManifest,
  DesktopStoryManifestEntry,
  StoryOrchestrator,
  StoryReadyResult,
  StorySelectionRequest,
} from './storybook.js';
