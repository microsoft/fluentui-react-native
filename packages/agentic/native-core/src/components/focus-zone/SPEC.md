# Modern FocusZone

Owner-authorized initial contract, 2026-10-02. Native-core `/macos` and
`/windows` preview only; runtime qualification and old peer floors remain
tracked in `plans/modernization.md`. This is not root/Win32 admission.

The component is unstyled and preserves the actual native-zone instance in
the React 19 `ref` prop. `commandsRef` publishes a separate mounted command
surface; it is null after unmount. Both native and caller refs compose through
framework-base slots, including callback cleanup.

FocusZone is a phased component. `commandsRef` and `defaultTarget` drive hooks
in its first phase; when FocusZone is used as a slot, supply them through the
slot props, because render-time values for them are ignored. Render-time
navigation, `disabled`, and view props are merged, and a render-time `ref`
composes with the slot's `ref`.

Direction, spatial opt-in, arrow wrap, Tab mode, disabled, and a live
defaultTarget translate to the existing per-host navigation engine.
Navigation remains platform-native by default; it is not modal containment.
A disabled zone reports `not-focusable` through the native command result.

`requestFocus` supports default/first/last or a live scoped descendant.
Confirmation comes from native responder/focused-component identity, not a
void focus return. Entry preferences must not override an explicit command
destination. Requests are generation-fenced, cancellable, bounded by
an explicit timeout, and invalidated on component/target replacement.
Missing mounts are not queued; inactive windows are not reactivated.
A zone inside an owned popup, such as Callout content, is active while the
popup's owner chain includes the active window, so a Menu can enter and move
within its list on both hosts.
Cancellation cannot reverse a mutation already executed natively.

Disabled discoverability, remembered focus, natural cross-popup Tab
continuation, and all-host root behavior are separate admission gates.
