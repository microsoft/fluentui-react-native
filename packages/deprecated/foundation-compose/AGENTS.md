# Legacy v0 component authoring

These instructions apply to `packages/deprecated/foundation-compose` and to work
on components that use `@uifabricshared/foundation-compose`. They describe the
legacy/v0 framework only. Do not use this pattern for a new component unless the
task explicitly requires v0 compatibility.

## Recognizing v0 code

Treat code as v0 when several of these are present:

- imports from `@uifabricshared/foundation-compose`,
  `foundation-composable`, `foundation-settings`, or `foundation-tokens`;
- a descriptor such as `IButtonType` with `props`, `tokens`, `slotProps`,
  optional `state`, and optional `statics`;
- `compose<IButtonType>({...})`, `IUseComposeStyling<IButtonType>`,
  `ISlots<...>`, and `mergeSettings(...)`;
- settings shaped as `{ tokens, root, ...slots, _overrides, _precedence }`;
- an implementation under `deprecated/` or `legacy/`, or an old un-suffixed
  export beside a newer `V1` export.

Representative implementations are
`packages/components/Button/src/deprecated/Button.tsx`,
`packages/components/Checkbox/src/deprecated/Checkbox.tsx`,
`packages/components/Link/src/legacy/Link.tsx`,
`packages/components/Persona/src/Persona.tsx`, and
`packages/components/Stack/src/Stack.tsx`.

## Framework model and public API

`compose` combines the lower-level composable, themed-settings, settings, and
token systems. Its phases are:

1. resolve and cache layered `settings`;
2. resolve token props into cached slot props/styles through `styles`;
3. run `usePrepareProps` for hooks, state, refs, and instance-specific props;
4. call the hook-free `render` function with prepared `Slots`.

The package publicly exports `compose`, `initializeStyling`, and the compose
option/return/settings/styling and type-extraction types listed in `src/index.ts`.
The returned component exposes `__composable`, `.compose(options)`, and
`.customize(...settings)`. Prefer the strongly typed component methods:

- `.compose(...)` replaces or augments behavior, slots, styles, settings, or
  render without adding a React wrapper. Settings are appended to the base
  settings. See
  `packages/components/Button/src/deprecated/PrimaryButton/PrimaryButton.ts`.
- `.customize(...)` only appends old-style settings entries. Its input retains
  `tokens`, `_overrides`, `_precedence`, and slot-prop keys; it is not the newer
  flat token customization format.
- `statics` attaches subcomponents, as in `Stack.Item`.

The exported two-argument `compose(options, base)` form is the underlying API;
use `Base.compose(options)` when the base is already a typed composed component.
`initializeStyling` is framework infrastructure that `compose` installs
automatically, not a routine component authors normally call.

## Component shape

Define a shared descriptor type and keep slot names aligned:

```ts
interface IExampleType {
  props: IExampleProps;
  tokens: IExampleTokens;
  slotProps: IExampleSlotProps; // must contain root
  state: IExampleState;
}

export const Example = compose<IExampleType>({
  displayName: exampleName,
  settings,
  usePrepareProps,
  render,
  slots: { root: View, content: Text },
  styles: { root: [backgroundColorTokens], content: [textTokens] },
});
```

Typical files are `<Component>.types.ts`, `<Component>.settings.ts`,
`<Component>.tokens*.ts`, `<Component>.tsx`, `index.ts`, and colocated Jest
tests/snapshots. Preserve existing public I-prefixed types, deprecated exports,
display names, prop names, and v0/v1 aliases.

For a one-slot component, `compose` supplies default preparation and rendering:
it applies styling and user props to `root`. See
`packages/components/Text/src/deprecated/Text.tsx` and
`packages/components/Stack/src/StackItem/StackItem.tsx`. Multiple slots require
an explicit `render`. Once custom `usePrepareProps` is supplied, it must put the
public/native props on the appropriate slot; the framework does not do that
automatically.

## Slots and rendering

- `slotProps` is a named props collection with a required `root`.
- Define each slot as a component/string or as `{ slotType, filter }`. Use
  existing filters such as `filterViewProps`, `filterTextProps`, and
  `filterImageProps` so component-only/token props do not reach native views.
- Merge prepared props with styling, normally
  `mergeSettings(useStyling(userProps, lookup), { root: rootProps, ... })`.
  Later entries win, including merged styles and class names.
- Render prepared slots as `<Slots.root>` / `<Slots.content>`. Their prepared
  props are already captured; pass only additional render-time props in JSX.
