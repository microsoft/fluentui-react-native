---
name: accordion
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Accordion

## Scope

Accordion is a disclosure component with one pressable header and one body region. It owns expanded state, header semantics, chevron presentation, and body visibility; its consumer supplies title, leading icon, and body content. It does not coordinate sibling accordions, impose a body schema, or animate expansion.

## Public contract

`layout` defaults to `chevronStart`; `size` is currently always `small`. Expansion is self-driving: `defaultExpanded` initializes uncontrolled state, `expanded` makes the value controlled, and `onExpandedChange` receives the requested next value in either mode. `focused` overrides resolved focus for an instance, but does not bypass root modality or force native focus or its system ring. The root accepts the owned `ViewProps` surface, including `style`, while the component owns its accessibility and focus behavior.

`root` is required. `title` and `leadingIcon` are optional public slots but render by default as “Section title” and a selected-circle icon; pass `null` to omit either. `bodyContent` is optional. The rendered root contains the header, then the body. Header children begin with optional `FocusRing`, followed by chevron, leading icon, and title for `chevronStart`; `chevronEnd` orders leading icon, title, then chevron. The body always exists and renders `bodyContent` or a text placeholder.

The resolved state retains the controlled/uncontrolled expansion result, pressable hover/press/focus state, layout, size, theme state, and user root style. User root style follows the structural root style. Header colors give pressed state priority over hovered state.

### Requirements

- **ACC-001:** Resolve the documented defaults and implement controlled and uncontrolled expansion without mutating a controlled value.
- **ACC-002:** Render the public slots, default slot content, body fallback, and layout-specific header order.
- **ACC-003:** Apply theme-token header, title, body, chevron, and visibility styling, and follow the [shared focus visual policy](../AGENTS.md#focus-visual-policy) on the header.
- **ACC-004:** Expose a labeled button header with expanded state and an accessibility relationship to the body; hide collapsed body descendants.
- **ACC-005:** Keep grouping policy, body contents, and motion outside the component contract.

## Focus visuals

The state hook uses `useFocusVisuals` to create a private optional `FocusRing`.
Windows and macOS request the system ring by default, without a custom subtree.
Win32 and other platforms use the custom ring, visible only while focused and
the scene's current input modality is keyboard. Programmatic focus follows the
last root modality. Disabled and noninteractive targets never show custom feedback.

The composition hook supports an explicit `useSystemFocusRing` override.
`alwaysVisible` selects the custom path and bypasses modality while focused;
it does not make an unfocused target visible or move native focus. Custom rings
stay mounted across focus/blur. `applyFocusRingStyles` supplies shared theme
colors and widths; component style hooks preserve their resolved radius.
These hook options do not add new component props. Scenes require `ThemedRoot`.

## Platform behavior

On Windows and macOS, the header is a React Native `Pressable` with button role. Its native keyboard and pointer activation request expansion; `Enter` and `Space` are handled by the platform pressable behavior. The header exposes `accessibilityState.expanded`, its `accessibilityControls` target is the generated body identifier, and caller-provided accessibility state is retained.

The body remains mounted. Collapsing it sets height to zero, hides overflow, removes padding, and hides descendants from assistive technology; expanding restores visibility. There is no group-level arrow navigation, focus transfer, or timed rotation/height animation.

## Divergences from Flex

- `native-system-focus-visuals` — **accepted.** Apply the [shared native adaptation](../AGENTS.md#focus-visual-policy).

- `accordion-chevron-end-rotation` — **accepted.** Flex design evidence gives the trailing chevron a down-to-up caret sequence. FURN uses the same chevron source in both layouts and rotates it right-to-down as expansion changes. Changing that sequence requires an implementation and visual-contract review.

## Conformance

| Requirement | Evidence                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------ |
| ACC-001     | `accordion.types.ts`, `useAccordion.ts`, `accordion.test.tsx`, `accordion.stories.tsx`     |
| ACC-002     | `useAccordion.ts`, `renderAccordion.tsx`, `accordion.test.tsx`, `accordion.types.test.tsx` |
| ACC-003     | `useAccordion.ts`, `accordion.styles.ts`, `useAccordionStyles.ts`, `accordion.test.tsx`    |
| ACC-004     | `useAccordion.ts`, `useAccordionStyles.ts`, `accordion.test.tsx`                           |
| ACC-005     | `accordion.types.ts`, `useAccordion.ts`, `accordion.stories.tsx`                           |
