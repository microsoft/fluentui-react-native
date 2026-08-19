/**
 * WebdriverIO integration surface.
 *
 * The config factory, the service, the standalone host lifecycle, and the inline plan runner.
 * Element lookup, interaction, waits, screenshots, and source stay on standard WebdriverIO.
 *
 * Importing this subpath also declares `browser.desktop` on the global WebdriverIO `Browser`.
 */

import './augmentation.ts';

export { createDesktopWdioConfig, assertSharedSpecs } from './config-factory.ts';
export type { DesktopSessionStrategy, DesktopWdioConfigOptions } from './config-factory.ts';
export { DesktopDriverService, DESKTOP_ENDPOINT_ENV, startDesktopDriver, summarize } from './service.ts';
export type { PublishedEndpoint } from './service.ts';
export { buildCapabilities, describeAttachResolution } from './capability-map.ts';
export { attachDesktopCommands, createDesktopCommands } from './commands.ts';
export type { DesktopBrowserCommands, DesktopBrowserLike, DesktopCommandContext, DesktopElementLike } from './commands.ts';
export { runInlineStoryPlan } from './story-plan-runner.ts';
export type { StoryPlanRunContext } from './story-plan-runner.ts';
