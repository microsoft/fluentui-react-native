# ListItem interaction

`usePressableState` forwards React Native press and pointer handlers while
tracking hover, press, and focus. Disabled state blocks activation and wins
over press and hover styling. User root styles are applied after those
component styles.

Press reports through `onPress`; it never changes `selected`. A parent that
uses ListItem as a selectable row must update the selected prop and coordinate
its peers. Windows and macOS native Pressable behavior supplies keyboard
activation for a focusable root. This component does not implement arrow-key
movement, Home/End, type-ahead, focus restoration, or timed animation.

Hover, press, and
selection styling update without component-owned motion.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
