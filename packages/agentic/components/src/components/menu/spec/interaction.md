# Menu interaction

The [reviewed contract](../SPEC.md) owns the public API. Local code and coverage
are authored; this companion describes ordering, not executed native results.
The 2026-10-02 `macos-menu-first` decision targets full macOS behavior first.
Windows/Win32 Menu use is rejected before rendering; their existing native
menus are compatibility evidence for later admission, not current fallbacks.

## Ownership and entry (MNU-001, MNU-005, MNU-009)

The trigger's existing focusable-Pressable path handles pointer, Return/Space,
and native activation. Menu does not bolt another Enter/Space handler onto
that path. Enabled trigger activation requests the open toggle then forwards
its genuine observer once. Named expansion/collapse requests a stated value,
then forwards the original accessibility event, including disabled/custom
events. There is no opening effect that focuses a stale ref.

Every new presentation chooses the first enabled list entry in logical content
order. Headers, dividers, and disabled entries do not qualify. Selected values
do not reorder content, create a different initial target, or change on focus.
The trigger, popup content host, and command root are different objects.

For macOS, the approved native direction requires an opaque native
ready generation after real popup/content/layout attachment. Menu supplies
the committed chosen child, checks its current identity/eligibility, and awaits
`focusInitialChild(generation, targetRef)`. Ordinary `.focus()` is not also
called. Native physical input supersedes late initial work. Show, committed
React ref, and native readiness are different facts. After entry, navigation
uses `focusOwnedChild(generation, targetRef, "keyboard" | "pointer" | "repair")`,
never initial focus's opening allowance. The family additions are approved
and delivered in the actual Callout and Popover declarations consumed here.
No local native event/status union or unsupported method signature replaces them.

Empty/all-disabled menus contain no focusable command. Native Escape and
light-dismiss must still work, with accessible content retained. No dummy row,
timer-based retry, or close-on-empty shortcut is allowed.

## Collection keys (MNU-007, MNU-008)

One local Menu collection owner handles navigation per popup. Eligible rows
stay natively focusable; the implementation must not disable inactive rows in
the leaf just to mimic HTML tabindex. Menu does not import production FocusZone.
Native key descriptors are transport/cancellation, not another navigation
loop. macOS descriptors register only the unmodified navigation keys owned
here, never Escape or Tab. Typeahead operates on delivered printable text.
Qualify AppKit default cancellation and original delivery rather than assuming
JS stopPropagation controls the native key loop.

Unmodified Up/Down wrap through eligible sibling order. Home/End choose its
first/last entry. Repeated arrows may navigate repeatedly; they never activate.
In LTR, Right opens a row's submenu and Left leaves the current submenu;
RTL reverses those horizontal keys. Home/End and vertical order do not reverse.
A horizontal open arrow on a non-submenu row does nothing; a root back arrow
does not dismiss the root.

Character navigation searches forward from the current row, wrapping once,
for a primary label/textValue beginning with the entered character. Trim
leading whitespace and use consistent case normalization on input and labels.
Repeated same-character input cycles through matches. No-match and a sole
current match do not make a redundant focus request. This first API is
single-character search, not a timed multi-character buffer or fuzzy search.

Use the native `key` for printable text, never infer letters from scan-code
`code`. Exclude Return/Space activation, dead/composition keys, modifiers used
for shortcuts, and multi-character non-text names. Shift needed for an actual
printable character is allowed; Ctrl/Alt/Meta shortcuts and Shift navigation
remain delegated. Native IME/composition delivery and Unicode character
recognition are explicit qualification points; the current framework event
type alone does not expose every composition fact.

The leaf's original key observer runs once before cancellable JS collection
navigation; cancelled/modified/non-self events are not navigated. Native
handled-descriptor matching can already have occurred, so this does not
promise a veto of native handling. Exact endpoint descriptor fields and phase
must be reviewed. Do not catch all printable keys globally or consume editors.
Return/Space and their keyup/press cleanup remain with MenuItem's existing
shared activation path. Observer forwarding is not another invocation.

## Commands and checkable requests (MNU-003, MNU-009, MNU-013)

For a valid enabled command, deliver `onAction` and the original `onPress`
observer once, then initiate action-close. The callback can update externally
owned selection or navigate/focus elsewhere before the native return decision.
Menu never chooses radio peers or flips the leaf's selected prop itself.
Checkable commands also close; persistence is not implicit in checkbox mode.

Named Toggle/Select uses the shared resolver's exact declared event name,
enters the same semantic action-close operation, and forwards the original
accessibility observer once without invoking `onPress`. A radio Select means
request selected, not toggle off. A checkbox Toggle means request the inverse
of the caller's current value. The callback owns the actual update.
Submenu Expand/Collapse changes only submenu state and forwards its original
observer; it is not a command action.

