# Modern Callout

Owner-authorized initial contract, 2026-10-02. `/macos` and `/windows` preview
only; not all-host root admission. See `plans/modernization.md` for executed
evidence and deferred Menu/Popover, Paper, Win32, and peer-floor gates.

Callout is unstyled. Its React 19 ref is a presentation handle, deliberately
not the hidden native marker. `content` forwards appearance, accessibility,
events and an actual View ref to one materialized attachment host; arbitrary
host replacement/collapse is not allowed.

Callout is a phased component. `ref`, `open`, `presentationKey`, and `anchor`
drive hooks in its first phase; when Callout is used as a slot, supply them
through the slot props, because render-time values for them are ignored.
Render-time `placement`, `onReady`, `onDismissed`, and children are merged, and
render-time `content` props compose with the slot's content props and refs.

`open` is externally requested presence. Native closure reports onDismissed
and latches that generation closed. Retaining open=true does not reopen.
False->true or a changed presentationKey rearms. onReady means attached content
and valid positioning, not child-focus confirmation. A missing live anchor
does not present at the origin.

View anchors track committed attachment; rect/point anchors are snapshots in
local logical units relative to their live owner. No public numeric tags,
global screen coordinate guesses, or inline Text/shadow-tree geometry.
Placement resolves logical start/end, alignment, gap, flip and work-area shift.

Handle operations require the current opaque presentation. Native events,
not void command returns, confirm focus/close/reposition. Abort, target changes,
unmount, invalid generation and timeout produce explicit outcomes. Timeout is
unconfirmed; cancellation cannot undo an already-executed native mutation.
Focus remains scoped to eligible content and active owned windows.

Pointer input outside the popup family, Escape in focused content, and losing
the host report `native-light-dismiss` or `host-detached`. Input in a nested
popup does not dismiss the popups that own it. Closing a presentation that
holds keyboard focus returns input to the owner window's retained focused
component; outside input that already moved focus is not overridden. On
Windows, outside input is observed for the owner island and other application
windows; application deactivation dismisses only presentations that hold
focus. A Menu still restores its trigger explicitly after an item closes it.

Request-only veto, precise light-dismiss classification, policy-driven
restoration, popup-family transactions, modal containment and text fragments
are deferred; no success-shaped substitutes are provided.
