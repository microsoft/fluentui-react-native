/**
 * Storybook integration surface.
 *
 * Story selection, static manifest generation, generated-spec emission, and the loopback test
 * service. Storybook dependencies never reach the neutral core or the WebdriverIO integration.
 */

export { StoryController } from './controller.ts';
export type { StoryControllerOptions, StoryIndexEntry } from './controller.ts';
export { digestEntries, findStoryFiles, generateStoryTestManifest, resolveLinkedSpec } from './manifest.ts';
export type { GenerateManifestOptions } from './manifest.ts';
export { emitGeneratedStorySpec, verifyLinkedSpecTags } from './generated-spec.ts';
export type { EmitGeneratedSpecOptions } from './generated-spec.ts';
export { sanitizeStoryPart, storyGrep, storyNameFromExport, storyTag, toStoryId } from './story-id.ts';
export { DesktopTestService, secretsMatch } from './test-service.ts';
export type { DesktopRunExecutor, DesktopRunRequest, DesktopTestServiceOptions } from './test-service.ts';
