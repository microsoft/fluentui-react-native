# ListboxItem interaction

The list-item root uses React Native Pressable events. Its caller receives
`onPress`, hover, focus, and press handlers through the framework state hook.
Disabled options do not activate or receive focus. Selection stays external:
pressing an option does not update `selected`; an owning list or popup must
provide a new prop value.

The component renders hover and press feedback from its resolved native state.
Its FocusVisual remains mounted and is visible only when an enabled list item
is focused. Section headers are noninteractive even when `loading` is false.

Windows and macOS provide platform keyboard activation for the focusable
Pressable. Arrow navigation, Home/End, type-ahead, submenu control, dismissal,
and focus return are outside this component. No timed animation is implemented.
