import type { ComponentMetadata } from '@fluentui-react-native/concepts';

/**
 * `ButtonV1` from `@fluentui-react-native/button`. Built on the v1
 * composition framework and ships on every supported platform.
 *
 * `accent` is accepted at the prop surface but maps to `primary` on
 * every platform via `getPlatformSpecificAppearance`; `outline`
 * renders distinctly only on mobile and falls through to the default
 * elsewhere. Both are kept in `appearances` so the matrix records
 * what the prop accepts at the public surface.
 *
 * The `press`+`focused` combo is included because the win32 two-tone
 * focus border slot only appears when keyboard activation drives both
 * states simultaneously. Other combos were considered and rejected
 * (e.g. `disabled`+anything: disabled suppresses interaction events,
 * so combining produces no novel visual).
 */
export const buttonV1Metadata = {
  name: 'Button',
  importPath: '@fluentui-react-native/button',
  exportName: 'ButtonV1',
  framework: 'v1',
  platforms: ['ios', 'android', 'macos', 'win32', 'windows'],
  states: ['disabled', 'hover', 'press', 'focused'],
  stateCombos: [['press', 'focused']],
  appearances: ['primary', 'subtle', 'accent', 'outline'],
  sizes: ['small', 'medium', 'large'],
  shapes: ['rounded', 'circular', 'square'],
  baseProps: {
    children: 'Hi',
    testID: 'button-root',
  },
} as const satisfies ComponentMetadata;
