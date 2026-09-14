# Card interaction

A Card becomes interactive when `onPress` is provided or when `selected` is present. Its overlay uses React Native press behavior for pointer, touch, `Enter`, and `Space`. It forwards consumer press and interaction handlers. Disabled interactive cards do not activate or accept focus.

Selection is externally owned. A press reports through `onPress` but never changes `selected`; the caller updates that prop if its collection behavior requires it. Selected cards use the supplied value for visual and accessibility state.

The overlay owns hover, pressed, and focus feedback.

It does not trap focus, move focus, or manage collection navigation.

Card provides no timed animation or reduced-motion branch.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
