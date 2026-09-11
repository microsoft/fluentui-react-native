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

The root follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
FocusVisual stays mounted, hidden on the system path on every platform and retaining its
enabled-focus visibility calculation on the custom path. Hover, press, and
selection styling update without component-owned motion.
