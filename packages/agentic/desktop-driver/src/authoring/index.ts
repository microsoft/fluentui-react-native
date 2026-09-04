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
  resolveDesktopStoryTests,
  validateDesktopStoryTests,
} from './storyTests.js';
export type {
  DesktopStoryCapability,
  DesktopStoryExpectation,
  DesktopStoryPlatform,
  DesktopStoryQuarantine,
  DesktopStorySelector,
  DesktopStoryState,
  DesktopStoryStep,
  DesktopStoryTest,
  DesktopStoryTestVariant,
  DesktopStoryTests,
} from './storyTests.js';
