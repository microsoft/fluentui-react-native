# NavItem interaction

`usePressableState` forwards React Native press and pointer handlers while
tracking hover, press, and focus. Disabled blocks activation and wins over
pressed, which wins over hovered. Caller root styles are applied after the
component styles.

## Activation

Press reports through `onPress` and never changes `selected` or `expanded`. A
parent navigation updates those values and coordinates peers: exactly one
destination is current, and the parent decides how many categories may be open.
Windows and macOS native Pressable behavior supplies keyboard activation for a
focusable root.

## Focus

The dual-ring FocusVisual stays mounted and becomes visible only while the
enabled root is focused. It is scoped to the row surface and does not enclose
the selected indicator's inset area beyond the row's own rounded bounds.

NavItem never sets its own focus order and implements no arrow-key, Home, End,
or type-ahead handling. The root `ref` is the native row instance, so a future
parent navigation can move focus to a row without NavItem owning the model.

## Trailing actions

Controls nested inside `trailingActions` are independent React Native press
targets. Native responder behavior gives the nested control the press, so
activating an action does not activate the row. The row keeps its hover
treatment while the pointer is anywhere over the row, including over an action.
Trailing actions stay visible at all times rather than appearing on hover, so
they remain reachable by touch, keyboard, and assistive input.

## Selection and disclosure presentation

A selected row shows the soft row fill, the strong label weight, the brand
indicator bar, and a brand-colored selected leading icon when one is supplied.
The indicator is always mounted and changes only color, and the hidden ghost
label reserves the strong-weight width, so neither selection nor disclosure
changes row geometry.

A category row's chevron points down while collapsed and up while expanded. The
change is instant. The disclosed group is rendered and revealed by the parent
navigation, not by NavItem.

## Motion

There is no component-owned animation. Row color, label weight, leading icon,
and chevron direction all change instantly, so reduced-motion preferences need
no special handling here.
