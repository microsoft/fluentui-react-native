# Tag interaction

## One target

The entire tag is a single pressable, including its padding, the leading icon,
the label, and the dismiss glyph. Pressing anywhere produces the same result;
there is no sub-region that behaves differently, and the dismiss glyph is a
visual affordance rather than a second control.

A press calls `onPress` and nothing else. The tag does not change appearance
permanently, does not mark itself dismissed, and does not unmount. Removing the
tag is the caller's response to `onPress`.

## Pointer states

Hover and pressed both change the background, with pressed taking precedence
over hover. The foreground is intentionally excluded from those steps: the label
and both icons keep the same color across rest, hover, and pressed, so moving a
pointer across a dense row of tags does not make the text flicker.

There is no transition on the color change. The new background is applied on the
render that carries the new state.

While `disabled`, the underlying pressable stops reporting presses and both the
background and the foreground move to their disabled values.

## Keyboard

Tab moves focus to an enabled tag; a disabled tag is skipped because it is not
focusable. Enter and Space activate the focused tag through the shared pressable
behavior, producing the same `onPress` a pointer press produces.

No other keys are bound. In particular, Delete and Backspace do not activate a
tag, and there is no arrow-key movement between tags, because no tag group ships
in this package.

## Focus visual

A two-ring focus visual is drawn inside the tag, following the resolved corner
radius, whenever the root is focused and not disabled. React Native does not
report focus modality on these platforms, so the ring appears for pointer focus
as well as keyboard focus.

When the caller removes a tag on activation, the focused element is destroyed.
Move focus deliberately in that handler, to the next tag or to the container, or
focus falls back to the surface and the user loses their place.

## Size, shape, and layout

`size` changes the padding, the text style, and both icon sizes together; the
dismiss glyph is always one step smaller than the leading glyph. `shape` changes
only the corner radius, and only in the icon-and-text layout: an icon-only tag
is always circular.

The icon-only layout renders no label at all, so a tag in that layout is a
compact circle holding a leading icon and the dismiss glyph. It is not a smaller
version of the labeled tag; it is a different anatomy, and it depends entirely
on the name for meaning.

A small icon-and-text tag with the circular shape currently uses the icon-only
spacing step rather than the small labeled spacing, so it is tighter than the
equivalent rounded tag. That is a tracked divergence, not intended behavior.

## Long labels

The label shrinks before the icons do, and the root sizes itself to its content
from the start of the line rather than stretching. A tag in a constrained row
therefore compresses its text while keeping both glyphs at full size. Truncation
behavior beyond that belongs to the caller, which can pass text props through
the content slot.
