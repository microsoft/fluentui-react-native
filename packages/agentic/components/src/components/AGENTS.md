# Higher-order component authoring

These instructions apply to `packages/agentic/components/src/components` and its descendants.

Higher-order components own design-token styling, interaction state, layout, and component-level accessibility. Use
`components/button` as the canonical implementation. Theme-aware foundational
components without a Flex catalog entry remain in this directory and use the
validator-backed `local-foundation` contract source.

Draft and review a source-backed React Native contract through the
[agentic component contract authoring skill](../../../../../.github/skills/agentic-component-contract-authoring/SKILL.md)
before implementation. Select only the adapters represented by the evidence,
resolve authority per requirement, and use the pinned
`flex-components:<name>` reference only when a `flex-skill` source applies.
Ratify the local contract after types, tests, stories, and platform evidence
agree; never mechanically promote a web-authored spec.

For package-wide dependency or extraction reviews, also read
[`packages/agentic/components/src/AGENTS.md`](../AGENTS.md) and the
[agentic-component-optimization](../../../../../.github/skills/agentic-component-optimization/SKILL.md) skill. A focused
component edit should stay within this file and the relevant `SPEC.md`; do not turn every small change into a whole-package
audit.

## Required structure

- `<component>.types.ts`: public slots, props, named variants, private state slots, and resolved state.
- `<component>.styles.ts`: structural styles and module-scoped state or theme style factories.
- `use<Component>.ts`: defaults, derived state, accessibility, interaction hooks, theme state, and slot construction.
- `use<Component>Styles.ts`: cached style selection, ordered style arrays, and `attachSlotProps`.
- `render<Component>.tsx`: pure slot ordering and conditional structure.
- `<component>.ts`: state -> styles -> render assembly and `displayName`.

## Non-negotiable invariants

- Keep render-only slots private to state.
- Exclude native `children` or other props the component owns.
- Preserve the distinction between omitted and false controlled values.
- Classify every stateful axis before wiring it. A self-driving control, where the interaction _is_ the state change,
  supports both directions through the `<state>` / `default<State>` / `on<State>Change` triple and `useToggleState`
  from `framework-base`. Externally driven selection exposes only `selected`, never changes it, and reports the
  interaction through `onPress`.
- Use Flex tokens first and document genuine token gaps.
- Create style factories only at module scope and cache theme-only styles.
- Declare state precedence explicitly; disabled wins over pressed, which wins over hovered.
- Apply user styles after component styles.
- Include the declared native root's `ref` in public props with `PropsWithRefOf<typeof Root>`. React 19.1.4 supplies
  `ref` as a prop, so pass it through the state hook to the root slot without `forwardRef`. If the component also needs
  an internal root ref, compose the refs through the slot render path rather than replacing the consumer ref.
- Follow the [focus visual policy](#focus-visual-policy): create the optional `FocusRing` in the state hook,
  apply native settings only to the actual focus target, and style the custom ring in the styling phase.
  Do not introduce component-specific modality trackers or `outline*` focus styling.
- Keep render functions free of hooks, token reads, style creation, and slot mutation.
- Export the resolved state type and the state, style-application, and render stages from the package root under
  component-qualified unstable names so another component can reuse the pipeline.
- Test public accessibility, every finite variant axis, interactions, optional slots, user forwarding, and constrained
  layout.
- Test both paths of a self-driving axis, and test that an externally driven `selected` does not change on press.
- Keep a self-driving controlled prop out of story `args`, and keep an identity-changing axis out of story controls.
- Author desktop automation under `parameters.desktopDriver` as static data
  satisfying `DesktopStoryTests`. Use one stable `testID` per interacted
  element, declare capabilities, and assert public native semantics rather than
  implementation structure.

## Focus visual policy

This is the shared native adaptation for Accordion, Button, Card, Checkbox, ListItem, ListboxItem, MenuItem,
Radio, Switch, Tab, and Tag. Activation, selection, navigation, and accessibility semantics are unchanged.

- Call `useFocusVisuals` in `use<Component>_unstable` after resolving pressable focus. Pass `focused: false`
  for disabled or noninteractive targets. Store its `FocusRing` as a private optional slot in component state.
- The hook returns `{ FocusRing, enableFocusRing }`. Native rings default to enabled on Windows and macOS,
  and disabled on Win32 and other platforms. `useSystemFocusRing` explicitly overrides that default.
- `alwaysVisible` means visible whenever focused, including pointer focus, not visible while unfocused.
  It takes precedence over the system-ring preference and uses the custom ring with `enableFocusRing: false`;
  native focus-visibility heuristics cannot guarantee this override.
- The custom slot reads the current modality through `useRootSettings` on each render. It shows only when
  focused and the modality is keyboard, unless `alwaysVisible` is set. Programmatic focus follows the last
  root modality. There is no local pointer tracker, subscription, or rerender caused solely by root settings.
- The optional slot is absent on the native path. On the custom path, configured ring Views remain mounted
  across focus/blur and visibility changes only opacity. Static cards and section headers render no ring.
- Apply `enableFocusRing` only to Accordion's header, Card's interactive overlay, or the other components'
  pressable roots. Switch's label container and track are not focus targets.
- Keep `ThemeState` out of the behavioral hook. `applyFocusRingStyles` centrally binds the dual-ring
  colors (`strokeFocusInner`/`strokeFocusOuter`) and widths (`thin`/`thick`) in a cached theme stylesheet.
  Component style hooks supply the resolved radius. Functional component borders are separate.
- Render `{state.FocusRing && <state.FocusRing />}` inside the actual focus target. Do not add public
  component slots for this render-only structure. The standalone `FocusVisual` primitive and its exports remain.
- Synthetic `focused` overrides do not move native focus. Input's focus underlines and other non-ring styles
  are unchanged. Native ring appearance still depends on the renderer; no pixel-parity guarantee is made.

The Windows native path requires React Native Windows 0.81.35 or newer. This re-review of the accepted
`native-system-focus-visuals` adaptation follows the requested root-modality contract without changing pinned
Flex source identities. The shared hook and component matrix cover platform defaults, overrides, modality,
focus/blur, ring geometry, and disabled/noninteractive targets. Scenes require a `ThemedRoot`.

## Focused references

- [Contract and source adaptation](../../../../../.github/skills/agentic-component-contract-authoring/SKILL.md)
- [Types and slots](../../../../../.github/skills/agentic-component-authoring/references/types-and-slots.md)
- [State and accessibility](../../../../../.github/skills/agentic-component-authoring/references/state-and-accessibility.md)
- [Styles and tokens](../../../../../.github/skills/agentic-component-authoring/references/styles-and-tokens.md)
- [Rendering and assembly](../../../../../.github/skills/agentic-component-authoring/references/rendering.md)
- [Tests and stories](../../../../../.github/skills/agentic-component-authoring/references/tests-and-stories.md)
