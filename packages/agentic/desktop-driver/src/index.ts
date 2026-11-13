export {
  createDesktopDriverClient,
  DesktopDriverClient,
  DesktopElementClient,
  DesktopSessionClient,
} from './client/DesktopDriverClient.js';
export type { DesktopDriverClientOptions } from './client/DesktopDriverClient.js';
export { connectDesktopAgent, DesktopAgent } from './agent/DesktopAgent.js';
export type {
  DesktopAgentCheckResult,
  DesktopAgentDescribeOptions,
  DesktopAgentElement,
  DesktopAgentOptions,
  DesktopAgentStory,
} from './agent/DesktopAgent.js';
export { ArtifactManager } from './artifacts/ArtifactManager.js';
export { createDesktopDriverCommand, runDesktopDriverCli } from './cli/createDesktopDriverCommand.js';
export type { CreateDesktopDriverCommandOptions } from './cli/createDesktopDriverCommand.js';
export type {
  DesktopArtifact,
  DesktopRunStatus,
  DesktopStepStatus,
  DesktopStoryRunResult,
  DesktopStoryStepResult,
  DesktopStoryTestResult,
  DesktopTestStatus,
} from './authoring/results.js';
export {
  defineDesktopStoryTests,
  desktopBy,
  desktopStoryCapabilities,
  desktopStoryPlatforms,
  validateDesktopStoryTests,
} from './authoring/storyTests.js';
export {
  accessibleLaneMaskedFeatures,
  compareDesktopInputReceipts,
  desktopInputMechanisms,
  desktopInputModeAllows,
  desktopInputModes,
  desktopInputLanes,
  desktopRequirements,
  describeUndeclaredDesktopInput,
  matchesDesktopPlatforms,
  matchesDesktopScope,
  mergeDesktopCaseOptions,
  resolveDesktopInput,
  resolveDesktopScopeDomains,
  resolveDesktopScopeValues,
  subtractDesktopInputReceipts,
  unmaskedAccessibleFeatures,
  validateDesktopCaseOptions,
  validateDesktopGroupOptions,
  validateDesktopInputReceipts,
  validateDesktopSessionInput,
} from './authoring/input.js';
export type {
  AccessibleLaneMaskedFeature,
  DesktopCaseOptions,
  DesktopInput,
  DesktopInputComparison,
  DesktopInputLane,
  DesktopInputMechanism,
  DesktopInputMode,
  DesktopInputReceipts,
  DesktopPlatforms,
  DesktopRequirement,
  DesktopScopeDomains,
  DesktopScopeValues,
  DesktopSessionInput,
  ResolvedDesktopCaseOptions,
} from './authoring/input.js';
export { decideDesktopCase, missingDesktopRequirements, resolveDesktopClickMode } from './authoring/selection.js';
export type {
  DesktopCaseClickMode,
  DesktopCaseDecision,
  DesktopCaseTarget,
  DesktopDeclaredGap,
  DesktopExclusionReason,
} from './authoring/selection.js';
export type {
  DesktopStoryCapability,
  DesktopStoryExpectation,
  DesktopStoryPlatform,
  DesktopStorySelector,
  DesktopStoryState,
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
  DesktopTreeNode,
  DesktopWindow,
  DesktopWindowEvent,
  DesktopWindowEventLog,
  NativeElementScope,
  NativeElementSnapshot,
  NativeImage,
  NativeAction,
  NativeActionOrigin,
  NativeActionSequence,
  NativeSearchRoot,
  NativeSelector,
  Rect,
  SupportedValue,
} from './host/types.js';
export { FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES, NativeDesktopHost, NativeHostProcess } from './hosts/native/index.js';
export type {
  NativeDesktopHostOptions,
  NativeDisabledInputFeature,
  NativeHostProcessOptions,
  NativeHostRequestResult,
} from './hosts/native/index.js';
export {
  buildNativeDesktopDriver,
  FURN_DESKTOP_DRIVER_BUILD_POLICY,
  FURN_DESKTOP_DRIVER_CACHE_ROOT,
  FURN_DESKTOP_DRIVER_HELPER_PATH,
  FURN_DESKTOP_DRIVER_INSTALL_ROOT,
  FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY,
  nativeDriverWireProtocol,
  NativeDriverError,
  resolveNativeDesktopDriver,
  verifyNativeDriverArtifact,
} from './native/index.js';
export type {
  NativeApplicationIdentity,
  NativeDesktopApplicationDescriptor,
  NativeDriverArchitecture,
  NativeDriverArtifact,
  NativeDriverArtifactOrigin,
  NativeDriverBuildOptions,
  NativeDriverBuildPolicy,
  NativeDriverConfiguration,
  NativeDriverProvider,
  NativeDriverResolveOptions,
  NativeDriverSigning,
  NativeDriverWireProtocol,
  NativeHostEventMessage,
  NativeHostHello,
  NativeHostJsonMessage,
} from './native/index.js';
export { webElementIdentifier } from './protocol/constants.js';
export { HostStaleError, HostUnsupportedError, HostWebDriverError, WebDriverError } from './protocol/errors.js';
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
export type {
  ApplicationIncarnation,
  ApplicationState,
  DesktopDriverServer,
  DesktopDriverServerOptions,
  DesktopSession,
  ElementRecord,
  ProbeApplication,
  QuarantineRecord,
  RecoverTargetRequest,
  RecoverTargetResult,
  RecoveryEvidence,
} from './server/index.js';
export type {
  DesktopStoryManifest,
  DesktopStoryManifestEntry,
  StoryOrchestrator,
  StoryReadyResult,
  StorySelectionRequest,
} from './storybook.js';
export {
  assertDesktopExpectation,
  DesktopAssertionError,
  findDesktopElement,
  findDesktopElements,
  runDesktopStoryTests,
  selectDesktopStoryTests,
} from './runner/StoryTestRunner.js';
export type { DesktopStoryTestRunnerOptions, DesktopStoryTestSelection } from './runner/StoryTestRunner.js';
export { connectDesktopWebdriver, DesktopWebdriverSession } from './wdio/DesktopWebdriver.js';
export type { DesktopWebdriverOptions, DesktopWebdriverRunOptions } from './wdio/DesktopWebdriver.js';
