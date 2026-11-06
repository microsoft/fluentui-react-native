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

  test('accepts explicit input lanes and rejects unknown modes', () => {
    expect(resolveWdioOptions({ inputMode: 'physical' }).inputMode).toBe('physical');
    // @ts-expect-error Input modes are intentionally a closed set.
    expect(() => resolveWdioOptions({ inputMode: 'automatic' })).toThrow('wdio.inputMode');
  });

  test('snapshots exact callback identities and rejects empty or duplicate selections', () => {
    const testCases = [{ storyId: 'button--default', testName: 'activation' }];
    const settings = resolveWdioOptions({ testCases });
    testCases[0].testName = 'changed';
    expect(settings.testCases).toEqual([{ storyId: 'button--default', testName: 'activation' }]);
    expect(() => resolveWdioOptions({ testCases: [] })).toThrow('wdio.testCases');
    expect(() => resolveWdioOptions({ testCases: [testCases[0], testCases[0]] })).toThrow('wdio.testCases');
    expect(() => resolveWdioOptions({ testCases: [{ storyId: '', testName: 'activation' }] })).toThrow('wdio.testCases');
  });
});
