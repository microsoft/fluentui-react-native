# ListboxItem interaction

The list-item root uses React Native Pressable events. Its caller receives
`onPress`, hover, focus, and press handlers through the framework state hook.
Disabled options do not activate or receive focus. Selection stays external:
pressing an option does not update `selected`; an owning list or popup must
provide a new prop value.

The component renders hover and press feedback from its resolved native state.

Section headers
are noninteractive and gain no ring even when `loading` is false.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

Windows and macOS provide platform keyboard activation for the focusable
Pressable. Arrow navigation, Home/End, type-ahead, submenu control, dismissal,
and focus return are outside this component. No timed animation is implemented.
