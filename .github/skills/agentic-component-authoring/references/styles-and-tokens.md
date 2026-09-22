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

The same failure applies to non-focus outlines, including an initially active Avatar activity ring. Reuse `FocusVisual`
as a persistent decorative border, with the component owning its meaning, tokens, and visibility. For an outward ring
with a gap, each absolute edge is `-(gap + strokeWidth)` so the border preserves the requested gap without changing
layout. Mount it with its border configured even when hidden; do not switch border width between zero and a nonzero value.

Keep the ring policy local to the higher-order component:

- choose single versus dual rings from the component specification
- resolve colors, widths, radius, and positioning from its tokens and variants
- place the visual inside the actual focus target
- keep functional component borders separate from focus feedback

## Native text and vertical alignment

Treat the component frame, the native text line box, and the glyph's visible ink as different measurements. `alignItems`
and `justifyContent` align Yoga boxes; they do not move a glyph inside a stretched Text or editor. A font's `fontSize`
is not its measured ascent plus descent. Platform font fallback can make the difference particularly visible on Win32.

- Use `Icon` for font glyphs. Its sized View centers an intrinsic, non-shrinking Text child. With a fully specified frame,
  the Text is absolute with no edge offsets so Yoga measures its natural height instead of clamping it to the frame.
  Without a complete frame, normal flow retains intrinsic dimensions. Do not put the icon's
  `height` or `lineHeight` on that Text, use a negative margin or transform to nudge one glyph, or depend on
  `textAlignVertical` as a cross-platform centering mechanism. Icon dimensions own scaling, just as they do for images
  and SVGs; dimensioned font icons do not independently follow text scaling.
- Retain typography line-height tokens for ordinary labels and paragraphs. Do not globally remove line height to fix
  one renderer, and do not replace a typography line height with a control's height or the font's em size.
- Centered initials follow the same intrinsic-metrics rule. Avatar owns all typography and uses native Text to avoid
  inheriting the themed Text component's body line height. It preserves token font sizes, native text scaling, and
  explicit caller line metrics, and uses an absolute child without edge offsets to avoid clamping in the smallest
  padded frame. Do not clip initials to an em square or assume `undefined` can clear merged defaults.
- For single-line `TextInput`, reset internal padding and let the native editor measure its font. Put spacing outside
  the editor with Yoga margins or a containing View; keep the control's token-derived minimum height separate.
  Input demonstrates this without adding another wrapper or changing the caller's final style precedence.
  Preserve the pointer target when moving spacing: Input's inaccessible, non-focusable contents row forwards activation
  to the editor through a ref composed by the slot render path. Test disabled behavior and caller ref forwarding too.
- Distinguish centered graphics from aligned text baselines. `CompoundItemLayout` centers arbitrary regions by default.
  A text-only row with different label/shortcut font sizes can use `alignItems: 'baseline'` on the root and inline
  content row. All participating regions must supply meaningful text baselines; do not impose that policy on images
  or action buttons.
- On Android, disable extra font padding for tightly sized decorative glyphs. That setting is not a desktop fix.
- Exercise small and large sizes, font and image/SVG icons, different text metrics, selection, and constrained wrapping.
  Check the running native output, not just flattened styles: a snapshot of the wrong Text height can pass indefinitely.

## Selected text without layout shift

When selected text changes weight:

- Render an inaccessible Semibold ghost that reserves width and height.
- Overlay a View that vertically centers the visible label at its own measured height. Do not stretch the visible Text
  itself with `absoluteFillObject`: smaller text will otherwise sit at the top of the reserved area on native renderers.
- Keep the ghost and container state-only.
- Apply the same wrapping constraints to both labels.

Use `LayoutStableText`, as Button and Tab do, rather than duplicating the ghost/overlay structure. The overlay must
preserve visible-text accessibility and input handling. Typography remains owned by the consuming component.

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
- Font frames and reserved labels center intrinsic text; editor spacing is external; text baselines are an explicit
  choice distinct from centering arbitrary slots.
