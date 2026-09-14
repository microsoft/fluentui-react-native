# ListboxItem accessibility

A `listItem` root exposes the React Native `button` role. It merges caller
accessibility state with disabled and pressed state; `pressed` mirrors the
externally supplied selected value. The root is accessible and focusable by
default unless disabled. Its visible content provides the accessible name
unless the caller supplies React Native naming props.

A `sectionHeader` is a nonfocusable accessible View with the `header` role.
It does not expose an interactive option state. Icons, avatar, chevron,
checkmark, and the multiselect visual are inaccessible presentation, so the
root is announced once. Windows exposes the resolved root through UIA and
macOS through AX.

Consumers own the containing collection's name, position, selection
rules, and any focus restoration policy.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
