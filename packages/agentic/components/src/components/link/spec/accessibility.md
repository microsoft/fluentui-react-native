# Link accessibility

## Native semantics

The root is the only accessible element. It sets `accessibilityRole="link"` and
publishes `disabled` through `accessibilityState`, merged over any state the
caller passes. There is no checked, selected, or expanded state, because a link
has none.

On Windows the root maps to a UI Automation hyperlink that reports its disabled
state; Narrator reads the name and the control type. On macOS it maps to the
equivalent link element for VoiceOver. The trailing glyph sets `accessible` to
false, so it is never announced and cannot be reached on its own. A user
therefore hears one control per link, no matter how many parts it is drawn from.

## Naming

The label text is the accessible name. Write it so it survives being read out of
context, because assistive technology presents links as a flat list stripped of
the prose around them. "View the 2026 fiscal report" works; "Click here" and
"Learn more" do not.

When the visible text has to stay short, override the name on the root with an
`accessibilityLabel` that names the destination. Do the same when several links
on one surface share the same visible text but lead to different places.

A link that renders no label has nothing to announce, so development builds warn
once when the content slot is suppressed and no `accessibilityLabel` or
labelled-by reference is supplied.

Keep trailing punctuation out of the link. A sentence-ending period inside the
label is announced as part of the name.

## Leaving the current surface

Nothing about a link tells a screen reader that it opens somewhere else. The
trailing glyph is a visual cue only. When activation moves the user out of the
app or into a new window, say so in the accessible name — "View the 2026 fiscal
report, opens in your browser" — and pair it with the glyph. Both are needed;
neither substitutes for the other.

## The underline is the affordance

The rest foreground is the same neutral primary color the surrounding body text
uses, so color alone never distinguishes a link from prose. A link inside a run
of text must set `inline` so the underline is present at rest; that underline is
the second visual indicator the guidance requires.

A standalone link may leave `inline` unset only when its surroundings already
imply interactivity — isolation in whitespace, a column of links, or a
navigation region. If a link sits alone in prose with no such cue, set `inline`.

## Focus and keyboard

The root is focusable while enabled and leaves the tab order while disabled, so
a column of links is one tab stop per enabled link. Enter activates the focused
link. A disabled link stays in the accessibility tree and reports its disabled
state, so it can still be read.

Focus is drawn as a single border around the text box in the outer focus stroke
color, at the base corner radius. The same border width is held transparently at
rest so gaining focus never reflows the text. A focused link also shows its
underline, which is what distinguishes a focused standalone link from a resting
one.

Two limitations are worth stating plainly. The dual-ring focus visual used
elsewhere in this package is composed from nested views and cannot be placed
inside a text run, so a link gets one ring rather than two. And an inline link
nested inside a paragraph may not paint its border at all, because the platforms
lay nested text out as an attributed string; such a link is still focusable and
still keeps its underline, but its focus indication may be weaker than a
standalone link's. Prefer standalone links for anything that must be reachable
and obviously focused.

## Disabled links

A disabled link is a compromise. When a destination is unavailable, prefer not
rendering a link at all and showing plain text instead. Use `disabled` only when
the link must stay in place and its unavailability must be announced.

While disabled, the link does not navigate, does not call the press handler, and
does not take focus, and both the label and the glyph move to the disabled
foreground together so the whole run reads as one unavailable unit.

## Target size

Link applies no hit-area padding, because padding would shift the baseline of the
text it sits in. When several standalone links sit in a column or a row, the
parent layout must supply enough space between them to keep each target
comfortably reachable.
