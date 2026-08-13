# v1 component framework

These instructions apply to `packages/framework/framework` and to components
authored with `@fluentui-react-native/framework`. They describe the repository's
v1 compose/compressible framework. Preserve this model when maintaining v1 code;
do not mix it with either legacy v0 or the newer framework-base component model.

## Recognizing v1 code

Treat a component as v1 when several of these are present:

- imports of `compose`, `compressible`, `UseSlots`, `UseStylingOptions`,
  `buildProps`, `buildUseTokens`, or `useFluentTheme` from
  `@fluentui-react-native/framework`;
- a descriptor such as `ButtonType` with `props`, `tokens`, and `slotProps`;
- `compose<ComponentType>({ slots, slotProps, tokens, states, useRender })`;
- a styling file whose tokens contain nested state layers such as `hovered`,
  `pressed`, `disabled`, size, appearance, or shape;
- a public `V1` export beside a legacy unsuffixed export, for example
  `ButtonV1`, `CheckboxV1`, `TextV1`, or `IconV1`.

Representative compose components are
`packages/components/Button/src/Button.tsx`,
`packages/components/Checkbox/src/Checkbox.tsx`,
`packages/components/Avatar/src/Avatar.tsx`, and
`packages/components/Menu/src/MenuItem/MenuItem.tsx`. Representative
compressible components are `packages/components/Text/src/Text.tsx`,
`packages/components/Divider/src/Divider.tsx`, and
`packages/components/TabList/src/Tab/Tab.tsx`.

Do not classify code by the JSX pragma alone. V0 and v1 components both use
`/** @jsxImportSource @fluentui-react-native/framework-base */` so callable slots
can render without extra wrappers.

## Framework boundaries

- **V0/legacy:** imports `@uifabricshared/foundation-compose` and uses
  `settings`, `styles`, `usePrepareProps`, `render`, `mergeSettings`,
  `_overrides`, and `_precedence`. Follow
  `packages/deprecated/foundation-compose/AGENTS.md`; do not apply those shapes
  to v1.
- **V1/this framework:** `compose` wraps
  `packages/framework/composition`, while styling and slots come from
  `use-styling`, `use-tokens`, and `use-slots`. Its component hook is
  `useRender`, its customization input is a flat token object, and its state
  layers are nested token objects.
- **Modern framework-base/agent-generation work:** `phasedComponent`, modern
  `directComponent`, `Slot<typeof View>`, `OptionalSlot`, `ComponentProps`, and
  public slot shorthand/`as` props are a different component-authoring model.
  Framework-base utilities such as `mergeProps`, `useSlot`, `directComponent`,
  and the JSX runtime may appear inside v1 implementations for compatibility;
  that does not convert the component to the new model.

Do not migrate between these frameworks during a maintenance change unless the
task explicitly requests a migration. In particular, v1 is built on the
compatibility `stagedComponent` path even though new framework-base components
must not add new staged components.

## Framework model and public API

`compose` injects the Fluent `Theme` integration into `composeFactory`. The
factory:

1. resolves tokens and token-derived props through `buildUseStyling`;
2. creates all callable slots through `buildUseSlots`;
3. wraps `useRender` in a staged component;
4. attaches `.customize(...)`, `.compose(...)`, `displayName`, `__options`, and
   any declared statics.

Use the `@fluentui-react-native/framework` entry point from components. Import
`composeFactory` directly from `@fluentui-react-native/composition` only when
working on the theme-agnostic lower-level factory.

- `.customize(...tokenSettings)` appends token layers. Inputs may be token
  objects, theme functions, or component names. Define customized components at
  module scope, not during render.
- `.compose(partialOptions)` deep-merges factory options and appends `tokens`.
  Use it to replace slots, slot props, state declarations, or `useRender`
  without adding a React wrapper. See the compose tests in Button and Checkbox.
- `buildUseTokens` and `buildUseStyling` are Fluent-theme-specialized wrappers
  around the lower-level packages. `useFluentTheme` returns the context theme or
  `defaultFluentTheme`.

The package also re-exports established token builders, memo/merge helpers,
slot helpers, and theme types. Check `src/index.ts` before adding another public
export; keep exports explicit.

## Compose component shape

Keep the descriptor, styling, state hook, and renderer aligned:

```tsx
interface ExampleType {
  props: ExampleProps;
  tokens: ExampleTokens;
  slotProps: ExampleSlotProps;
}

export const Example = compose<ExampleType>({
  displayName: exampleName,
  ...stylingSettings,
  slots: { root: Pressable, content: Text },
  useRender: (userProps, useSlots) => {
    const example = useExample(userProps);
    const Slots = useSlots(userProps, (layer) => example.state[layer] || userProps[layer]);

    return (final, ...children) => {
      const mergedProps = mergeProps(example.props, final);
      return (
        <Slots.root {...mergedProps}>
          <Slots.content>{children}</Slots.content>
        </Slots.root>
      );
    };
  },
});
```

`ComposeType` is available, but most current components use a named interface.
Only `props`, `slotProps`, `tokens`, and optional `statics` are extracted by the
factory. Extra descriptor fields such as `state` are documentation/type-sharing
conveniences, not factory-managed state.

Typical files are `<Component>.types.ts`, `<Component>Tokens.ts` plus platform
variants, `<Component>.styling.ts`, `use<Component>.ts`, `<Component>.tsx`,
`index.ts`, tests/snapshots, and migration/spec docs where applicable. Preserve
existing v0/v1 export aliases and package API compatibility.

