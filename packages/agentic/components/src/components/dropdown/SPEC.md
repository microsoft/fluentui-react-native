---
name: dropdown
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Dropdown

## Scope

Dropdown lets a user choose one value, or several, from a fixed set of
options. A field-styled trigger shows the current selection, or a placeholder,
beside a trailing chevron, and opens a popup list of ListboxItem options below
it. Single mode commits the chosen option and closes the list; multiple mode
toggles options and keeps the list open until it is dismissed.

The trigger reuses Input's chrome, and the list is presented through
native-core's Callout and FocusZone. Dropdown owns presence, selection, option
discovery, navigation inside the list, and focus return. ListboxItem keeps the
option anatomy and takes its option semantics from Dropdown's binding
(LBI-006).

Dropdown is not editable. It has no text entry, filtering, type-ahead,
clear-selection control, or tag display, and it never runs actions; use
MenuButton for actions.

## Public contract

### Props and defaults

| Prop                                         | Type                                   | Default                              | Contract                                                                                              |
| -------------------------------------------- | -------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `variant`                                    | `'outline' \| 'underline'`             | `outline`                            | Selects Input's outline or underline chrome.                                                          |
| `size`                                       | `'small' \| 'medium' \| 'large'`       | `medium`                             | Selects Input's metrics and typography, and sizes the leading icon and chevron 16, 20, and 24.        |
| `disabled`                                   | `boolean`                              | `false`                              | Disables the trigger. A disabled Dropdown never presents its list, even while `open` is true.         |
| `error`                                      | `boolean`                              | `false`                              | Selects Input's danger boundary and the primary chevron color.                                        |
| `multiselect`                                | `boolean`                              | `false`                              | Selects multiple mode.                                                                                |
| `selectedOptions` / `defaultSelectedOptions` | `readonly string[]`                    | uncontrolled, `[]`                   | The selected option values.                                                                           |
| `onSelectedOptionsChange`                    | `(selectedOptions, { value }) => void` | none                                 | Reports each user change and the option that caused it. Caller changes never call it.                 |
| `placeholder`                                | `string`                               | `'Select an option'`                 | Shown when no selected value matches an option.                                                       |
| `formatSelectedCount`                        | `(count: number) => string`            | `` (count) => `${count} selected` `` | The multiple-mode summary shown when the selected labels do not fit.                                  |
| `open` / `defaultOpen`                       | `boolean`                              | uncontrolled, `false`                | The requested presence of the list.                                                                   |
| `onOpenChange`                               | `(open, { reason }) => void`           | none                                 | Reports user changes with the `trigger`, `dismiss`, or `select` reason. Caller changes never call it. |
| `iconStart`                                  | Icon slot                              | absent                               | Optional leading icon.                                                                                |
| `trigger`                                    | Pressable props with `ref`             | `{}`                                 | Props for the trigger Pressable.                                                                      |
| `listbox`                                    | View props with `ref`                  | `{}`                                 | Props for the list surface.                                                                           |
| `children`                                   | React nodes                            | required                             | ListboxItem options, each with a unique string `value`.                                               |

The root is a View, and `ref`, `style`, and other View props apply to it.
As Input lifts naming and focus props to its editor, Dropdown lifts
`accessibilityLabel`, `accessibilityHint`, `accessibilityLabelledBy`,
`accessibilityState`, `accessible`, `focusable`, `testID`, `onFocus`,
`onBlur`, `onHoverIn`, `onHoverOut`, `onPressIn`, and `onPressOut` from the
root to the trigger. A value in `trigger` wins over a lifted value, except
that root accessibility state merges over trigger state; Dropdown then writes
its own expanded and disabled values.

The `trigger` reason covers a trigger press, an opening key, and the expand or
collapse accessibility action. The `dismiss` reason covers Escape, Tab,
outside pointer input, and other native dismissals. The `select` reason marks
a single-mode commit.

Each child element with a string `value` prop, directly or inside Fragments,
is an option and must render a ListboxItem with that value. Dropdown reads
values and labels from these elements, so the trigger can display a selection
while the list is closed. An option's label is its string `content`, the
string children of its `content` props, its `accessibilityLabel`, or its
value, in that order. Other children, such as section headers, render in
place and are not options.

Dropdown warns in development for a list item without a value, which stays a
standalone item; for a repeated value, where the first option wins; and for
more than one selected value in single mode, where only the first selected
value that matches an option counts. A selected value that matches no option
stays in the selection but is not displayed.

### Slots and anatomy

The root View contains the trigger and the popup host. The trigger contains
the optional leading icon, the value text, and the chevron, in that order,
under Input's focus indicator. The popup host takes no layout space. The list
surface it presents holds a scroll container and a focus zone around the
children.

| Slot        | Rendered when           | Contract                                                           |
| ----------- | ----------------------- | ------------------------------------------------------------------ |
| `root`      | always                  | Structural, inaccessible View with the caller `ref` and style.     |
| `trigger`   | always                  | The accessible combobox Pressable and the Dropdown's focus target. |
| `iconStart` | `iconStart` is supplied | Input's leading icon slot, inaccessible.                           |
| `listbox`   | the list is presented   | The list surface. Its `ref` is null while the list is closed.      |