The approved eventless AX amendment uses the real native onAccessibilityTap
callback directly. Commands/checkable commands call onAction(undefined), then
onAccessibilityTap() once, then guarded action-close. Checkbox means request
inverse selected and radio means request selected; the caller owns the update.
Submenu tap requests open only, then forwards its observer. Root trigger tap
requests the same open toggle as press, then forwards its observer.
Disabled/stale guards block owned effects, not the native observer.
No fabricated native event, onPress synthesis, alias matching or second
Toggle/Select invocation is added. Original press/named events still pass
through unchanged; only a genuine eventless route supplies undefined.

Respect macOS keydown activation and release cleanup.
Scope close, blur, disable, or replacement cancels stale press pairing.
Do not copy V1's module-global key flag or add a post-dismiss reopening delay.
Surface invalid input/native operation failure through repository-standard
diagnostics with entry/status information. Do not swallow callback exceptions
or turn unsupported/failed requests into confirmation.

## Close/return matrix (MNU-010, MNU-011, MNU-012)

On macOS, bare Escape belongs to the popup-local native owner.
Menu's JS key handler does not consume it, issue a second close, or add an
Escape request/ack timer. Modifiers and genuine original key observers remain
available exactly once. Escape must also work without any eligible row.
Escape and command action share the guarded native close machinery, but have
different scope: child Escape closes that child's subtree; action from any
member elects one root family-close transaction.

Commands use `closeOwned(generation, "action", true)` on the originating
member after the genuine action/observers. Do not request false/unmount first:
the host must stay mounted through native hide/result/dismissal. Native
invalidates all members, hides deepest-first, and permits only root return.
The originating result precedes member dismissal contexts and legacy dismiss
notifications. Children report no return; no JS action-close bubbling is needed.

Owned return is conditional on the original live eligible anchor, relevant
popup focus ownership, active intended application/window, and no destination
change. Native hide and return checks belong to one transaction. A caller
action that already moved focus elsewhere closes without return. No JS blur/
focus-window sequence, cleanup restoration, or delayed refocus follows.

Outside-pointer, deactivation, and other platform light-dismiss origins can
share the truthful `native-light-dismiss` class because all close with **no
return**. Test pointer and deactivation separately. Do not infer the cause
from blur, timing, modality, a pending action, or a later window observation.
Programmatic close, anchor loss, teardown, and Tab exit also request no return.
The first native close wins; later requests/results are stale.
Programmatic branch closure uses `closeOwned(generation, "programmatic", false)`.
Native programmatic close never returns even if a caller requested it.

Use dismissal context to invalidate the generation/visibility and legacy
onDismiss as the single ordinary false-state request owner. Results/context
must not add second requests. Teardown context has no synthetic legacy dismiss:
real anchor/ancestor loss uses the separately owned lifetime-close path once.
Keep original native show/dismiss/context/movement events and observer delivery
intact. A rejected stale/cancelled operation is not success, and a confirmed
close with returnFocus=focus-moved is not restored focus.

Controlled true after native hide is only a requested value. The hidden host
does not reopen automatically. A subsequent intentional opening needs a new
presentation lifetime, with old readiness/results invalidated.
The actual Popover session holds closing transport until terminal dismissal.
Menu keeps requested state separately from invalidated native visibility.
Holding controlled true does not recreate a hidden popup; an explicit later
open request or false/true prop transition re-arms a presentation key/open
boundary. No timing inference or automatic hidden-true remount is used.

## Tab exit and focus loss (MNU-011)

Tab and Shift+Tab leave the **entire menu family**, close it without returning,
and retain the natural previous/next external destination. They do not cycle
through all menu rows or become a trap. Do not guess an external control from
React sibling order or suppress Tab without a real native continuation path.

The approved macOS family delta delegates bare Tab and Shift+Tab to native.
Native retains the original NSEvent, forwards the popup's genuine key observer
once, prevents popup-local traversal, hides the whole family with reason `tab`
and no return, and continues in the original owner's AppKit loop from its
unchanged opening position. Current activity, live owner, and unchanged
destination guards are required. No replacement key event, guessed next ref,
trigger restore, or unconditional parent activation is used.

Menu forwards but never consumes Tab, dispatches Tab close, or duplicates
native continuation. Modified Tab shortcuts remain native/caller-owned.
Physical observer/default ordering and both natural destinations remain
required evidence even after native implementation. Windows Tab continuation
is still gated; V1 MenuGroup Tab is not evidence of macOS family exit.

A row blur alone is not family exit: focus may move to another row, a child
popup, or a native accessibility target. Native light-dismiss/family ownership
must distinguish those cases. No broad JS focus-loss close listener is assumed.

