# Avatar interaction

Avatar has no press, hover, disabled, selected, or focus state. It does not receive keyboard focus and renders no `FocusVisual`. Pointer and keyboard behavior belong to a wrapper when an avatar is part of a person picker, list item, or profile action.

Changing the content slot or `activityRing` changes the rendered presentation without a component-owned animation. The ring is root styling, so enabling it does not add a hit target or alter the root's requested dimensions. No reduced-motion behavior is needed because Avatar does not animate.
