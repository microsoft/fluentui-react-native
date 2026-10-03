# Modern Callout

Owner-authorized initial contract, 2026-10-02. `/macos` and `/windows` preview
only; not all-host root admission. See `plans/modernization.md` for executed
evidence and deferred Menu/Popover, Paper, Win32, and peer-floor gates.

Callout is unstyled. Its React 19 ref is a presentation handle, deliberately
not the hidden native marker. `content` forwards appearance, accessibility,
events and an actual View ref to one materialized attachment host; arbitrary
host replacement/collapse is not allowed.

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

Request-only veto, precise light-dismiss classification, automatic restoration,
popup-family transactions, modal containment and text fragments are deferred;
no success-shaped substitutes are provided.
