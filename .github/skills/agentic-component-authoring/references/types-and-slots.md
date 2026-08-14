# Types and slots

Use this reference when defining or changing a component's public API, slots, resolved state, native prop exposure, or
package exports. The canonical higher-order example is
[`button.types.ts`](../../../../packages/agentic-components/src/components/button/button.types.ts).

## Separate the public contract from render-only structure

Define public slots in `<component>.types.ts`:

- Use `Slot<typeof NativeComponent>` for the required root.
- Use `OptionalSlot<typeof Component>` for content, icons, indicators, or other optional elements.
- Document what causes an optional slot to render and whether shorthand children are accepted.
- Keep the slot surface small. A slot is public customization API, not merely an element in the render tree.

Button exposes `root`, `content`, `icon`, and `selectedIcon`. Its `contentContainer` and `contentHidden` slots support the
selected-label layout but remain in the private `ButtonStateSlots` type. Follow that split whenever measuring, overlay,
ghost, or structural slots are implementation details.

## Model variants explicitly

Use named string unions for finite axes:

```ts
export type ComponentAppearance = 'primary' | 'secondary';
export type ComponentSize = 'small' | 'medium' | 'large';
```

Collect state-bearing public props in `<Component>StateProps`. Optional public values become required in resolved state
after the state hook applies defaults. Preserve a meaningful distinction between omitted and false values when omission
enables behavior; Button uses `selected !== undefined` to distinguish an ordinary button from a toggle button.

## Expose native props deliberately

Do not blindly inherit every root prop when the component owns part of the native contract.

1. Start with the root native props.
2. Omit props the component controls, such as `children` or token-derived `style`.
3. Reintroduce a narrowed form only when consumers need it.

Button uses `Omit<PressableProps, 'children' | 'style'>` and adds `StyleProp<ViewStyle>` back explicitly. This prevents
native children from bypassing slot order while preserving a user style that can be applied after component styles.

Compose the final public props with:

```ts
export type MyComponentProps = MyComponentStateProps & ComponentProps<MyComponentSlots, ExposedRootProps>;
```

## Make resolved state complete

Build state from:

- `ComponentState<PublicAndPrivateSlots>`
- `Required<ComponentStateProps>` for defaulted axes
- theme state when the component reads tokens
- interaction state when the root is interactive
- derived booleans or values needed by styles and rendering
- preserved user values that must be applied at a later stage

Button state includes `ThemeState`, `PressableState`, `iconOnly`, `isToggleButton`, and `userStyle`. Avoid carrying raw
props that no later stage uses.

## Primitive contracts

Primitives should define the smallest slot-compatible acceptance contract. For mutually exclusive sources, use a union
with `never` on incompatible fields, as
[`IconProps`](../../../../packages/agentic-components/src/primitives/icon/icon.types.ts) does for image, font, and SVG
sources. Verify the primitive remains assignable to `SlotProp<typeof Primitive>` with a committed type test.

## Exports

Export each component and its composition pipeline explicitly from
[`src/index.ts`](../../../../packages/agentic-components/src/index.ts):

- the component and its public props, slots, variants, and resolved state type
- the state hook as `use<Component>_unstable`
- the style-application hook as `use<Component>Styles_unstable`
- the render helper as `render<Component>_unstable`

Name the source file `use<Component>Styles.ts` and the implementation `use<Component>Styles_unstable` so the local and
public composition APIs match without aliases. Never use wildcard exports. Do not export private state-only slots or
internal style definitions.

## Review checklist

- Every public slot is intentional and documented.
- Render-only slots are private to resolved state.
- Variant unions match the spec exactly.
- Omitted and false values retain distinct semantics where required.
- Root native props cannot bypass owned children or style ordering.
- Resolved state contains every defaulted and derived value needed downstream.
- Public component, state, style-application, render, and resolved-state exports are explicit and tree-shakeable.
