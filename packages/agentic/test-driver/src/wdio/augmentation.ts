/**
 * WebdriverIO type augmentation.
 *
 * Declares `browser.desktop` on the global WebdriverIO `Browser` interface so a shared spec gets
 * type checking and completion without importing anything platform-specific. The package owns its
 * WebdriverIO version, while the global namespace remains the custom-command augmentation point.
 */

import type { DesktopBrowserCommands } from './commands.ts';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- the WebdriverIO custom-command augmentation point
  namespace WebdriverIO {
    interface Browser {
      /** Portable desktop lifecycle, capability, Storybook, and artifact commands. */
      desktop: DesktopBrowserCommands;
    }
  }
}

export {};
