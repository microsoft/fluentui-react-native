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

The option root follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy),
requesting native feedback on every platform and retaining the mounted custom
FocusVisual. Native rendering depends on platform support.
Consumers own the containing collection's name, position, selection
rules, and any focus restoration policy.
