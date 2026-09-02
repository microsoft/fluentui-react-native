# InteractionTag accessibility

## Two controls, one tag

An interaction tag is two accessible controls, not one. The primary action and
the dismiss action are each exposed as a button, and the container between them
is not an accessibility element at all: it sets no role and does not merge its
children. A screen reader user therefore meets the primary action and the
dismiss action as separate, adjacent items.

This is deliberate. The dismiss action performs a different, irreversible
operation from the primary action, so it needs its own name and its own
activation point.

## Names

The primary action's name comes from its content in the icon-and-text layout, so
the rendered text is the name and no extra property is needed. In the icon-only
layout there is no text to read, so the caller must supply an
`accessibilityLabel` on the primary action slot; development builds warn when it
is missing.

The dismiss action always needs an `accessibilityLabel`, in every layout and at
every size, because it contains only a decorative glyph. Name it for the tag it
removes rather than for the glyph, for example `Remove Engineering` rather than
`Close` or `X`. Development builds warn when it is missing.

Neither name should include the word button. The role already says that.

## Hidden parts

Three parts are removed from the accessibility tree so they cannot leak into
either name:

- The leading icon and the dismiss glyph are marked not accessible. They are
  decoration for a control that is already named.
- The avatar is hidden together with its subtree, because its image or its
  initials text would otherwise be read as part of the primary action's name.
  Repeat the person's name in the primary action's own text or label instead.
- The divider is hidden and is excluded from hit testing. It is a hairline with
  no meaning.

## State

Both regions carry the resolved `disabled` state on their accessibility state,
merged over any state the caller passes, so assistive technology reports a
disabled tag consistently on both controls. While disabled, both regions also
leave the tab order rather than staying focusable and inert.

InteractionTag has no selected, checked, expanded, or busy state to report.

## Keyboard reachability

Each enabled region is its own tab stop, so an enabled tag costs two tab stops.
Callers who need a single stop per tag should place tags inside a focus-managing
container rather than asking the component to merge its two controls.

Both regions accept keyboard activation through the shared pressable behavior,
so Enter and Space fire the same `onPress` a pointer press fires.

## Focus visibility

Focus is shown by a two-ring focus visual inside the focused region, drawn from
the focus stroke tokens. Both rings stay mounted and change only opacity, and
they never rely on the platform's own focus ring. The visual follows the outer
corner radii of the region it sits in, so a focused dismiss action on a circular
tag shows a rounded trailing edge and a flat leading edge.

Only the focused region shows a ring. Focusing the dismiss action never lights
the primary action, because the two regions hold separate focus state.

## Contrast and targets

The foreground is resolved from appearance and disabled only, so it does not
change on hover or press and cannot drift below its intended contrast during an
interaction. Both regions reach at least a twenty-four pixel square target box
at both sizes; at the medium size the dismiss action is a thirty-two pixel
square.
