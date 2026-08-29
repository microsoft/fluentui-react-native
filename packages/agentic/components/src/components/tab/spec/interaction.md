# Tab interaction

## Pointer

The whole root is the hit area, including its padding, so the icon, the label,
and the space around them all activate the tab. Hover changes the background and
the foreground together; pressed applies the same resolution at a higher
precedence, so a press reads as a distinct step from a hover.

A press calls `onPress` and nothing else. The component does not become
selected, so a tab whose caller ignores `onPress` visibly does nothing. Selection
is applied on the next render, when the caller passes a new `selected` value.

While `disabled`, the underlying pressable stops reporting presses and the
disabled colors apply to the background, the label, and the icon.

## Keyboard

Tab moves focus to an enabled tab; a disabled tab is skipped because it is not
focusable. Enter and Space activate the focused tab through the shared pressable
behavior, producing the same `onPress` a pointer press would.

No arrow-key handling ships with this component. Moving between tabs with the
arrow keys, wrapping at the ends, jumping to the first or last tab, and choosing
whether selection follows focus are all decisions for the caller's list, because
no list container ships in this package. A caller that adds roving focus must
manage `focusable` on its own and keep exactly one tab reachable.

## Focus visual

A two-ring focus visual is drawn inside the hit area, following the corner radius
of the active layout, so it is rounded on an icon-and-text tab and circular on an
icon-only tab. It is shown whenever the root is focused and not disabled.

React Native does not report focus modality on these platforms, so the ring
appears for pointer focus as well as keyboard focus.

## Selection appearance

Selection changes four things at once: the background becomes a filled heavy
surface, the foreground becomes the on-heavy color for both the label and the
icon, the label weight becomes semibold, and the icon swaps to `selectedIcon`
when one was supplied.

The weight change would normally make the tab wider and push its neighbors. To
prevent that, the label is rendered twice: a hidden copy always drawn at the
selected weight reserves the width, and the visible copy is positioned over it.
The tab therefore occupies the same width whether or not it is selected, and
selecting a tab never reflows the row.

There is no transition between the selected and unselected appearance; the
change is applied on the render that carries the new `selected` value.

## Layout differences

The icon-and-text layout puts a gap between the icon and the label and uses
wider horizontal padding with a rounded corner radius. The icon-only layout uses
equal padding on both axes and a fully circular radius, and never renders text,
so it is a square target regardless of what the label would have been. The icon
is the same size in both layouts.
