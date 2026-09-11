# ListboxItem interaction

The list-item root uses React Native Pressable events. Its caller receives
`onPress`, hover, focus, and press handlers through the framework state hook.
Disabled options do not activate or receive focus. Selection stays external:
pressing an option does not update `selected`; an owning list or popup must
provide a new prop value.

The component renders hover and press feedback from its resolved native state.
Its root follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
FocusVisual remains mounted, hidden on the system path on every platform and retaining
its enabled-focus visibility calculation on the custom path. Section headers
are noninteractive and gain no ring even when `loading` is false.

Windows and macOS provide platform keyboard activation for the focusable
Pressable. Arrow navigation, Home/End, type-ahead, submenu control, dismissal,
and focus return are outside this component. No timed animation is implemented.
