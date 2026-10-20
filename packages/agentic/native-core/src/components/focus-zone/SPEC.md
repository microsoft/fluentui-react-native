# Modern FocusZone

Owner-authorized initial contract, 2026-10-02. Native-core `/macos` and
`/windows` preview only; remaining runtime qualification is tracked in
[#4374](https://github.com/microsoft/fluentui-react-native/issues/4374), and
old peer floors and all-host admission in
[#4376](https://github.com/microsoft/fluentui-react-native/issues/4376).
This is not root/Win32 admission.

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

## Win32 adapter

`@fluentui-react-native/native-core/win32` exports `FocusZone` as a JavaScript
adapter over the Office Win32 host's prebuilt legacy `RCTFocusZone`
registration, for Menu. It requires the host's view manager. It maps
direction, spatial navigation, arrow wrap, Tab mode, `disabled`, and a live
`defaultTarget` onto the host's legacy props. The host accepts no modern
command, so `requestFocus` focuses an explicit or default target directly, or
for `default` without one focuses the host zone, which moves to its default
element. Each request is confirmed by the focus event that bubbles to the zone,
and focus already held is confirmed at once. The host has no first or last
search, so those requests report `unsupported`; a caller focuses the edge
target itself. The host does not handle Home or End. Adapter regressions belong
in `Win32FocusZone.test.tsx`.
