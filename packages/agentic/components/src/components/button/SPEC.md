---
name: button
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Button

## Scope

Button presents a single action through a React Native `Pressable`. It supports
text, an icon, or both on Windows and macOS. Use [ToggleButton](../toggle-button/SPEC.md)
to change a persistent boolean option. Use MenuButton to open a command menu.

## Public contract

### Props and defaults

| Prop         | Type                                        | Default     | Contract                                                    |
| ------------ | ------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `appearance` | `primary \| secondary \| outline \| subtle` | `secondary` | Selects the visual emphasis.                                |
| `size`       | `small \| medium \| large`                  | `medium`    | Selects typography, icon size, spacing, and rounded radius. |
| `shape`      | `rounded \| circular`                       | `rounded`   | Controls the root corner radius independently of layout.    |
| `disabled`   | `boolean`                                   | `false`     | Disables activation and removes the root from focus.        |

The root also exposes owned `PressableProps`, except children and styles that
the component resolves itself. A user `style` is applied after token-derived
root styles.

### Slots and anatomy

The render order is the optional `FocusRing`, the icon when positioned
before, content, and the icon when positioned after.

| Slot           | Required | Contract                                                        |
| -------------- | -------- | --------------------------------------------------------------- |
| `root`         | yes      | A `Pressable` that owns action semantics and interaction state. |
| `content`      | no       | A `Text` slot. It may wrap when the root width is constrained.  |
| `leadingIcon`  | no       | Decorative icon before the label or centered when icon-only.    |
| `trailingIcon` | no       | Decorative icon after the label; rendered only with content.    |

An icon-only button has a leading icon and no content. It requires an
action-oriented accessible name.

`tooltip?: string` requests a native desktop tip on the same Pressable
([TIP-007](../tooltip/SPEC.md#public-contract)). It does not supply that name or synthesize accessible help.

### Requirements

- **BTN-001:** Resolve documented defaults and preserve supported native root
  props.
- **BTN-002:** Render only supplied optional slots in the documented order.
  Labels wrap when constrained; trailing icons are omitted without content.
- **BTN-003:** Resolve slot visuals from the component token companion, then
  theme component-token layers, then caller visuals. Disabled, pressed,
  hovered, and rest form one visual axis in that priority order. Outline uses
  the subtle stroke; Subtle uses the interactive transparent fill with an
  explicit Fluent fallback to visible neutral feedback.
- **BTN-004:** Expose button semantics and a native name from plain content
  unless the caller supplies naming, merge caller accessibility state, warn
  for an unnamed icon-only button, and hide decorative icons.
- **BTN-005:** Use minimum outer heights 24/32/40 and icon frames 16/20/20
  in size order. Subtract the resolved stroke from the token inset so the
  border does not inflate the layout. Circular is always explicit.
- **BTN-006:** Follow the [shared focus visual policy](../../../references/higher-order-components.md#focus-visual-policy)
  on the root: default to native rings on Windows/macOS and root-modality-aware
  custom rings on Win32, retaining the same dual-ring geometry.

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

Windows and macOS use React Native press, hover, and focus events. `Enter` and
`Space` activation are supplied by the native `Pressable` button behavior.
Disabled buttons are not focusable.

Button adds no component-owned motion.

## Divergences from Flex

`native-system-focus-visuals` is an **accepted** [shared native adaptation](../../../references/higher-order-components.md#focus-visual-policy).

| ID                        | Disposition | React Native contract                           | Follow-up |
| ------------------------- | ----------- | ----------------------------------------------- | --------- |
| `button-selection-axis`   | Resolved    | ToggleButton owns persistent selection.         |
| `button-single-icon-slot` | Resolved    | Leading and trailing icons are independent.     |
| `button-square-shape`     | Resolved    | Only rounded and circular shapes are available. |

## Conformance

| Requirement | Evidence                                                                        |
| ----------- | ------------------------------------------------------------------------------- |
| BTN-001     | `button.types.ts`, `useButton.ts`, `button.test.tsx`                            |
| BTN-002     | `renderButton.tsx`, `button.test.tsx`, `button.stories.tsx`                     |
| BTN-003     | `spec/tokens.json`, `button.styles.ts`, `useButtonStyles.ts`, `button.test.tsx` |
| BTN-004     | `useButton.ts`, `useButtonStyles.ts`, `button.test.tsx`, `button.stories.tsx`   |
| BTN-005     | `spec/tokens.json`, `button.styles.ts`, `button.test.tsx`, `button.stories.tsx` |
| BTN-006     | `useButton.ts`, `useButtonStyles.ts`, `renderButton.tsx`, `button.test.tsx`     |
