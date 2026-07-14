/**
 * The classification of a single token value as it appears in a
 * default-tokens source file. Each kind carries enough information to
 * round-trip the value back to its source form:
 *
 * - `'theme'`: a property read off the theme parameter, captured as a
 *   dot-joined path under the theme root (`'colors.buttonBackground'`,
 *   `'typography.body1Strong'`). The path does NOT include the leading
 *   `'theme.'` — consumers prepend it when rendering.
 * - `'global'`: a property read off the `globalTokens` import from
 *   `@fluentui-react-native/theme-tokens`. Path is the dot-joined
 *   suffix (`'size60'`, `'stroke.width10'`, `'corner.radius40'`).
 * - `'constant'`: a literal value embedded directly in source. Covers
 *   numbers, strings, booleans, and `null`.
 * - `'expression'`: a binary arithmetic combination of other token
 *   sources, e.g. `globalTokens.size60 - globalTokens.stroke.width10`.
 *   The `op` and `operands` together let consumers resolve to a value
 *   or render the formula.
 */
export const TOKEN_SOURCE_KINDS = ['theme', 'global', 'constant', 'expression'] as const;

export type TokenSourceKind = (typeof TOKEN_SOURCE_KINDS)[number];

export type TokenSource =
  | { kind: 'theme'; path: string }
  | { kind: 'global'; path: string }
  | { kind: 'constant'; value: string | number | boolean | null }
  | { kind: 'expression'; op: '+' | '-' | '*' | '/'; operands: readonly TokenSource[] };

/**
 * Recursive tree mirroring the default-tokens source. Leaf entries are
 * `TokenSource`s; non-leaf entries are sub-`TokenLayer`s named for the
 * state, appearance, or size they override (e.g. `'hovered'`,
 * `'primary'`, `'medium'`, `'hasContent'`).
 *
 * Discrimination between leaf and branch happens at runtime via
 * `isTokenSource` — a value with a `kind` field in
 * `TOKEN_SOURCE_KINDS` is a leaf; anything else is a sub-layer.
 */
export interface TokenLayer {
  [key: string]: TokenSource | TokenLayer;
}

export function isTokenSource(value: unknown): value is TokenSource {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'kind' in value &&
    typeof (value as { kind: unknown }).kind === 'string' &&
    (TOKEN_SOURCE_KINDS as readonly string[]).includes((value as { kind: string }).kind)
  );
}
