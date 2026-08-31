# Accordion accessibility

The header is the only accessible control. It uses React Native button semantics, remains accessible, and exposes `accessibilityState.expanded`. A supplied `accessibilityLabel` replaces the visible title for the accessible name; otherwise the visible title supplies the name. A title set to `null` requires an explicit label and triggers a development warning when absent.

The header associates with the generated body identifier through React Native `accessibilityControls`. The body is not itself accessible and is hidden from accessibility descendants while collapsed. Its content becomes available in reading order only while expanded. Decorative leading and chevron icons are inaccessible.

On Windows, the header maps to a UI Automation button and reports expanded state. On macOS, it maps to an AX button with the same state. `FocusVisual` provides the visible focus feedback; it has no accessible name and cannot intercept input.
