# MenuItem interaction

Interactive list-item roots forward React Native Pressable handlers. Native
pointer and keyboard activation call `onPress`; disabled rows cannot activate
or, unless `disabledFocusable` is set, receive focus. Pressing never changes
`selected`, so an owning menu must
update that value and clear peers when required.

Indicator accessibility actions preserve the same external selection owner.
The component forwards the original custom accessibility event once, including
disabled events, but never synthesizes `onPress` or selects itself. An owner
handling these actions must reject disabled activation and coordinate its
menu just as it does for other caller-owned selection updates.

Hover and press state select the root and text colors after style selection.

Section headers do not activate, focus, or show a ring, including when their
skeleton is shown.

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

This component does not implement arrow navigation, Home/End, type-ahead,
submenu opening, focus restoration, dismissal, or timed motion. Those are
menu-container responsibilities on Windows and macOS.

## Focus target lifetime

The state hook uses the shared ref-backed focus foundation. Internal focus-target
refs compose with caller refs on the actual interactive slot, without redirecting
structural root refs. Native self-focus is distinct from descendant events, and
detach or loss of focus eligibility invalidates pending focus requests. Merely
disabling a `disabledFocusable` row does not remove its focus target. Focus visuals observe root
modality only while focused on the custom path; there is no scene-wide rerender.
