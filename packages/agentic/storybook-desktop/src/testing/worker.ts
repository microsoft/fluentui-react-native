import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { attachDesktopWebdriver, type DesktopWebdriverAttachment } from '@fluentui-react-native/desktop-driver/wdio';
import { expect } from 'expect-webdriverio';
import type { DesktopEndpoint } from '@fluentui-react-native/desktop-driver';
import { createDesktopReportSession, DESKTOP_REPORT_CONTEXT } from '@fluentui-react-native/desktop-test/reporting';

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
    const report = process.env[DESKTOP_REPORT_CONTEXT]
      ? await createDesktopReportSession({ artifactsRoot: path.dirname(options.resultPath), kind: 'lifecycle' })
      : undefined;
    const controller = new AbortController();
    const signal = AbortSignal.any([context.signal, controller.signal]);
    report?.onStop?.(() => controller.abort(new Error('Owned story worker stop requested.')));
    let recorded = false;
    let failure: unknown;
    const recordFailure = (error: unknown) => {
      failure = error;
      const diagnostic = report?.reporter.redact(formatDesktopStorybookError(error)) ?? formatDesktopStorybookError(error);
      try {
        fs.writeFileSync(
          options.resultPath,
          JSON.stringify({ status: 'failed', error: diagnostic, failure: report?.reporter.failure(error, 'test') }),
          { mode: 0o600 },
        );
        recorded = true;
      } catch (writeError) {
        writeDesktopStorybookFailure(`wdio "${name}"`, error);
        throw new AggregateError([error, writeError], 'Could not persist the worker failure diagnostic.');
      }
    };
    context.after(async () => {
      try {
        if (!recorded && signal.aborted) recordFailure(signal.reason);
      } finally {
        await report?.close(failure);
      }
    });
    try {
      const desktop = await attachDesktopWebdriver(options.attachment);
      if (!['macos', 'windows', 'win32'].includes(options.platform) || desktop.session.capabilities['furn:endpoint'] !== options.platform) {
        throw new Error('The wdio worker platform does not match the attached desktop endpoint.');
      }
      signal.throwIfAborted();
      let skipReason: string | undefined;
      await callback({
        browser: desktop.browser,
        desktop,
        expect,
        platform: options.platform,
        signal,
        skip: (reason) => {
          if (!reason?.trim()) {
            throw new TypeError('Skipping a wdio story requires a reason.');
          }
          skipReason = reason;
          context.skip(reason);
        },
      });
      signal.throwIfAborted();
      fs.writeFileSync(options.resultPath, JSON.stringify(skipReason ? { status: 'skipped', skipReason } : { status: 'passed' }));
      recorded = true;
    } catch (error) {
      recordFailure(error);
      throw error;
    }
  });
}
