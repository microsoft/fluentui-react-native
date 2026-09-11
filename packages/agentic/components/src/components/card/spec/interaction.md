# Card interaction

A Card becomes interactive when `onPress` is provided or when `selected` is present. Its overlay uses React Native press behavior for pointer, touch, `Enter`, and `Space`. It forwards consumer press and interaction handlers. Disabled interactive cards do not activate or accept focus.

Selection is externally owned. A press reports through `onPress` but never changes `selected`; the caller updates that prop if its collection behavior requires it. Selected cards use the supplied value for visual and accessibility state.

The overlay owns hover, pressed, and focus feedback. It does not trap focus, move focus, or manage collection navigation. The overlay, not the structural root, follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy). `FocusVisual` remains mounted while an overlay exists, hidden on the system path on every platform and retaining its focused, enabled visibility calculation on the custom path. Card provides no timed animation or reduced-motion branch.
