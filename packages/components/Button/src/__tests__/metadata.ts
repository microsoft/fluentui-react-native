import { resolveTokensForTheme } from '@fluentui-react-native/agentic-analyzer';

import { defaultButtonColorTokens } from '../ButtonColorTokens.ts';
import { defaultButtonFontTokens } from '../ButtonFontTokens.ts';
import { defaultButtonTokens } from '../ButtonTokens.ts';

/**
 * The v1 components in this repository.
 *
 * "v1" components are those that build on the modern composition framework —
 * i.e. they depend on `@fluentui-react-native/framework` (the `framework/framework`
 * package) rather than (only) the legacy `@uifabricshared/*` foundation packages.
 *
 * This list was derived by grepping every `package.json` under
 * `packages/components/*` and `packages/experimental/*` for a direct dependency
 * on `@fluentui-react-native/framework`. A component may also still depend on the
 * legacy `@uifabricshared/*` packages (Button does) and still be considered v1.
 */
export const v1Components = [
  '@fluentui-react-native/avatar',
  '@fluentui-react-native/badge',
  '@fluentui-react-native/button',
  '@fluentui-react-native/checkbox',
  '@fluentui-react-native/chip',
  '@fluentui-react-native/divider',
  '@fluentui-react-native/icon',
  '@fluentui-react-native/input',
  '@fluentui-react-native/link',
  '@fluentui-react-native/menu',
  '@fluentui-react-native/notification',
  '@fluentui-react-native/persona',
  '@fluentui-react-native/persona-coin',
  '@fluentui-react-native/radio-group',
  '@fluentui-react-native/separator',
  '@fluentui-react-native/stack',
  '@fluentui-react-native/switch',
  '@fluentui-react-native/tablist',
  '@fluentui-react-native/text',
  '@fluentui-react-native/experimental-activity-indicator',
  '@fluentui-react-native/experimental-appearance-additions',
  '@fluentui-react-native/experimental-avatar',
  '@fluentui-react-native/experimental-checkbox',
  '@fluentui-react-native/drawer',
  '@fluentui-react-native/dropdown',
  '@fluentui-react-native/experimental-expander',
  '@fluentui-react-native/experimental-menu-button',
  '@fluentui-react-native/overflow',
  '@fluentui-react-native/popover',
  '@fluentui-react-native/experimental-shadow',
  '@fluentui-react-native/experimental-shimmer',
  '@fluentui-react-native/spinner',
] as const;

export type V1Component = (typeof v1Components)[number];

/**
 * The common Button token functions, re-exported so that platform test files can
 * pin them (and individual subsets) via the analyzer. Jest's platform resolution
 * selects the matching `.<platform>.ts` variant per run, so these imports resolve
 * to the correct platform-specific tokens automatically.
 */
export { defaultButtonTokens, defaultButtonFontTokens, defaultButtonColorTokens };

/**
 * Resolve the full set of default Button tokens against a sentinel theme, mapping
 * every theme-color leaf back to its semantic slot name (e.g. `colors.buttonBackground`).
 *
 * The token functions already encode states (disabled/hovered/pressed/focused),
 * variants (primary/subtle) and sizes (small/medium/large), so a single snapshot
 * of the resolved object pins all of them.
 */
export function resolveButtonTokens(): Record<string, unknown> {
  return resolveTokensForTheme({}, defaultButtonTokens, defaultButtonFontTokens, defaultButtonColorTokens);
}

/**
 * Resolve just the Button color tokens, so the semantic theme-slot mapping is
 * clearly isolated in the snapshot.
 */
export function resolveButtonColorTokens(): Record<string, unknown> {
  return resolveTokensForTheme({}, defaultButtonColorTokens);
}

// TODO: rendered-style pinning ("styles with various states" from the folder PLAN)
// is a follow-up. It depends on the agentic-analyzer's component-render / style
// extraction helpers (renderWithTheme / getComputedStyles), which are not
// implemented yet. Once they land, add per-platform tests that render Button in
// each state and pin the computed styles here.
