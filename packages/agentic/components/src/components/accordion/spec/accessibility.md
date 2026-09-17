# Accordion accessibility

The header is the only accessible control. It uses React Native button semantics, remains accessible, and exposes `accessibilityState.expanded`. A supplied `accessibilityLabel` replaces the visible title for the accessible name; otherwise the visible title supplies the name. A title set to `null` requires an explicit label and triggers a development warning when absent.

The header associates with the generated body identifier through React Native `accessibilityControls`. The body is not itself accessible and is hidden from accessibility descendants while collapsed. Its content becomes available in reading order only while expanded. Decorative leading and chevron icons are inaccessible.

On Windows, the header maps to a UI Automation button and reports expanded state.

On macOS, it maps to an AX button with the same state.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
