import type { DesktopWebdriverOptions } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';

export type DesktopStorybookWdioOptions = {
  clickMode?: DesktopWebdriverOptions['clickMode'];
  input?: DesktopInputLane;
  reporter?: 'spec' | 'tap' | 'dot';
  story?: string;
  tag?: string;
  test?: string;
  timeoutMs?: number;
};

export function resolveWdioOptions(
  options: DesktopStorybookWdioOptions = {},
): Readonly<Required<Pick<DesktopStorybookWdioOptions, 'timeoutMs' | 'reporter' | 'clickMode'>> & DesktopStorybookWdioOptions> {
  const { timeoutMs = 30_000, reporter = 'spec', clickMode = 'auto' } = options;
  const requestedInput = options.input ?? process.env.DESKTOP_INPUT;
  let input: DesktopInputLane | undefined;
  if (requestedInput !== undefined) {
    if (!isDesktopInputLane(requestedInput)) throw new TypeError('wdio.input must be accessible or physical.');
    input = requestedInput;
  }
  if (input && clickMode !== 'auto') {
    throw new TypeError('wdio.input cannot be combined with a click mode other than auto.');
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new TypeError('wdio.timeoutMs must be a positive 32-bit integer.');
  }
  if (!['spec', 'tap', 'dot'].includes(reporter)) {
    throw new TypeError('wdio.reporter must be spec, tap, or dot.');
  }
  if (!['auto', 'accessibility', 'physical'].includes(clickMode)) {
    throw new TypeError('wdio.clickMode must be auto, accessibility, or physical.');
  }
  for (const key of ['story', 'tag', 'test'] as const) {
    if (options[key] !== undefined && (typeof options[key] !== 'string' || !options[key].trim())) {
      throw new TypeError(`wdio.${key} must be a non-empty string.`);
    }
  }
  return Object.freeze({
    ...options,
    ...(input ? { input } : {}),
    timeoutMs,
    reporter,
    clickMode,
  });
}

function isDesktopInputLane(value: string): value is DesktopInputLane {
  return value === 'accessible' || value === 'physical';
}
