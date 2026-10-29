# ListboxItem accessibility

A standalone `listItem` root exposes the React Native `button` role. It merges caller
accessibility state with owned disabled and checked state; `checked` mirrors the
externally supplied selected value, including false and disabled selection.
This is the supported React Native representation of a persistently toggled
button, not the transient pointer-pressed state. Caller `aria-checked`,
`aria-disabled`, or `role` values cannot override those owned semantics.
Unrelated caller state such as `busy` is preserved. The root is accessible and focusable by
default unless disabled. Its visible content provides the accessible name
unless the caller supplies React Native naming props.

The standalone root declares `toggle` on Windows Fabric and `Toggle` on
Win32/macOS through the shared action resolver. This preserves the button role
and exposes toggle state through Windows UI Automation, retaining caller labels
and custom actions. On macOS, Toggle is a custom action, not a default AXPress
activation route. With the pinned renderer and desktop provider, the retained
AXButton role has no supported native `checked` read. Native role and
enabled/disabled assertions remain shared; Windows checked projection is
qualified separately. The unsupported macOS observation is reported explicitly,
not defaulted to false or replaced by rendered text.
The caller receives the original accessibility action through
`onAccessibilityAction` and owns any resulting selection change, just as it owns
selection changes after `onPress`. The component never synthesizes a press event.

A `sectionHeader` is a nonfocusable accessible View with the `header` role.
It does not expose an interactive option state. Icons, avatar, chevron,
checkmark, and the multiselect visual are inaccessible presentation, so the
root is announced once. Windows exposes the resolved root through UIA and
macOS through AX.

Consumers own the containing collection's name, position, selection
rules, and any focus restoration policy.

A bound option inside a Dropdown list (LBI-006) takes those from its list
instead. It has the `listitem` role with `selected` and `disabled` state, its
one-based position, and the option count, which Windows exposes as a ListItem
with the SelectionItem pattern. Its owned role, selected and disabled state
take precedence over caller `role`, `aria-selected`, and `aria-disabled`.
It declares the select, add-to-selection, and
remove-from-selection actions, lowercase on Windows Fabric and title case
elsewhere. The list applies each action, or refuses it for a disabled option,
and then forwards the original event to the caller's `onAccessibilityAction`
exactly once. Its checkmark and checkbox indicator stay inaccessible.

The focus target follows the [shared focus visual policy](../../../../references/higher-order-components.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
