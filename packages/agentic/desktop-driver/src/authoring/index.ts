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
export { desktopRequirements, matchesDesktopPlatforms, resolveDesktopInput, validateDesktopCaseOptions } from './input.js';
export type {
  DesktopCaseOptions,
  DesktopInput,
  DesktopInputLane,
  DesktopPlatforms,
  DesktopRequirement,
  ResolvedDesktopCaseOptions,
} from './input.js';
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
