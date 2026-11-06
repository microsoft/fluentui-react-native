import type { DesktopWebdriverOptions } from '@fluentui-react-native/desktop-driver/wdio';

export type DesktopStorybookWdioOptions = {
  clickMode?: DesktopWebdriverOptions['clickMode'];
  reporter?: 'spec' | 'tap' | 'dot';
  story?: string;
  tag?: string;
  test?: string;
  testCases?: readonly { storyId: string; testName: string }[];
  inputMode?: 'accessibility' | 'physical';
  timeoutMs?: number;
};

export function resolveWdioOptions(
  options: DesktopStorybookWdioOptions = {},
): Readonly<Required<Pick<DesktopStorybookWdioOptions, 'timeoutMs' | 'reporter' | 'clickMode'>> & DesktopStorybookWdioOptions> {
  const { timeoutMs = 30_000, reporter = 'spec', clickMode = 'auto' } = options;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new TypeError('wdio.timeoutMs must be a positive 32-bit integer.');
  }
  if (!['spec', 'tap', 'dot'].includes(reporter)) {
    throw new TypeError('wdio.reporter must be spec, tap, or dot.');
  }
  if (!['auto', 'accessibility', 'physical'].includes(clickMode)) {
    throw new TypeError('wdio.clickMode must be auto, accessibility, or physical.');
  }
  if (options.inputMode !== undefined && !['accessibility', 'physical'].includes(options.inputMode)) {
    throw new TypeError('wdio.inputMode must be accessibility or physical.');
  }
  for (const key of ['story', 'tag', 'test'] as const) {
    if (options[key] !== undefined && (typeof options[key] !== 'string' || !options[key].trim())) {
      throw new TypeError(`wdio.${key} must be a non-empty string.`);
    }
  }
  const testCases = options.testCases?.map(({ storyId, testName }) => {
    if (typeof storyId !== 'string' || !storyId.trim() || typeof testName !== 'string' || !testName.trim()) {
      throw new TypeError('wdio.testCases must contain non-empty storyId and testName strings.');
    }
    return Object.freeze({ storyId, testName });
  });
  if (testCases && (!testCases.length || new Set(testCases.map((entry) => JSON.stringify(entry))).size !== testCases.length)) {
    throw new TypeError('wdio.testCases must be non-empty and contain unique callback identities.');
  }
  return Object.freeze({
    ...options,
    ...(testCases ? { testCases: Object.freeze(testCases) } : {}),
    timeoutMs,
    reporter,
    clickMode,
  });
}
