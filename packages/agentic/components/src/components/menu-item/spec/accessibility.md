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

An owning menu remains responsible for a menu-level name, menu position, and
relationships to any submenu.

`disabledFocusable` is an opt-in for interactive list rows. A disabled row
remains announced as disabled, but can own native focus. It does not gain an
enabled action: press, long press, keyboard activation, and accessibility tap
are refused. Custom accessibility handlers still receive their original event;
an owner must not treat a disabled custom action as activation.

macOS omits the native Pressable `disabled` prop in this mode, retaining
`accessibilityState.disabled: true` instead. This avoids Pressable's unconditional
removal of focusability; actual AX disabled-state projection, including Fabric,
still requires qualification.

The focus target follows the [shared focus visual policy](../../../../references/higher-order-components.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled rows show
feedback only when `disabledFocusable` is opted into; other disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.