## Pointer and hover (MNU-015)

Row hover focus is Menu-owned, never an activation or selection. After keyboard
navigation, ignore stale/synthetic hover transitions until genuine pointer
movement within the current family establishes pointer intent. The approved
`onMenuPointerMove` carries the original native event with generation,
pointerId, screenX, screenY and targetTag. Native emits it only for displaced movement
in a live member and hit-tests that original event. Menu rejects stale
generations and matches targetTag to its currently registered eligible native
row refs. Zero/unmatched/disabled/removed targets cause no focus or activation.
The tag is never dispatched as a focus target or persisted in a registry.
Hover entry alone, button-only change, duplicate/zero displacement,
a new popup under a stationary pointer, and elapsed time do not clear keyboard
suppression. These coordinates are native movement samples, not placement
geometry or a public window snapshot.

Use guarded `focusOwnedChild(..., "pointer")` only with that member's current
native ownership. Do not supplement rejection with ordinary focus or force
pointer/keyboard modality. Preserve existing leaf hover state/observers once.

Pointer hover of a submenu row requests expansion without executing a command.
Pointer opening has no arbitrary dwell delay. Moving into its child popup keeps
the parent branch open; moving to another sibling replaces the old branch
without returning to its row. Pointer leave alone neither blurs the row nor
proves outside dismissal. Trigger hover-open is not proposed.

Native scoped AppKit tracking, original-event hit testing and actual-anchor
family own genuine movement and containment. Leaf hover remains its visual/
observer path and cannot select a row from later pointer samples. Menu keeps
family-scoped suppression, supplying no native family-ID prop.
For a different sibling branch, await native programmatic/no-return close
before current-owner pointer focus; each continuation checks the original
point, lease, generations and row registration. Parent/child handoff needs
physical qualification:
focusOwnedChild cannot activate an inactive ancestor merely because the pointer
is above it. Required hover behavior is not waived if that ordering is missing.

## Submenus and lifetime (MNU-016, MNU-017, MNU-018)

The actual row is the anchor; never render a second trigger Pressable or use
the parent container as the anchor. Prefer inline-end with row-top alignment
and collision handling. Opening the child must not light-dismiss its ancestors.
An inside-family press is not a root outside click.

Native derives weak parent/child membership from the actual mounted row's
CalloutWindow owner and generation, not structural React ancestry. Validate
live containment and an acyclic chain before showing a child. Native family
containment preserves ancestors while a child opens/focuses or receives input.
Menu does not register an arbitrary parent/family ID.

Native Escape closes the current child subtree and safely returns to its
original parent row. The approved extended command
`closeOwned(generation, "submenu-back", true)` handles the back arrow honestly.
It is invalid on the root; do not call it action or replace it with row.focus.
Keyboard/press/Expand opening enters the child's first eligible item after
ready. Hover opening remains conditioned on genuine movement and owned focus.

A leaf action closes descendants and root atomically through the originating
native command, without JS root-close bubbling or intermediate child returns.
Pointer branch replacement, ancestor close/disable/detach, content replacement,
or root unmount invalidates
descendant sessions with no restoration. Two submenu levels require no cycles,
no reused stale generation, and one independently registered collection per
live popup.

Membership order comes from validated content, not ref timing. Registration
uses entry ID, live target generation, and a registration epoch that rejects
old cleanup. Reorder preserves a live active row. Removal/disable cancels
pending work and repairs the logical next entry without calling selection
or action. Repair picks the next eligible row at the removed row's old logical
position, otherwise the preceding last row; disabling uses the same search.
If none remains, clear active/pending entry and keep native Escape/Tab available.
Native repair uses `focusOwnedChild(..., "repair")` only when this exact popup
still owns current active native focus, including a valid empty popup owner.
It never activates another window or uses a retained removed-view focus
snapshot as authority. Native rejection preserves outside focus and is reported.

Every close/unmount unsubscribes and cancels idempotently. Same-host callback
handoffs preserve identity; true detach/replacement invalidates the old target.
No focus work occurs during render or unmount cleanup. No entrance/exit
animation or delay postpones invalidation.

## Later Windows/Win32 admission (MNU-012)

No active Menu path is supplied on these endpoints in this revision. Explicit
use-time rejection must be tested, not mocked success or a hidden empty popup.
For future Win32 parity, retain native setInitialFocus, bare Escape/light-dismiss
and default restore with onRestoreFocus unset. No new managed message, JS
refocus, cleanup timer or custom restore override is added to prebuilt REX.
Existing V1/legacy policies and their separately authored tests remain research
evidence only, with their differences stated in feasibility.
