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

Focus feedback is provided by the mounted FocusVisual, not a native focus
border. Callers that change the root role or embed the row in a collection own
any additional container semantics and position information.
