import type { DesktopBrowserLike } from '../core/session.ts';
import { runInlineStoryPlan } from './story-plan-runner.ts';

describe('story plan execution prerequisites', () => {
  it('fails clearly when the desktop command augmentation is missing', async () => {
    const browser = {
      sessionId: 'session',
      $: jest.fn(),
      execute: jest.fn(),
      getPageSource: jest.fn(),
      takeScreenshot: jest.fn(),
      addCommand: jest.fn(),
    } as unknown as DesktopBrowserLike;

    await expect(runInlineStoryPlan({ kind: 'inline', id: 'missing-augmentation', steps: [] }, { browser })).rejects.toMatchObject({
      kind: 'capability',
      message: expect.stringContaining('command augmentation'),
    });
  });
});
