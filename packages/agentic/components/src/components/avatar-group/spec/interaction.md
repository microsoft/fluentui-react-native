# AvatarGroup interaction

AvatarGroup has no press, hover, disabled, selected, or focus state. It is not a tab stop, it renders no `FocusVisual`, and it adds no press handling to the Avatar children it lays out. Pointer and keyboard behaviour belong to a wrapping control when a roster needs to be activated, and that wrapper draws the focus ring around the whole group.

Changing `layout`, `size`, `overflowCount`, or the child collection re-lays out the row without a component-owned animation, so no reduced-motion accommodation is required. The stack separation ring is a filled circular box rather than a border or an outline, so switching between layouts changes only geometry and fill and never introduces a border visual after mount.

Rendered items paint in source order, which puts the trailing item, and therefore the overflow indicator, in front. The group does not flex, stretch, or compress: its width follows the declared size, the layout, and the number of rendered items. A surface that has to fit a narrower space should show fewer children and raise `overflowCount` rather than scale the group.
