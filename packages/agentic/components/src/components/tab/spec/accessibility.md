# Tab accessibility

## Native semantics

The root is the accessible element. It sets `accessibilityRole="tab"` and
publishes `selected` and `disabled` through `accessibilityState`, merged over
any state the caller passes so a caller cannot contradict the rendered
selection. The `controls` prop is forwarded to the platform as the
controlled-element relationship, which is how a screen reader user moves from
the tab to the panel it shows.

On Windows the root maps to a UI Automation tab item that exposes the selection
state; Narrator reads the name, the control type, and whether the tab is
selected. On macOS it maps to the equivalent tab element for VoiceOver, which
reads the same parts. Icons set `accessible={false}` so they add nothing to the
announcement, and the hidden width-reservation copy of the label is removed from
the accessibility tree, so the label is announced exactly once.

## Naming

In the default layout the visible text is the accessible name. Keep it short and
make it name the panel's content, since the tab and its panel are announced
together.

Icon-only tabs have no text, so `accessibilityLabel` is required by the type
shape and the compiler rejects an icon-only tab without one. Development builds
additionally warn once when an icon-only tab reaches runtime with no name and no
labelled-by reference. Name the panel, not the glyph: "Activity", not "Bell".

## Panel wiring

`controls` must match the identifier of the element that renders the panel, and
the panel must exist while the tab is rendered. Point every tab at its own panel
identifier; reusing one identifier across tabs breaks the relationship for all
of them.

The panel itself is entirely the caller's responsibility. This package ships no
panel component and no list container, so the caller also owns the grouping
semantics around the tabs and any label for that group.

## Focus and keyboard

A tab is focusable while enabled and is removed from the tab order while
disabled. Disabled tabs remain in the accessibility tree and report their
disabled state, so they can still be read even though they cannot be focused.

Because no list container ships, tabs are reached by plain tab order unless the
caller implements roving focus. If the caller does implement arrow-key movement,
it must also decide whether selection follows focus, and keep the rendered
`selected` value in step with whatever it chooses.

A two-ring focus visual is drawn inside the hit area, following the corner
radius of the active layout, whenever the root is focused and not disabled.

## Contrast and state

Selection is carried by a filled heavy background with the on-heavy foreground
and a heavier label weight, not by color alone at the same fill. The disabled
state keeps the same structure and shifts both layers to the disabled tokens, so
a disabled selected tab still reads as selected.

The icon takes the same resolved foreground as the label at every state, so the
two never disagree.
