/**
 * The `story` helper used by shared specs.
 *
 * It delegates to the `browser.desktop` commands the service attached to the active session, so a
 * shared spec can select a story without importing anything platform-specific and without
 * knowing how the Storybook channel is reached.
 */

import { DesktopDriverError } from './errors.ts';
import type { DesktopBrowserCommands } from './wdio/commands.ts';

export interface StoryHelper {
  /** Selects a story and waits for it to finish rendering. */
  select(storyId: string): Promise<void>;
  /** Waits until the given story is the rendered one. */
  waitFor(storyId: string): Promise<void>;
}

function desktopCommands(): DesktopBrowserCommands {
  const browser = (globalThis as { browser?: { desktop?: DesktopBrowserCommands } }).browser;
  if (!browser?.desktop) {
    throw new DesktopDriverError(
      'No desktop session is active. Register the desktop service in your WebdriverIO config, or use the commands on your own `browser` instance.',
      { kind: 'configuration' },
    );
  }
  return browser.desktop;
}

export const story: StoryHelper = {
  select: (storyId: string) => desktopCommands().selectStory(storyId),
  waitFor: (storyId: string) => desktopCommands().waitForStory(storyId),
};
