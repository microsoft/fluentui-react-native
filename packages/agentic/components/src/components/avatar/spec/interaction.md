# Avatar interaction

Avatar has no press, hover, disabled, selected, or focus state. It adds no keyboard focus or focus feedback. Pointer and keyboard behavior belong to a wrapper when an avatar is part of a person picker, list item, or profile action.

Changing the content slot or `activityRing` changes the rendered presentation without a component-owned animation.
The activity ring reuses the persistent border structure of `FocusVisual`, but
its visibility is controlled solely by `activityRing`, never focus. Toggling the
prop changes opacity without mounting another native border. The ring does not
add a hit target, change tab order, or alter the root's requested dimensions.
No reduced-motion behavior is needed because Avatar does not animate.
