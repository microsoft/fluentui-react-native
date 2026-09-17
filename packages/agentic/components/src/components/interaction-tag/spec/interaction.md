# InteractionTag interaction

## Two independent regions

The primary action and the dismiss action are siblings inside a plain container.
The container is a `View` with no press handling, so the two regions are never
nested and no press event travels from one to the other.

Each region runs its own pressable state, which means:

- Hovering the dismiss action fills the dismiss action only. The primary action
  stays at rest.
- Pressing the dismiss action fires the dismiss handler only. The primary
  handler does not also run.
- Focusing one region shows one focus visual. The other region shows none.

The divider and both focus visuals are excluded from hit testing, so a pointer
that lands anywhere on the tag lands on exactly one of the two regions.

## Pointer

Both regions follow the shared pressable model: hover applies the hovered
background, pointer down applies the pressed background, and releasing inside
the region fires `onPress`. Releasing outside the region cancels without firing,
and the region returns to rest.

Backgrounds change immediately, with no transition, because this package
publishes no motion tokens.

## Keyboard

Tab reaches the primary action and then the dismiss action, in render order, so
a right-to-left surface still visits the primary action first. Enter and Space
activate the focused region and fire the same handler a pointer press fires.

InteractionTag adds no arrow key behavior, no Delete or Backspace shortcut, and
no type-ahead. A row of tags that needs arrow navigation should be wrapped in a
focus-managing container that owns those keys.

## Disabled

The `disabled` prop governs both regions together. While disabled, neither
region hovers, presses, fires a handler, or takes focus, and both leave the tab
order. The disabled background and foreground apply to both regions and the
divider takes its own disabled color.

## Focus visual

Each region draws its own two-ring focus visual, mounted at all times and
toggled by opacity so no border visual is created after mount. The visual
follows that region's resolved outer corner radii and stays flat on the edge
that meets the divider.

## Dismissal

The component never removes itself. Activating the dismiss action reports
`onPress` and nothing else; the caller drops the tag from its own collection and
the tag unmounts. Callers that need to confirm the removal, animate it, or undo
it own that behavior entirely.

Move focus deliberately after a removal. The dismissed tag's two tab stops
disappear with it, so a caller that removes the last tag in a row should send
focus somewhere sensible rather than letting it fall back to the surface.
