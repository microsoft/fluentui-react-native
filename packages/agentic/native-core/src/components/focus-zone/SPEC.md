# Modern FocusZone

Owner-authorized initial contract, 2026-10-02. Native-core `/macos` and
`/windows` preview only; runtime qualification and old peer floors remain
tracked in `plans/modernization.md`. This is not root/Win32 admission.

The component is unstyled and preserves the actual native-zone instance in
the React 19 `ref` prop. `commandsRef` publishes a separate mounted command
surface; it is null after unmount. Both native and caller refs compose through
framework-base slots, including callback cleanup.

Direction, spatial opt-in, arrow wrap, Tab mode, disabled, and a live
defaultTarget translate to the existing per-host navigation engine.
Navigation remains platform-native by default; it is not modal containment.

`requestFocus` supports default/first/last or a live scoped descendant.
Confirmation comes from native responder/focused-component identity, not a
void focus return. Entry preferences must not override an explicit command
destination. Requests are generation-fenced, cancellable, bounded by
an explicit timeout, and invalidated on component/target replacement.
Missing mounts are not queued; inactive windows are not reactivated.
Cancellation cannot reverse a mutation already executed natively.

Disabled discoverability, remembered focus, natural cross-popup Tab
continuation, and all-host root behavior are separate admission gates.
