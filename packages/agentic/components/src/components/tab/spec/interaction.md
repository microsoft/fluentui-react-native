# Tab interaction

## Pointer

The whole root is the hit area, including its padding, so the icon, the label,
and the space around them all activate the tab. Hover changes the background and
the foreground together; pressed applies the same resolution at a higher
precedence, so a press reads as a distinct step from a hover.

A standalone press calls `onPress` and does not mutate `selected`. Inside
TabList, the same press requests group selection and then preserves the caller's
`onPress` handler.

While `disabled`, the underlying pressable stops reporting presses and the
disabled colors apply to the background, the label, and the icon.

## Keyboard

A standalone enabled Tab is focusable and a disabled Tab is skipped. Inside
TabList, the parent keeps exactly one enabled Tab focusable, handles the arrow
axis selected by its orientation, supports Home and End, and skips disabled
Tabs. Enter and Space activate the focused Tab through the shared pressable
behavior, producing the same selection request and `onPress` as a pointer press.

## Focus visual

The root follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Every platform receives the native focus-ring request, with rendering support
and appearance delegated to its renderer, while the custom
visual remains mounted but hidden. On the retained custom path, the two-ring
visual follows the active-layout radius and appears while the root is focused
and enabled, including pointer focus. Native feedback is not required to match
the custom rounded or circular geometry.

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