- Children are removed before preparation and supplied to `render` as
  `...children`. Decide explicitly where they belong, as Button, Link, and Stack
  do. Conditional slot rendering is safe because all hooks already ran.
- Put `/** @jsxImportSource @fluentui-react-native/framework-base */` first in
  files that render callable `Slots` with JSX. This pragma supports the legacy
  slot runtime; it does not make the component a modern framework-base pattern.

## Settings, tokens, and styling

- Type settings as `IComposeSettings<IExampleType>`. Entries are layered in
  array order and may be a settings object, a theme settings name string, or a
  `(theme) => settings` function. Keep objects/functions stable and never mutate
  cached settings.
- Use `_precedence` to define state application order and `_overrides` for
  state-specific settings; nested overrides are supported. Settings names such
  as `buttonName` load theme-provided component settings.
- `useStyling(props)` uses props as the default override mask. For derived
  interaction state, pass an override lookup function or mask, as in legacy
  Button, Checkbox, and Link.
- Declare token-to-slot processing in `styles`. Reuse operation sets such as
  `backgroundColorTokens`, `borderTokens`, `foregroundColorTokens`, and
  `textTokens`; use `{ source, target, lookup }` for mappings/theme lookup.
- For component-specific calculations, use `styleFunction` and list every token
  key that affects the result. See
  `packages/components/Persona/src/Persona.tokens.root.ts`,
  `packages/components/Persona/src/Persona.tokens.texts.ts`, and
  `packages/components/Stack/src/Stack.tokens.ts`. Accurate key lists are
  required for memoization.
- When a slot is itself composed and supports a token, token processing can
  forward that token to the child instead of producing a parent-owned style.
  Preserve compatible child token contracts when replacing composed slots.
- Put theme/default/state values in settings and token-derived style in
  `styles`. Put highly variable values such as text, accessibility props,
  handlers, sources, and refs into `usePrepareProps` slot props.

## State, hooks, and refs

- `usePrepareProps` and `useStyling` are hook phases: call them on every render
  and never conditionally. Hooks, context, controlled/uncontrolled state, and
  interaction hooks belong in `usePrepareProps`.
- Return `{ slotProps, state }`; `state` is simply the typed payload for
  `render`, not necessarily React state. Keep `render` hook-free.
- Preserve the v0 `componentRef` API where present. Convert it to the native root
  `ref` during preparation, commonly with `useViewCommandFocus`; type ref-bearing
  roots with `React.PropsWithRef<...>`. For imperative native APIs, use an
  internal native ref plus `useImperativeHandle`, as in
  `packages/components/Callout/src/Callout.tsx`.
- Do not introduce `forwardRef` or a new public `ref` convention into an
  established v0 API without an explicit migration requirement.

## Platform-specific implementations

Use normal React Native resolution for `.android.tsx`, `.macos.tsx`,
`.windows.tsx`, and `.win32.tsx`, and for platform settings files. Keep the same
public descriptor/props across variants while allowing different native slots
and preparation logic. Examples include deprecated Button on Android and
RadioButton on macOS/Win32. Keep imports from platform React Native forks inside
their platform files, per the repository root guidance.

## Legacy boundaries

- Do not rewrite v0 code to `@fluentui-react-native/composition`, modern
  `@fluentui-react-native/framework`, or framework-base
  `phasedComponent`/`directComponent`/`useSlot` patterns as part of maintenance.
- Do not apply v1 slot types, flat state tokens, `useTokens`, or the new
  `.customize({ token: value, state: {...} })` shape to v0 code.
- Do not “simplify” away `mergeSettings`, the settings name entry, override
  lookup, prop filters, token key lists, or the split prepare/render phases;
  each participates in compatibility, composition, or caching.
- Prefer surgical fixes. Migration to v1 is a separate task and must account for
  documented prop, token, slot, and export differences such as
  `packages/components/Button/MIGRATION.md`.

## Validation

Run the smallest package-scoped checks covering the change:

```bash
yarn workspace @uifabricshared/foundation-compose build
yarn workspace @uifabricshared/foundation-compose lint
```

For behavior changes, also test/build the owning consumer package, for example:

```bash
yarn workspace @fluentui-react-native/button test
yarn workspace @fluentui-react-native/button build
```

Update existing snapshots only after reviewing the rendered slot tree. Changes
to settings override/merge semantics or token processing also require the
`foundation-settings` or `foundation-tokens` unit tests respectively.
