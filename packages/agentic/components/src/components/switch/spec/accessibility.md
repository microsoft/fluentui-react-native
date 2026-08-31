# Switch accessibility

## Native semantics

The hit area is the accessible element. It sets `accessibilityRole="switch"` and
publishes `checked` and `disabled` through `accessibilityState`, merged over any
state the caller passes so a caller cannot contradict the rendered value. The
same checked value is also forwarded through the react-native-windows checked
property so Windows reports the toggle state through UI Automation.

On Windows the element maps to a UI Automation toggle control: Narrator reads
the name, the control type, and the on or off state, and announces the new state
after each toggle. On macOS it maps to the equivalent switch element for
VoiceOver, which reads the same three parts.

The track, the thumb, and every rendered label set `accessible={false}`, so the
component presents as exactly one element and the label text is never read
twice.

## Naming

There are three naming paths, in priority order:

1. A caller-supplied name on the root wins. Passing `accessibilityLabel` or a
   labelled-by reference is always respected.
2. When labels are rendered and the caller supplies no name, the component uses
   the `label` text as the accessible name.
3. When no label is rendered, in the `switch` layout or when the label slots are
   suppressed, the `label` text becomes the accessible name on its own.

Rendered labels are hidden from assistive technology, so the component does not
generate ids or emit labelled-by references for them. Copied text is the single
fallback mechanism and cannot leave a dead relationship.

Development builds warn once when no label is visible and `label` is still the
placeholder default, because that combination produces a switch that announces
nothing meaningful. Give every standalone switch an explicit
`accessibilityLabel`.

Name the setting, not the action or the current value: "Show read receipts", not
"Turn on read receipts" and not "On". The state is already announced from the
checked state, so putting it in the name makes it read twice and go stale.

## Focus and keyboard

The hit area is focusable while enabled and leaves the tab order when disabled,
because `focusable` defaults to the negation of `disabled`. Enter and the space
keys toggle on key up. The two-ring focus visual is drawn inside the hit area
whenever the root is focused and not disabled, so it stays visible against both
the light and the dark surface.

Disabled switches stay in the accessibility tree and report their disabled
state, so a screen reader user can still discover the setting and hear that it
is unavailable.

## Labels and contrast

A rendered label uses the primary neutral foreground and shifts to the disabled
foreground with the rest of the control, so the whole component reads as one
unavailable unit rather than a live label next to a dead control.

The unchecked track is transparent with a visible border and the checked track
is a filled heavy background, so the two states differ in fill and in border
color, not only in thumb position. The thumb keeps contrast against its own
track in both states.
