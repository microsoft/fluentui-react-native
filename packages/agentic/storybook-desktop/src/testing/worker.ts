import fs from 'node:fs';
import { test } from 'node:test';

import { attachDesktopWebdriver, type DesktopWebdriverAttachment } from '@fluentui-react-native/desktop-driver/wdio';
import { expect } from 'expect-webdriverio';
import type { DesktopEndpoint } from '@fluentui-react-native/desktop-driver';

import type { WdioStoryTest } from './types.js';
import { formatDesktopStorybookError, writeDesktopStorybookFailure } from '../../config/diagnostics.cjs';

export type WdioWorkerOptions = {
  attachment: DesktopWebdriverAttachment;
  resultPath: string;
  storyId: string;
  timeoutMs: number;
  platform: DesktopEndpoint;
  testName?: string;
};

export function registerWdioStoryTest(options: WdioWorkerOptions, callback: WdioStoryTest): void {
  const name = options.testName === undefined ? options.storyId : `${options.storyId} / ${options.testName}`;
  test(name, { timeout: options.timeoutMs }, async (context) => {
    let recorded = false;
    const recordFailure = (error: unknown) => {
      const diagnostic = formatDesktopStorybookError(error);
      try {
        fs.writeFileSync(options.resultPath, JSON.stringify({ status: 'failed', error: diagnostic }));
        recorded = true;
      } catch (writeError) {
        writeDesktopStorybookFailure(`wdio "${name}"`, error);
        throw new AggregateError([error, writeError], 'Could not persist the worker failure diagnostic.');
      }
    };
    context.after(() => {
      if (!recorded && context.signal.aborted) {
        recordFailure(context.signal.reason);
      }
    });
    try {
      const desktop = await attachDesktopWebdriver(options.attachment);
      if (!['macos', 'windows', 'win32'].includes(options.platform) || desktop.session.capabilities['furn:endpoint'] !== options.platform) {
        throw new Error('The wdio worker platform does not match the attached desktop endpoint.');
      }
      context.signal.throwIfAborted();
      let skipReason: string | undefined;
      await callback({
        browser: desktop.browser,
        desktop,
        expect,
        platform: options.platform,
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
      recorded = true;
    } catch (error) {
      recordFailure(error);
      throw error;
    }
  });
}
