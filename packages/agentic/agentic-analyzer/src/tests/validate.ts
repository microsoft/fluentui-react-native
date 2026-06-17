import { defaultFluentTheme } from '@fluentui-react-native/default-theme';
import type { Theme } from '@fluentui-react-native/theme-types';

import { createSentinelTheme } from '../sentinel/createSentinelTheme.ts';
import { deepMerge, resolveSemantic } from '../sentinel/resolveSemantic.ts';

/**
 * A token-settings argument: a function that derives a (partial) token tree from
 * a theme, a literal (partial) token object, or a `string` (a named token-set
 * reference, which carries no resolvable values and is skipped at runtime).
 *
 * This mirrors the v1 `TokenSettings<T, Theme> = string | T | ((theme) => T)`
 * shape used by component token functions such as `defaultButtonColorTokens`,
 * without taking a dependency on `@fluentui-react-native/use-styling`, so those
 * token functions are assignable to it directly.
 */
export type TokenFunction<T = any> = string | ((theme: Theme) => Partial<T>) | Partial<T>;

/**
 * Options for {@link resolveTokensForTheme}.
 */
export interface ResolveTokensOptions {
  /**
   * Base theme to sentinelize. Defaults to the repo's real default Fluent theme
   * (`defaultFluentTheme` from `@fluentui-react-native/default-theme`).
   */
  theme?: Theme;
  /**
   * Optional platform hint. Reserved for future per-platform theme selection;
   * currently unused.
   */
  platform?: string;
}

/**
 * Resolve token functions against a SENTINEL theme and map the resolved leaves
 * back to the semantic theme slot that fed them.
 *
 * Pipeline:
 * 1. Resolve a base `Theme` (`options.theme` or the repo default).
 * 2. Build a sentinel theme: every `theme.colors.*` leaf becomes a unique hex,
 *    with a reverse map of `sentinel -> "colors.<slot>"`.
 * 3. Evaluate each token argument against the sentinel theme (functions are
 *    called; objects are used as-is) and deep-merge the results in argument
 *    order (later overrides earlier).
 * 4. Walk the merged tree and replace any leaf equal to a sentinel value with
 *    its semantic name. All other leaves are left unchanged.
 *
 * The returned value is a plain, JSON-serializable object suitable for
 * snapshotting — e.g. `backgroundColor: "colors.buttonBackground"` instead of a
 * resolved hex, pinning which theme slot feeds each token.
 *
 * Values sourced from `globalTokens.*` (static numbers/literals) resolve to
 * their real values and are intentionally left unchanged in this pass.
 * TODO(agentic-analyzer PLAN phase 3): sentinelize `globalTokens.*` via jest
 * module mocking so those leaves also map to semantic names.
 */
export function resolveTokensForTheme(options: ResolveTokensOptions, ...tokenFunctions: TokenFunction[]): Record<string, unknown> {
  const base = options.theme ?? defaultFluentTheme;
  const { theme, reverseMap } = createSentinelTheme(base);

  const merged: Record<string, unknown> = {};
  for (const tokenFn of tokenFunctions) {
    const resolved = typeof tokenFn === 'function' ? tokenFn(theme) : tokenFn;
    if (resolved && typeof resolved === 'object') {
      deepMerge(merged, resolved as Record<string, unknown>);
    }
  }

  return resolveSemantic(merged, reverseMap) as Record<string, unknown>;
}
