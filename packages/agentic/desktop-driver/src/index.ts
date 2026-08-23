/**
 * Public core surface for `@fluentui-react-native/desktop-driver`.
 *
 * A shared spec normally needs only `byTestId` and `story`; everything else here supports
 * tooling, custom runners, and the Storybook integration.
 */

export { byTestId, isPortableTestId, assertPortableTestId } from './selectors.ts';
export { story, type StoryHelper } from './story-helper.ts';
export type { DesktopBrowserCommands } from './core/session.ts';

export { DesktopCancelledError, DesktopDriverError, DesktopValidationError, type DesktopErrorKind } from './errors.ts';

export { DESKTOP_PROTOCOL_VERSION, STORY_PLAN_SCHEMA_VERSION } from './protocol/versions.ts';
export { PACKAGE_VERSION } from './package-version.ts';

export type {
  ArtifactManifest,
  DesktopAppState,
  DesktopAppTarget,
  DesktopBackendId,
  DesktopDriverHandle,
  DesktopDriverOptions,
  DesktopExitReason,
  DesktopFakeElement,
  DesktopFakeMutation,
  DesktopFakeScene,
  DesktopLifecycleEvent,
  DesktopLifecycleEventType,
  DesktopOwnedResource,
  DesktopOwnership,
  DesktopPlatform,
  DesktopPrerequisiteStatus,
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
