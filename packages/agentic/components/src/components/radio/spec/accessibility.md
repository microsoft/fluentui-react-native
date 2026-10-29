# Radio accessibility

The root is an accessible React Native `radio`. It merges caller accessibility
state with checked and disabled state, uses `label` as its default accessible
name, and uses visible `secondaryText` as the default accessibility hint.
Callers may override the name or hint with the corresponding React Native
props.

Disabled radios are unavailable and not focusable. The indicator and text
subtrees set the platform hidden-from-accessibility props, so Windows UIA and
macOS AX expose only the root's radio role, name, checked value, and disabled
value and cannot announce decorative descendants separately.

The owning group must provide a group name and any positional or peer
relationship information.

The root declares the platform's resolved Select action, preserving caller
actions and labels. UIA RadioButton uses SelectionItem.IsSelected rather than
Toggle.ToggleState, so the externally owned value also owns native selected
state and takes precedence over conflicting checked/selected ARIA aliases.
Native actions are forwarded unchanged, once, to onAccessibilityAction; Radio
does not synthesize onPress or select itself. An owner supporting native Select
updates its own value from that event. Other native endpoints require separate
qualification.

The focus target follows the [shared focus visual policy](../../../../references/higher-order-components.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
