export type {
  DesktopArtifact,
  DesktopRunStatus,
  DesktopStepStatus,
  DesktopStoryRunResult,
  DesktopStoryStepResult,
  DesktopStoryTestResult,
  DesktopTestStatus,
} from './results.js';
export {
  defineDesktopStoryTests,
  desktopBy,
  desktopStoryCapabilities,
  desktopStoryPlatforms,
  validateDesktopStoryTests,
} from './storyTests.js';
export {
  accessibleLaneMaskedFeatures,
  desktopInputLanes,
  desktopRequirements,
  matchesDesktopPlatforms,
  matchesDesktopScope,
  mergeDesktopCaseOptions,
  resolveDesktopInput,
  resolveDesktopScopeDomains,
  resolveDesktopScopeValues,
  unmaskedAccessibleFeatures,
  validateDesktopCaseOptions,
  validateDesktopGroupOptions,
} from './input.js';
export type {
  AccessibleLaneMaskedFeature,
  DesktopCaseOptions,
  DesktopInput,
  DesktopInputLane,
  DesktopPlatforms,
  DesktopRequirement,
  DesktopScopeDomains,
  DesktopScopeValues,
  ResolvedDesktopCaseOptions,
} from './input.js';
export { decideDesktopCase, missingDesktopRequirements, resolveDesktopClickMode } from './selection.js';
export type {
  DesktopCaseClickMode,
  DesktopCaseDecision,
  DesktopCaseTarget,
  DesktopDeclaredGap,
  DesktopExclusionReason,
} from './selection.js';
export type {
  DesktopStoryCapability,
  DesktopStoryExpectation,
  DesktopStoryPlatform,
  DesktopStorySelector,
  DesktopStoryState,
  DesktopStoryStep,
  DesktopStoryTest,
  DesktopStoryTests,
} from './storyTests.js';