## Slots and staged rendering

- Keep every key in `slots`, `slotProps`, and the descriptor's `slotProps`
  synchronized. Type ref-bearing roots with `React.PropsWithRef<...>`.
- Call `useSlots` once, unconditionally, in the hook stage. `buildUseSlots`
  creates every slot with `useSlot`; conditional slot rendering belongs in the
  returned hook-free render stage.
- Styled slot props are captured when slots are created. Props supplied in JSX
  are merged on top. Merge prepared component props with final composition props
  using `mergeProps`; do not mutate either object.
- Decide explicitly where children render. The traditional v1 continuation is
  `(finalProps, ...children) => JSX`. Some transitional components return a
  hook-free `directComponent(({ children, ...finalProps }) => JSX)` instead.
  Never call hooks in either final render form.
- `filters` are supported by `use-slots`, but current v1 consumers rarely use
  them. Preserve an existing filter contract; do not copy v0
  `{ slotType, filter }` slot descriptors into v1.
- Platform-only slots may be declared conditionally, as Button does for
  `rippleContainer` and `focusInnerBorder`. Create slots consistently and render
  them only on the matching platform.

Use `compressible` for the established lighter-weight v1 pattern when a component
manually resolves tokens and creates slots rather than needing the full compose
options object. `compressible` also wraps a staged component and adds
`.customize(...)`; it does not expose `.compose(...)`.

In a compressible component:

1. call hooks, `useFluentTheme`, and `useTokens(theme)` in the outer function;
2. use `applyTokenLayers`, `applyPropsToTokens`, or `patchTokens` when state/props
   must alter resolved tokens;
3. build all slots with `useSlot`;
4. return a hook-free continuation and merge final props there.

Follow existing examples rather than calling `stagedComponent` directly.

## Tokens, styling, and state precedence

- Define defaults as stable objects or theme functions, then place the component
  name last, for example
  `tokens: [defaultButtonTokens, defaultButtonFontTokens, buttonName]`. The name
  loads `theme.components[name]` overrides.
- Model visual states as nested values of the same token type. List them in
  `states` in application order; later active layers win.
- Supply a lookup to `useSlots` when state is derived from interaction hooks,
  enum props, context, content, or platform defaults. Button's `buttonLookup`
  and Avatar's `avatarLookup` are representative.
- `tokensThatAreAlsoProps` is opt-in. After state layers are applied, listed
  props override those token values. Prefer a precise key list over `'all'` to
  retain caching and avoid leaking unrelated props into tokens.
- Build each slot's cached props with `buildProps`. List every token key read by
  the builder, including helper key arrays such as `fontStyles.keys`,
  `borderStyles.keys`, and `layoutStyles.keys`.
- Treat resolved tokens and cached slot props as immutable. Use `patchTokens`
  rather than mutation for instance-dependent values in compressible components.
- Keep theme/default/state values in token files, token-to-native mapping in
  styling files, and volatile handlers/accessibility/data/ref props in the
  component state hook or render preparation.

## Hooks, state, and refs

Put controlled/uncontrolled state, context, interaction hooks, callbacks,
accessibility normalization, and ref preparation in `use<Component>` or the
outer `useRender`/compressible stage. Return a conventional `{ props, state }`
object when the component has derived behavior; `state` is component-owned data
used by the token lookup and final render.

Preserve established `componentRef` APIs. Convert `componentRef` to the native
root `ref` during preparation, commonly with `useViewCommandFocus`, as Button,
Checkbox, and MenuItem do. Do not introduce `forwardRef` or replace
`componentRef` with a public `ref` as an incidental change.

Hooks must run in a stable order before the continuation is returned. Never call
hooks inside state lookups, `buildProps` callbacks, conditional slot branches,
or the final render stage.

## Platform-specific behavior

Use React Native platform resolution and keep the public props/type/export
contract consistent across `.android`, `.ios`, `.macos`, `.mobile`, `.windows`,
and `.win32` implementations. Platform variants may replace the root with a
native component and use a one-slot compose implementation; see
`packages/experimental/Checkbox/src/Checkbox.macos.tsx` and
`packages/experimental/Avatar/src/NativeAvatar.tsx`.

Keep platform defaults and token differences in platform token/styling files
when practical. Keep imports from React Native forks inside their platform files
and retain the repository's `Platform.OS === ('win32' as any)` convention.

## Testing and validation

Add or update the owning component's Jest tests and snapshots for rendering,
state layers, `.customize`, `.compose`, slot replacement, accessibility, and
platform behavior affected by a change. Review snapshot trees rather than
updating them blindly. The framework package's direct test covers compressible;
lower-level compose, slot, token, and styling behavior is tested in the
corresponding framework packages.

Run the smallest relevant package checks:

```bash
yarn workspace @fluentui-react-native/framework build
yarn workspace @fluentui-react-native/framework test
yarn workspace @fluentui-react-native/framework lint
```

For component changes, also build/test the owning package, for example:

```bash
yarn workspace @fluentui-react-native/button build
yarn workspace @fluentui-react-native/button test
```

Changes to factory, slot, token, or styling semantics also require the matching
`@fluentui-react-native/composition`, `use-slots`, `use-tokens`, or
`use-styling` package tests.