The value text, chevron, focus indicator, popup host, scroll container, and
focus zone are private.

### Requirements

- **DRP-001:** Resolve the documented defaults on a structural, inaccessible
  root View that holds the trigger Pressable and the popup host, with the
  caller `ref` on the root and caller styles last. Lift the documented root
  props to the trigger, letting `trigger` values win and merging accessibility
  state, and warn in development when the trigger has neither
  `accessibilityLabel` nor `accessibilityLabelledBy`.
- **DRP-002:** Draw the trigger with Input's chrome for the resolved variant
  and size, with the state precedence disabled, error, focused, pressed,
  hovered, rest. The trigger counts as focused while it holds focus or the list
  is presented, and shows Input's style-specific focus indicator only under
  keyboard modality.
- **DRP-003:** Render the private chevron after the value at 16, 20, and 24
  for small, medium, and large, pointing down while closed and up while the
  list is presented. Color it disabled when disabled, primary in error or while
  the focus indicator shows, and secondary otherwise.
- **DRP-004:** Show the selected options' labels in option order, separated by
  commas, on one line with tail truncation, or the placeholder in Input's
  placeholder color when nothing displayable is selected. In multiple mode,
  show `formatSelectedCount` for the number of displayed options when the
  labels do not fit. The display follows every selection change, including
  while the list is open.
- **DRP-005:** Discover options as documented and own their selection through
  `selectedOptions`, `defaultSelectedOptions`, and `onSelectedOptionsChange`.
  Activating an enabled option in single mode commits it, reporting a change
  only when the selection differs, and closes the list with `select`. In
  multiple mode, activation toggles the option and keeps the list open. A
  controlled Dropdown displays only the selection it receives, and a
  single-mode commit closes the list either way. Issue the documented
  development warnings.
- **DRP-006:** Keep requested presence controllable in both directions with
  Popover's latch: a native dismissal reports `dismiss` and keeps the list
  closed while requested presence stays true, until it becomes false and then
  true or the trigger opens it again. A trigger press while the list is open
  closes it without reopening. A disabled Dropdown never presents its list, and
  disabling an open Dropdown closes it. Closed options are absent from the
  accessibility tree and tab order.
- **DRP-007:** A trigger press, Enter, Space, Down, Up, or the expand action
  opens the closed list and reports `trigger`. After native readiness, focus
  moves to the entry option: the enabled selected option in single mode, or in
  multiple mode the most recently toggled option that is still selected and
  enabled, else the first enabled selected option. Without an entry option,
  focus moves to the first enabled option, or the last for Up. A caller-driven
  open uses the same entry as Enter. When no option is enabled, the list
  surface takes focus. Confirm each focus request through its native outcome.
- **DRP-008:** While the list is open, Down and Up move focus between enabled
  options and stop at the ends; Home and End focus the first and last enabled
  options; and Enter, Space, or a pointer press activates the focused option
  (DRP-005). Hovering an enabled option focuses it while the list holds focus.
  Disabled options are never focus stops and refuse activation.
- **DRP-009:** A single-mode commit, Escape, Shift+Tab, and a caller close
  while the list holds focus close the list and return focus to the trigger;
  Escape never undoes multiple-mode toggles. Tab closes the list and moves
  focus to the next focusable view after the trigger through native-core
  continuation, except on Win32 (R1). Outside pointer input closes the list and
  returns focus to the trigger unless the input focused another control.
  Application deactivation and anchor loss close the list without moving focus.
- **DRP-010:** Place the list below the trigger, start-aligned and offset by
  the token gap, and rely on native placement to flip, mirror for
  right-to-left layout, and clamp to the work area. Resolve the surface fill,
  stroke, and radius from Popover's bindings with reduced padding. Make the
  surface at least as wide as the trigger and as wide as its widest option, cap
  the option area at a height of 320 with internal scrolling, keep the focused
  option scrolled into view, apply native elevation, and apply caller
  `listbox` styles last.
- **DRP-011:** Expose the trigger as a combobox with its name, the expanded
  state from actual presence, the disabled state, and a value that lists every
  selected label even while the count summary shows. Handle the expand and
  collapse actions. Expose the list surface with the `list` role, a name that
  defaults to the trigger's string label, and the multiselectable and required
  states. Expose each option as LBI-006 describes, with the documented
  outcomes for the select, add, and remove selection actions.
- **DRP-012:** Present through native-core's modern Callout and FocusZone on
  macOS (Paper and Fabric) and Windows Fabric, and through its Win32 Callout
  and FocusZone adapters on Office Win32. Other hosts throw a descriptive error
  on use. Do not export Dropdown publicly until it qualifies on all four
  desktop endpoints.

## Platform behavior

The list is a separate native popup window owned by the trigger's window.
Native light dismissal is authoritative; Dropdown then reconciles presence and
focus. The list uses Callout `tabNavigation: 'continue'`. On macOS and Windows
Fabric, Tab from the list closes it and focuses the view that follows the
trigger in the owner window's key-view order, and Shift+Tab closes it and
focuses the trigger.

