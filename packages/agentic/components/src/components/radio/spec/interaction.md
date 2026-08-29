# Radio interaction

The root uses the React Native Pressable state hook. Press, hover, focus, and
their corresponding caller handlers are forwarded. Disabled state prevents
activation and focus. Pressing reports through `onPress`; Radio never changes
its own selected value.

On Windows and macOS, native Pressable behavior activates a focused radio.
Hover and press states change the token-derived colors, and focus reveals the
persistent FocusVisual. There is no component-owned timed animation.

An owning group must move focus with directional keys, establish the group
entry point, update selected peers, and return focus when its surrounding
surface closes.
