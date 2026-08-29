# Tag accessibility

## Native semantics

The root is the only accessible element. It sets `accessibilityRole="button"`
and publishes `disabled` through `accessibilityState`, merged over any state the
caller passes. There is no selected or checked state to expose, because a tag
has neither.

On Windows the root maps to a UI Automation button that reports its disabled
state; Narrator reads the name and the control type. On macOS it maps to the
equivalent button element for VoiceOver. The leading icon and the dismiss glyph
both set `accessible={false}`, so neither is announced and neither can be
reached on its own.

A user therefore hears one control per tag. There is no way to move to the
dismiss glyph separately, which is intentional: the whole tag is the target.

## Naming

In the default layout the label text is the accessible name. That name should
describe the tag, not the removal: "Engineering", not "Remove". If the removal
intent is not obvious from context, override the name on the root with an
`accessibilityLabel` that states both, such as "Remove Engineering filter".

Icon-only tags render no text, so they must always be named. Development builds
warn once when an icon-only tag has neither `accessibilityLabel` nor a
labelled-by reference. Name the category, never the glyph.

An icon-only tag with no leading icon has nothing to identify it visually at
all, so development builds warn about that case as well.

## Dismiss expectations

Because the visible dismiss glyph is decorative, the announcement must carry the
affordance when it matters. If a screen reader user cannot tell from context
that activating the tag removes it, put that in the name.

The component never removes itself. When the caller drops a tag in response to
`onPress`, focus is destroyed with it, so the caller must move focus somewhere
sensible: the next tag, or the container that held the list. Announce the
removal from the surrounding surface if the change is not otherwise visible.

## Focus and keyboard

The root is focusable while enabled and leaves the tab order while disabled, so
a row of tags is one tab stop per enabled tag. Enter and Space activate the
focused tag. A disabled tag stays in the accessibility tree and reports its
disabled state, so it can still be read.

A two-ring focus visual is drawn inside the tag, following the resolved corner
radius, whenever the root is focused and not disabled, so it is rounded on a
rounded tag and circular on a circular or icon-only tag.

## Contrast

The primary appearance pairs a heavy brand background with the on-heavy
foreground, and the secondary appearance pairs a subtle neutral background with
the primary neutral foreground. Icons take the same resolved foreground as the
label, so a glyph is never lower contrast than the text beside it.

The disabled state moves both the background and the foreground to their
disabled tokens together, so a disabled tag reads as one unavailable unit rather
than as live text on a dead surface.
