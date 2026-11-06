import { makeDesktopStorybookConfig } from './makeDesktopStorybookConfig.js';
import { resolveWdioOptions } from './wdio.js';

describe('Storybook-owned wdio configuration', () => {
  test('provides defaults and snapshots caller settings', () => {
    expect(resolveWdioOptions()).toEqual({ timeoutMs: 30_000, reporter: 'spec', clickMode: 'auto' });
    const wdio = { timeoutMs: 2000, story: 'components-button--*', tag: 'native' };
    const config = makeDesktopStorybookConfig({ wdio });
    wdio.timeoutMs = 1;
    expect(config.wdio).toEqual({
      timeoutMs: 2000,
      story: 'components-button--*',
      tag: 'native',
      reporter: 'spec',
      clickMode: 'auto',
    });
  });

  test.each([0, -1, NaN, Infinity, 1.5, 2_147_483_648])('rejects invalid timeout %s', (timeoutMs) => {
    expect(() => makeDesktopStorybookConfig({ wdio: { timeoutMs } })).toThrow('wdio.timeoutMs');
  });

  test('rejects empty filters', () => {
    expect(() => resolveWdioOptions({ story: '' })).toThrow('wdio.story');
    expect(() => resolveWdioOptions({ tag: ' ' })).toThrow('wdio.tag');
  });

  test('resolves an explicit input lane and rejects conflicting click configuration', () => {
    const previous = process.env.DESKTOP_INPUT;
    delete process.env.DESKTOP_INPUT;
    try {
      expect(resolveWdioOptions({ input: 'accessible' })).toMatchObject({ input: 'accessible', clickMode: 'auto' });
      expect(() => resolveWdioOptions({ input: 'physical', clickMode: 'physical' })).toThrow('cannot be combined with a click mode');
      process.env.DESKTOP_INPUT = 'physical';
      expect(resolveWdioOptions().input).toBe('physical');
      expect(resolveWdioOptions({ input: 'accessible' }).input).toBe('accessible');
      expect(() => resolveWdioOptions({ clickMode: 'physical' })).toThrow('cannot be combined');
    } finally {
      if (previous === undefined) delete process.env.DESKTOP_INPUT;
      else process.env.DESKTOP_INPUT = previous;
    }
  });
});
