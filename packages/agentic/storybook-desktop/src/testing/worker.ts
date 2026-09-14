import fs from 'node:fs';
import { test } from 'node:test';

import { attachDesktopWebdriver, type DesktopWebdriverAttachment } from '@fluentui-react-native/desktop-driver/wdio';
import { expect } from 'expect-webdriverio';

import type { WdioStory } from './types.js';

export type WdioWorkerOptions = {
  attachment: DesktopWebdriverAttachment;
  resultPath: string;
  storyId: string;
  timeoutMs: number;
};

export function registerWdioStoryTest(options: WdioWorkerOptions, callback: NonNullable<WdioStory['wdio']>): void {
  test(options.storyId, { timeout: options.timeoutMs }, async (context) => {
    const desktop = await attachDesktopWebdriver(options.attachment);
    context.signal.throwIfAborted();
    let skipReason: string | undefined;
    await callback({
      browser: desktop.browser,
      desktop,
      expect,
      signal: context.signal,
      skip: (reason) => {
        if (!reason?.trim()) {
          throw new TypeError('Skipping a wdio story requires a reason.');
        }
        skipReason = reason;
        context.skip(reason);
      },
    });
    context.signal.throwIfAborted();
    fs.writeFileSync(options.resultPath, JSON.stringify(skipReason ? { status: 'skipped', skipReason } : { status: 'passed' }));
  });
}
