# Link interaction

## One target

The whole link is a single text run: the label and the trailing glyph share one
hit area and one focus target. There is no sub-region that behaves differently,
and the glyph is a visual cue rather than a second control.

## Activation

An activation always calls `onPress` first. If `url` is set, the link then hands
that destination to React Native's linking module and stops caring what happens
to it. Both run on every activation; navigation never replaces the caller's
handler, so a link can report the click and travel at the same time.

Whether the destination opens, which application handles it, and whether a new
window appears are decisions the operating system makes. Link neither checks the
destination beforehand nor waits for it afterwards.

When the linking module rejects, that rejection is handed to
`onNavigationError` if the caller supplied one, and left untouched otherwise. It is
never swallowed. A link with no error handler will surface a failed navigation
as an unhandled rejection, which is the intended outcome: a destination that
cannot be opened is a bug worth seeing.

While `disabled`, neither the handler nor the navigation runs.

## Pointer and focus states

Two states are tracked, and both come from the root's own events. `pressed` is
held between press-in and press-out. `focused` is held between focus and blur.

There is no hovered state. The platforms report no hover on a text run, so a
resting non-inline link cannot acquire its underline under a stationary pointer
the way it would in a browser. Press and focus are the two moments at which the
affordance appears instead.

The pressed foreground change is applied on the render that carries the new
state, with no transition. Underline visibility changes are always instant,
which is also what the source guidance requires: fading an underline in and out
makes it flicker as the text is repainted.

## The underline

The underline is drawn on the label, never on the trailing glyph, so the glyph
stays legible and the underline stops where the words do.

When `inline` is set, the underline is present at rest and stays present through
press, focus, and disabled. That is the whole point of the inline variant: text
inside prose cannot rely on color, because a link is the same color as the words
around it.

When `inline` is not set, the underline is hidden at rest and hidden while
disabled, and appears while the link is pressed or focused. A standalone link
therefore leans on its surroundings — whitespace, a column of links, a
navigation region — for its resting affordance, and produces the underline the
moment it is touched or reached.

## Keyboard

Tab moves focus to an enabled link; a disabled link is skipped because it is not
focusable. Enter activates the focused link. Space is deliberately not bound: a
link is not a button, and binding Space would make it behave like one.

There is no arrow-key movement between links, because a link is a single
focusable element rather than part of a composite control. A surface that needs
arrow navigation between links owns that behavior itself.

## Focus visual

A single border is drawn around the text box in the outer focus stroke color at
the base corner radius while the link is focused and not disabled. The same
border width is held transparently at rest, so focus never moves the text.

React Native does not report focus modality on these platforms, so the border
appears for pointer focus as well as keyboard focus.

An inline link nested inside a paragraph may not paint that border, because
nested text is laid out as an attributed string and box decorations can be
dropped. Its underline is already present at rest, so it does not lose its
affordance, but it may lose the stronger focus indication a standalone link
gets.

## Typography and inheritance

`typeSet` selects the family, size, weight, and line height for a standalone
link: functional for interface surfaces, content for prose. Those values are
applied only when the link is not inline.

An inline link deliberately sets none of them. It inherits whatever the
surrounding text run supplies, so a link inside large body copy renders at large
body copy and a link inside a caption renders at caption size. Locking standalone
defaults onto an inline link is the most common way to make one look wrong.

## Trailing glyph

The glyph renders only when supplied. It sits after the label inside the same
text run, takes the link's resolved foreground, and is separated from the label
by horizontal space carried inside its own inline box, because the text engine
has no gap of its own to give.
