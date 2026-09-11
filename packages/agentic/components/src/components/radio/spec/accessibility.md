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
relationship information. The root follows the
[shared focus visual policy](../../AGENTS.md#focus-visual-policy), requesting native
feedback on every platform and retaining the mounted custom FocusVisual without
a competing visible ring. Native rendering depends on platform support.