Windows Fabric's FocusZone handles Up, Down, Home, and End natively. On macOS
the FocusZone handles Up and Down, and Dropdown handles Home and End through
the options' key events. The trigger handles the platform's expand and
collapse accessibility actions by setting the requested presence.

Office Win32 presents the list through native-core's Win32 Callout adapter
without initial focus, so Dropdown focuses the entry option itself. The host's
FocusZone handles Up and Down, and Dropdown handles Home and End. The adapter
brings Popover's host differences:

- The list sits flush against the trigger, because the host ignores the gap.
- The host window draws the surface fill and rounded corners.
- Tab and Shift+Tab close the list and focus the trigger, because the host
  cannot continue focus past the popup's owner (R1).
- The trigger declares the expand and collapse actions, because Win32 UI
  Automation exposes ExpandCollapse only for an element that declares them.

On macOS the list never requests a horizontal scroller and requests a vertical
scroller only while its options overflow, because Paper reserves the space of
legacy scrollers even while they are hidden. iOS and Android are unsupported.

## Divergences from Flex

| ID                                | Disposition | React Native contract                                                                                                                                                     | Follow-up                                                 |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `dropdown-real-option-focus`      | Accepted    | Options take real native focus, and the trigger keeps its focused chrome while the list is presented, because the renderers have no active-descendant transport (D09).    | Revisit if the renderers add active-descendant support.   |
| `dropdown-combobox-relationships` | Accepted    | Expanded state and value replace the has-popup, controls, and active-descendant relationships, which have no typed property; the list name defaults to the trigger label. | Adopt native relationships if the renderers add them.     |
| `dropdown-list-roles`             | Accepted    | The list and options use the `list` and `listitem` roles with selection state, which UI Automation maps to the Selection and SelectionItem patterns.                      | Adopt listbox and option roles if the renderers add them. |
| `dropdown-invalid-state`          | Accepted    | `error` changes only the visuals, because Pressable does not carry an invalid state on any renderer. Callers reference the error text from the hint.                      | Report invalid state when a renderer transports it.       |
| `dropdown-tab-exit`               | Accepted    | Shift+Tab from the list focuses the trigger rather than the view before it, and on Win32 Tab also focuses the trigger (R1).                                               | Continue past the trigger when native-core supports it.   |
| `dropdown-trigger-width`          | Accepted    | The trigger stretches to its container like Input rather than fitting its content; callers constrain the width with style.                                                | None.                                                     |
| `dropdown-chevron-glyph`          | Accepted    | The chevron uses the package's shared down and up chevron glyphs rather than the Fluent ChevronDown and ChevronUp assets.                                                 | Replace when the package adopts the Fluent icon font.     |
| `dropdown-native-elevation`       | Accepted    | The native popup window shadow provides elevation instead of drawing `shadow.low`, as for Popover.                                                                        | Revisit if native-core supports inset shadow geometry.    |
| `dropdown-win32-gap`              | Accepted    | On Win32 the list sits flush against the trigger, because the Office host's popup ignores the requested gap.                                                              | Pass the gap through when the host honors it.             |
| `dropdown-token-strip`            | Deferred    | Multiple mode shows comma-separated labels or the count summary; the optional tag-strip display is not offered.                                                           | Add with a reviewed Tag-based design.                     |
| `dropdown-motion`                 | Deferred    | Presentation, chevron, and trigger changes are instant, which equals the reduced-motion behavior.                                                                         | Revisit when Flex motion is final.                        |

## Conformance

The listed files exist for every requirement. macOS Fabric and Paper, Windows
Fabric, and the Win32 adapters qualify the native behavior in the Dropdown
stories.

| Requirement | Evidence                                                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| DRP-001     | `dropdown.types.ts`, `useDropdown.ts`, `dropdown.test.tsx`, `dropdown.types.test.ts`                                                                |
| DRP-002     | `dropdown.styles.ts`, `useDropdownStyles.ts`, `renderDropdown.tsx`, `dropdown.test.tsx`                                                             |
| DRP-003     | `useDropdown.ts`, `dropdown.styles.ts`, `renderDropdown.tsx`, `dropdown.test.tsx`                                                                   |
| DRP-004     | `dropdownOptions.ts`, `renderDropdown.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                             |
| DRP-005     | `dropdownOptions.ts`, `dropdownController.ts`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                          |
| DRP-006     | `dropdownController.ts`, `dropdownPopup.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                           |
| DRP-007     | `dropdownController.ts`, `dropdownPopup.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                           |
| DRP-008     | `dropdownPopup.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                                                    |
| DRP-009     | `dropdownController.ts`, `dropdownPopup.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                           |
| DRP-010     | `dropdown.styles.ts`, `dropdownPopup.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                              |
| DRP-011     | `useDropdown.ts`, `dropdownPopup.tsx`, `dropdown.test.tsx`, `dropdown.stories.tsx`                                                                  |
| DRP-012     | `dropdownNative.ts`, `dropdownNative.macos.ts`, `dropdownNative.windows.ts`, `dropdownNative.win32.ts`, `dropdown.test.tsx`, `dropdown.stories.tsx` |
