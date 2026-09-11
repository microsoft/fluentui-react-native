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
- Follow the [focus visual policy](#focus-visual-policy): request native focus visuals on all platforms
  through the package-private policy, on the actual focus target only. Retain the mounted `FocusVisual`
  fallback and its public exports. Do not introduce component-specific switches or `outline*` focus styling.
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
Radio, Switch, Tab, and Tag. It changes focus rendering, not public props, activation, selection, navigation,
or accessibility semantics.

- `common/focusVisualPolicy.ts` owns the single evaluation switch
  `focusVisualPolicy.useSystemFocusVisuals`, defaulting to `true` on every platform. There is no platform
  gate. Set the switch to `false` and reload to compare the retained custom rings; this is not a public API
  or a per-instance option.
- `getNativeFocusVisualProps` returns `{ enableFocusRing: focusVisualPolicy.useSystemFocusVisuals }`
  on every platform. Apply it to the actual focus target: Accordion's header, Card's
  interactive overlay, and the other components' pressable roots. Switch's outer label container and track
  are not focus targets. Static cards, noninteractive section headers, and decorative children gain no
  focus stop or focus feedback.
- A shared wrapper around `createFocusVisualProps_unstable` suppresses custom-ring visibility while the
  system path is selected, on every platform. The custom `FocusVisual` and its border-bearing children remain
  eagerly mounted wherever they already render. Its tokens, geometry, style calculation, and public primitive
  exports are retained without a visual redesign.
- With the switch off, every platform receives `enableFocusRing={false}` and uses the existing custom
  visibility calculation. The default replaces previous component-specific suppression of native rings,
  including Button and Checkbox on non-Windows platforms.
- Native focus rendering and appearance, including keyboard versus pointer behavior, are delegated to the
  platform renderer. Enabling the prop does not guarantee a ring on a renderer that lacks support; the
  custom path is not automatically re-enabled on such platforms. Existing custom-ring token bindings,
  radii, and modality statements describe the retained path, not the system
  ring. A synthetic `focused` override, such as Accordion's preview prop, does not force native focus or
  force the OS to draw a ring. This adaptation makes no new modality or pixel-parity guarantees.
- Input's focus underlines and borders, and other state styling unrelated to `FocusVisual`, are unchanged.

The Windows native path requires React Native Windows 0.81.35 or newer. The accepted
`native-system-focus-visuals` divergence changes the local platform adaptation, not the pinned Flex sources.
The shared `common/focusVisualPolicy.test.tsx` matrix covers native props, retained ring mounts, focus/blur,
and fallback behavior for all eleven consumers. Colocated tests retain geometry, accessibility, and
disabled/noninteractive coverage. Native appearance and modality must still be evaluated in each renderer;
the policy does not assert pixel parity or fix unrelated input behavior.

## Focused references

- [Contract and source adaptation](../../../../../.github/skills/agentic-component-contract-authoring/SKILL.md)
- [Types and slots](../../../../../.github/skills/agentic-component-authoring/references/types-and-slots.md)
- [State and accessibility](../../../../../.github/skills/agentic-component-authoring/references/state-and-accessibility.md)
- [Styles and tokens](../../../../../.github/skills/agentic-component-authoring/references/styles-and-tokens.md)
- [Rendering and assembly](../../../../../.github/skills/agentic-component-authoring/references/rendering.md)
- [Tests and stories](../../../../../.github/skills/agentic-component-authoring/references/tests-and-stories.md)
