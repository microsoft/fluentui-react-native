# MenuItem accessibility

An interactive root exposes `menuitem` by default, `menuitemradio` with
`hasCheckmark`, or `menuitemcheckbox` with `hasMultiselect`. Indicator roles
include checked state from the caller-supplied selected value. A selected
default menu item instead exposes selected state. The root is accessible; its
name defaults to content and a chevron receives the default submenu hint.

A section header exposes the React Native `none` role, is disabled, and is not
focusable. Icon, avatar, chevron, checkmark, and checkbox visuals are
inaccessible presentation. On Windows the root is represented through UIA,
and on macOS through AX, using the resolved role, name, state, and availability.

FocusVisual is the component's visible focus treatment. An owning menu remains
responsible for a menu-level name, menu position, and relationships to any
submenu.
