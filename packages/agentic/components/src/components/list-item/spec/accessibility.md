# ListItem accessibility

The root defaults to the React Native `button` role, is accessible, and
merges caller-supplied accessibility state with `disabled` and `selected`.
Disabled rows are unavailable and not focusable. The visible `content` is the
normal accessible name unless a caller supplies React Native naming props.

Leading and selected icons, avatar, trailing container, and selection glyph
are inaccessible presentation. The row is the only control announced for
those visual affordances. On Windows this exposes the root through UIA; on
macOS it exposes the root through AX with the resolved role, name, selected
state, and disabled state.

Callers that change the root role or embed the row in a collection own
any additional container semantics and position information.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
