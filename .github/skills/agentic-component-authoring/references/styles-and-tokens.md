# Styles and tokens

Use this reference for `<component>.styles.ts`, `use<Component>Styles.ts`, token mapping, theme caching, state precedence, and
slot prop application. The canonical examples are
[`button.styles.ts`](../../../../packages/agentic/components/src/components/button/button.styles.ts) and
[`useButtonStyles.ts`](../../../../packages/agentic/components/src/components/button/useButtonStyles.ts).

## Resolve values from the correct token source

Consult
[`flex-token-map.yaml`](../../../../packages/agentic/design/src/tokens/mappings/flex-token-map.yaml) before choosing a
value.

- Read semantic colors from `useThemeState().tokens.color`.
- Read grouped categories from `tokens.borderRadius`, `tokens.spacing`, `tokens.strokeWidth`, `tokens.fontFamily`,
  `tokens.fontSize`, `tokens.fontWeight`, `tokens.lineHeight`, and `tokens.shadow`.
- Prefer Flex tokens for every mapped semantic value.
- Import named global tokens only when Flex has no equivalent, such as current Button icon dimensions or a true zero.
- Record a genuine token gap in the component spec. Do not replace it with a nearby token or numeric literal.
- For compatibility with an existing V1 component, derive cross-platform mappings from its Win32, macOS, or Windows
  implementation. Do not use iOS as the canonical value unless the change explicitly targets iOS.
- `useThemeState` projects a FURN Theme from context into Flex tokens and stores one symbol-keyed `ThemeState` on that
  Theme object. Consumers of the same Theme therefore share token and style-cache identity.

## Build styles in layers

Use four layers:

1. A module-scoped `StyleSheet` for structural values that do not depend on theme, props, or state.
2. Module-scoped state factories for theme-independent state selectors.
3. Module-scoped themed factories for token-derived styles.
4. Per-instance style arrays that select cached objects and place user styles last.

Never create a style factory inside a hook or render function.

Reuse the design package's `@fluentui-react-native/design/styling` submodule:

- [`getStateStyleFactory`](../../../../packages/agentic/design/src/styling/branchedStyle.ts) lazily flattens and caches
  one theme-independent state definition.
- [`getThemedStateStyleFactory`](../../../../packages/agentic/design/src/styling/branchedStyle.ts) resolves and caches
  one flattened definition per `ThemeState`.
- [`getThemedColorStyleFactory`](../../../../packages/agentic/design/src/styling/colorStyles.ts) converts semantic
  color keys and delegates its hierarchy and caching to `getThemedStateStyleFactory`.

These are the canonical Button mechanisms and cache plain resolved style objects in `state.themeStyles`. Do not wrap them
in another `StyleSheet.create` cache. Use
[`themedStyleSheetFactory`](../../../../packages/agentic/design/src/useThemeState.ts) only when a component genuinely
needs a complete theme-only `StyleSheet.create` result that is not represented by a branched state definition.

Every theme factory may depend only on `ThemeState` values such as tokens and high contrast. Props, interaction state,
and user styles must remain outside the cache so one component instance cannot leak into another.

## Declare state hierarchy and precedence

Represent related axes as ordered hierarchy levels. Each level contains mutually exclusive states in priority order.
Button colors use:

```ts
[['primary', 'secondary', 'outline', 'subtle'], ['selected'], ['disabled', 'pressed', 'hovered']];
```

This means appearance is the base branch, selected refines it, and interaction is the final refinement. Put interaction
states in `disabled`, `pressed`, `hovered` order so the first active state has the required priority.

Use `getThemedStateStyleFactory` for token-derived hierarchy definitions and `getStateStyleFactory` for
theme-independent definitions. Use `getThemedColorStyleFactory` for semantic background, border, and foreground colors;
it automatically resolves `tokens.color.hover` and `tokens.color.pressed` for inherited semantic keys.

An interaction may intentionally switch semantic keys. Button Subtle is transparent at rest but explicitly selects
`backgroundNeutralSubtle` inside hovered and pressed branches. Button Outline uses `strokeNeutralLoud`, whose hover and
pressed token values provide visible stroke feedback. Do not assume a token named `Transparent` will produce visible
interaction states; verify the resolved token maps.

Build the state source from resolved state without hiding precedence in conditionals. Button pushes appearance, selected,
disabled, pressed, and hovered values, then lets the declared hierarchy select the winner.

## Group related layout axes

Combine axes that produce one coherent style object. Button selects size, shape, and content layout from one root style
hierarchy:

```ts
[
  ['small', 'medium', 'large'],
  ['rounded', 'square', 'circle'],
  ['withContent', 'iconOnly'],
];
```

Use separate factories for independent concerns such as typography, focus, and content visibility. This keeps unrelated
state branches from multiplying into one large definition.

Destructure only the token groups needed by a factory:

```ts
({ borderRadius, spacing, strokeWidth }: FlexTokens) => ...
```

Validate token values when their generated type is wider than the React Native style property. Button validates its gap
token before assigning it to `ViewStyle['gap']`.

## Apply slot props in one stage

`use<Component>Styles.ts` should export `use<Component>Styles_unstable`, select styles, and call `attachSlotProps`; it
should not create factories. Export that hook directly from the package root under the same name.

Compose root styles in this order:

1. structural style
2. resolved layout or variant style
3. semantic colors
4. focus or other conditional styles
5. user style

Derive dependent slot props from the same resolved values. Button applies foreground color and size to both icon slots,
marks decorative icons inaccessible, and applies typography plus foreground color to content.

Preserve consumer slot behavior unless the component owns it. Button no longer forces `numberOfLines`; its content and
toggle container use `flexShrink` so constrained labels can wrap. A consumer can still request truncation through the
content slot.

## Keep focus visuals mounted

Agentic focusable components render `FocusVisual` inside the interactive slot. Configure its outer
ring and optional inner ring from the component's semantic focus tokens and resolved radius, but keep both configured
Views mounted at rest. `FocusVisual` changes only opacity when focus changes and owns accessibility and hit testing.

Do not apply React Native `outline*` props conditionally and do not enable the RNW native focus ring. RNW 0.81 Fabric
creates both through a late `BorderPrimitive`; on a background-filled target its owning-root bookkeeping can insert at
index 1 in an empty visual and fail-fast. A style helper alone is insufficient because the invariant is native View
lifetime.

Keep the ring policy local to the higher-order component:

- choose single versus dual rings from the component specification
- resolve colors, widths, radius, and positioning from its tokens and variants
- place the visual inside the actual focus target
- keep functional component borders separate from focus feedback

## Selected text without layout shift

When selected text changes weight:

- Render an inaccessible Semibold ghost that reserves width and height.
- Overlay the visible label.
- Keep the ghost and container state-only.
- Apply the same wrapping constraints to both labels.

Button uses theme-independent visibility selectors for the hidden and overlaid styles and token-derived typography for
the actual font metrics.

## Review checklist

- Every value comes from Flex or a documented token gap.
- Structural, themed, instance, and user styles are separated.
- Every factory is module-scoped and theme-safe.
- State hierarchy makes precedence explicit.
- Hover and pressed values are verified, not inferred from token names.
- Independent concerns use independent factories.
- User styles are last.
- Slot props share resolved color and size values consistently.
- Constrained text can wrap unless truncation is an explicit public choice.
