# Radio interaction

The root uses the React Native Pressable state hook. Press, hover, focus, and
their corresponding caller handlers are forwarded. Disabled state prevents
activation and focus. Pressing reports through `onPress`; Radio never changes
its own selected value.

On Windows and macOS, native Pressable behavior activates a focused radio.

Hover and press states change the token-derived colors.

There is no component-owned timed
animation.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

An owning group must move focus with directional keys, establish the group
entry point, update selected peers, and return focus when its surrounding
surface closes.
