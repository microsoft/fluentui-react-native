# Card accessibility

A static Card is inaccessible by default so its slot contents remain the accessible surface. Set `accessible` and provide an accessible label when the static card itself needs to be exposed; it then uses React Native group role and preserves supplied accessibility state.

An interactive Card exposes its overlay as a React Native button. The overlay reports `accessibilityState.disabled`; when `selected` was supplied, it also reports `accessibilityState.selected`. The structural root is hidden from accessibility in this mode. Card does not synthesize a name from header or content, so supply `accessibilityLabel` or a supported label reference for an interactive card.

On Windows, the interactive overlay maps to a UI Automation button; on macOS, it maps to an AX button.

Nested controls supplied through slots are separate controls and must have their own names and semantics.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
