/**
 * Public core surface for `@fluentui-react-native/desktop-driver`.
 *
 * A shared spec normally needs only `byTestId` and `story`; everything else here supports
 * tooling, custom runners, and the Storybook integration.
 */

export { byTestId, isPortableTestId, assertPortableTestId } from './selectors.ts';
export { story, type StoryHelper } from './story-helper.ts';
export type { DesktopBrowserCommands } from './wdio/commands.ts';

export {
  PORTABLE_COMMANDS,
  PORTABLE_COMMAND_MATRIX_VERSION,
  PORTABLE_COMMAND_SURFACES,
  missingPortableCommands,
  platformExtensionsFor,
  portableCommandsFor,
  type PortableCommandSurface,
} from './capabilities.ts';

export {
  DEFAULT_READINESS_TIMEOUT,
  DEFAULT_RENDER_TIMEOUT,
  DEFAULT_STARTUP_TIMEOUT,
  DEFAULT_STORYBOOK_PORT,
  attachIdentityPrecedence,
  defaultBackendFor,
  resolveDesktopOptions,
  validateAppTarget,
} from './config.ts';

export {
  DesktopCancelledError,
  DesktopDriverError,
  DesktopValidationError,
  appendCleanupFailure,
  type DesktopErrorKind,
} from './errors.ts';

export { DesktopLifecycle, isTerminalState, type LifecycleListener, type LifecycleOptions } from './lifecycle.ts';
export { OwnershipManifest, isAlive, type OwnershipManifestData } from './ownership.ts';
export { ArtifactStore, createRunId, redact, toArtifactId, type ArtifactStoreOptions } from './artifacts.ts';
export { renderJUnit } from './junit.ts';
export { allocatePort, delay, waitForHttp, type WaitForHttpOptions } from './net.ts';
export { DESKTOP_PROTOCOL_VERSION, STORY_PLAN_SCHEMA_VERSION } from './protocol.ts';
export { PACKAGE_VERSION } from './package-version.ts';
export { isInlinePlan, isSpecPlan, planTestIds, validateStoryPlan } from './story-plan.ts';

export type {
  ArtifactManifest,
  DesktopAppState,
  DesktopAppTarget,
  DesktopBackendId,
  DesktopDriverOptions,
  DesktopDriverService,
  DesktopExitReason,
  DesktopFakeElement,
  DesktopFakeMutation,
  DesktopFakeScene,
  DesktopLifecycleEvent,
  DesktopLifecycleEventType,
  DesktopOwnedResource,
  DesktopOwnership,
  DesktopPlatform,
  DesktopReadinessOptions,
  DesktopRunReport,
  DesktopServiceRunStatus,
  DesktopSessionInfo,
  DesktopStorybookOptions,
  DesktopTestResult,
  DriverHostHealth,
  InlineStoryPlan,
  PortableCommand,
  ResolvedDesktopDriverOptions,
  SpecStoryPlan,
  StoryPlan,
  StoryPlanStep,
  StoryStepProperty,
  StoryStepTarget,
  StoryTestManifest,
  StoryTestManifestEntry,
} from './types.ts';
