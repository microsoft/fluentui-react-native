# Callout

## Purpose

Callout is an unstyled native primitive that presents children in transient UI
positioned relative to a target ref, registered native anchor, or anchor
rectangle. It remains a standalone package because it owns native code and
CocoaPods integration.

## Contract

- `CalloutProps` extends React Native `ViewProps` with target resolution,
  dismissal callbacks, and `componentRef`.
- `target` accepts a React component ref or registered native anchor string.
  When omitted, native positioning may use `anchorRect`.
- `componentRef` exposes `focusWindow()` and `blurWindow()`.
- Caller-supplied background, border, and dimension values are translated to
  native view style. User `style` is applied last.
- The primitive applies no theme tokens or visible appearance defaults.
  `position: 'absolute'` keeps popup content out of the parent page layout.
  Transparent colors and zero-width/radius values satisfy the macOS native
  layer contract when callers omit border and background props.
- Children, accessibility props, test props, native events, and supported
  Callout behavior props are forwarded to `RCTCallout`.

## Platform behavior

- macOS presents children in a native popup window and supports window focus
  commands through both Paper and Fabric component registrations.
- Windows uses the platform's built-in Paper `RCTCallout` and supplies a
  package-owned Fabric registration for React Native Windows 0.81 and newer.
- Win32 supplies the platform `RCTCallout` implementation and supports native
  dismissal, pointer capture, beak, and focus-restoration behavior.
- Unsupported native behavior remains platform-defined rather than being
  simulated in JavaScript.

## Compatibility

`ICalloutProps`, `ICalloutTokens`, and `CalloutNativeCommands` remain as
deprecated aliases for the modern public types.

## Opt-in Menu focus protocol

`menuFocusManagement` defaults to false. The opt-in applies only to the
package-owned macOS and Windows registrations; its value and new event props
are never sent to Office Win32. Changing the mode requires a new mounted
Callout session. Keep the native host mounted until its close result/dismissal;
unmount is cancellation, not an opportunity to restore focus from cleanup.

The managed host requires a committed native ref anchor and a non-collapsible
content View with usable native layout. Registered strings and rectangles are
not managed anchors. On macOS, child frame notifications and Fabric mounting
finalization establish attachment. Readiness is also retried after content
insertion and after window attachment resolves the anchor: Fabric may finalize
a new subtree before mounting it, and already-sized children need not emit
another frame change. These retries retain the same layout, emitter, generation
and closed-lifetime guards. On Windows, the portal's first-child
layout and mount/final-update hooks establish attachment. No timer or delayed
JavaScript focus retry substitutes for readiness.

`onReady({ nativeEvent: { generation } })` identifies that actual native
presentation. The opaque generation changes on genuine detach/recycle/
replacement. Readiness does not confirm focus or promise that a window is
active when a later command executes.

The existing `componentRef` handle has two additive optional methods:

```ts
focusInitialChild(
  generation: string,
  target: React.RefObject<React.Component | null>,
): Promise<CalloutFocusOutcome>;

closeOwned(
  generation: string,
  reason: 'action' | 'programmatic',
  returnFocus: boolean,
): Promise<CalloutCloseOutcome>;
```

Menu supplies the actual committed native View/Pressable ref, not a retained
renderer tag or the public ref of an unrelated structural container. It owns
item eligibility and applies native `focusable` consistently with disabled
state before requesting focus. Editable controls/field editors, opaque custom
targets and disabled-but-focusable controls are not this bounded protocol.
In particular, RNW's public focusability API does not independently expose
every accessibility-disabled property; managed targets must encode disabled
eligibility in their native focusability. Current agentic MenuItem and trigger
bindings already do so.

The native command resolves a currently mounted descendant in this popup,
checks native eligibility/layout/visibility and intended active ownership,
and observes exact child focus in the active popup before confirming.
Physical popup input supersedes a late initial-focus request. The Promise is
pending until the native result arrives; a void dispatch or retained React
focused snapshot does not confirm it. Ref replacement cannot confirm an old
request, and host detach/disable/new presentation cancels pending Promises.
Already-dispatched native commands recheck native lifetime on the UI thread;
JavaScript cancellation does not retract a command that has already executed.

`CalloutFocusOutcome.status` is `confirmed`, `cancelled`, `not-mounted`,
`not-focusable`, `inactive-window`, `focus-moved`, `unsupported`, or `failed`.
Unsupported on Win32 means these **new managed commands** are not transported
there; it does not label native Win32 Callout or default focus return unsupported.

`CalloutCloseOutcome` contains `status` for the close and a separate
`returnFocus` result: `not-requested`, `confirmed`, `cancelled`, `not-mounted`,
`not-focusable`, `inactive-window`, `focus-moved`, or `failed`. A confirmed
close with `returnFocus: 'focus-moved'` is not successful restoration.
Programmatic close never returns focus, even if `returnFocus` was requested.

### Dismissal and restoration ownership

Native owns bare Escape in managed mode, including empty/all-disabled content.
Menu must not install a second Escape-close handler. AppKit forwards the real
event through the popup window before its owned close; Windows uses a
popup-island `InputKeyboardSource` and the Windows App SDK 1.8
`KeyEventArgs.Handled` member. Modified keys and normal caller observers remain
on the ordinary native key path. Physical ordering/cancellation and once-only
observer delivery still require endpoint qualification.

Owned Escape and action use one native close/return transaction. Native retains
the original anchor/window/root by weak live identity, checks its original
tag/attachment, committed eligibility, current popup ownership and intended
application/foreground window, then hides and rechecks destination/ownership
before returning. An action that has moved focus elsewhere cannot steal it
back. The transaction never activates an unrelated/inactive application or
window. It observes exact anchor focus plus active intended ownership before
reporting a confirmed return.

Outside pointer, application/window deactivation and other platform dismissals
use the truthful `native-light-dismiss` reason and **never return focus**.
Their separate physical causes do not require separate public reason fields.
No experimental light-dismiss `Reason`/`Handled`, SDK upgrade, global key hook,
process-global focus registry or new framework service is used.

`onDismissContext` reports the original generation, a reason (`escape`,
`action`, `native-light-dismiss`, `programmatic`, or `host-detached`), and the
return result. It is emitted only after native hiding. A close result precedes
that context, which precedes the legacy `onDismiss` notification. Native
teardown emits context/cancels the presentation without synthesizing the
legacy dismissal callback. First close wins; a controlled owner retaining
`open` cannot revive the hidden generation.

Legacy `onShow`, `onDismiss`, `onRestoreFocus`, styles, aliases and window
command signatures remain unchanged. Consumers should use one state-close
owner (for example the existing `onDismiss` path), not independently request
close from the result, context and legacy notification. The additive context
does not authorize a JavaScript cleanup refocus.

### Office Win32 compatibility

Keep the existing V1/ContextualMenu path: native `setInitialFocus`, Escape,
light dismissal and **default native restoration**, with no `onRestoreFocus`
override, unconditional JavaScript refocus or managed message transport.
The documented custom `onRestoreFocus` callback disables native default
restoration and transfers responsibility to its caller; it is not an extra
guard to add by default. Neither existing menu family uses FocusManager or
FocusTrapZone for ordinary root Escape/action return.

Win32 remains qualification-pending, not confirmed unsupported. Its prebuilt
host source is not owned here. Actual first-eligible focus, default return,
same-window outside-click destination preservation, deactivation, stale
targets and controlled dismissal flags need native/host-owner evidence.

### Evidence status

Schema grammar and native API usage can be inspected without claiming a live
native result. Codegen regeneration, macOS Paper/Fabric builds, Windows
Fabric builds, physical keyboard/pointer and AX/UIA cases remain separate
parent-scheduled gates. No unit prop assertion proves popup readiness,
active-window focus, Escape cancellation or safe return on an endpoint.
Windows's legacy `focusWindow`/`blurWindow` handlers remain unimplemented;
the managed transaction does not use them.

## macOS Menu-family extension

**Approved owner decision: macos-menu-first (2026-10-02).** The independently
reviewed macOS delta is implemented alongside the existing flat protocol.
This is not a native build/runtime qualification claim. Windows retains the
flat protocol only; full Windows/Win32 Menu admission remains gated on the
named prerequisites below. No managed additions are sent to Office Win32.

### Composition identities

Retain `menuFocusManagement`, `onReady`, `onDismissContext`,
`focusInitialChild`, `closeOwned`, and their existing result/status identities.
Do not add a JS family ID, arbitrary return target, global registry, service,
or parent-activation command. The additive macOS API is:

```ts
// CalloutFocusIntent = 'keyboard' | 'pointer' | 'repair'.
focusOwnedChild(
  generation: string,
  target: React.RefObject<React.Component | null>,
  intent: 'keyboard' | 'pointer' | 'repair',
): Promise<CalloutFocusOutcome>;

// CalloutCloseReason = 'action' | 'programmatic' | 'submenu-back'.
closeOwned(
  generation: string,
  reason: 'action' | 'programmatic' | 'submenu-back',
  returnFocus: boolean,
): Promise<CalloutCloseOutcome>;

// Event type: CalloutMenuPointerMoveEvent.
onMenuPointerMove?: (
  event: NativeSyntheticEvent<{
    generation: string;
    pointerId: string;
    screenX: number;
    screenY: number;
    targetTag: number;
  }>,
) => void;
```

The new native command is
`focusOwnedChild(viewRef, generation, requestId, targetTag: Int32, intent: string)`.
Its private `onManagedOperationResult.operation` is `owned-child-focus`.
It reuses the existing Promise correlation/cancellation and status validation.
`closeOwned` remains the native command with operation `close`.
`onDismissContext.reason` additionally accepts `submenu-back` and `tab`;
neither `tab` nor `escape` becomes a JS-dispatched close reason.
`onMenuPointerMove` is a direct native event with string/string/Double/Double/Int32
schema fields, not a synthesized press, hover entry, or focus confirmation.
`focusOwnedChild` and `submenu-back` resolve explicit `unsupported` without
native dispatch on Windows and Win32. `onMenuPointerMove` is transported
only on managed macOS. Existing Windows flat commands/events are unchanged.
The Windows registration also rejects a direct low-level new focus command
with an `unsupported` operation result; it implements no family behavior.

Popover composition binds the existing mounted Callout handle and forwards
ready/context/pointer delivery; Menu supplies committed row refs and intent.
Those APIs are now available from Callout; Popover's semantic host policy and
external committed row anchoring remain composition-owner work. No change
outside Callout is part of this implementation.

### Family association and close arbitration (N4/N5)

Native derives membership from the **actual mounted row anchor's popup
owner**, not the React position of the child Callout host. A child stores a
weak parent native Callout identity plus that parent's current generation;
the parent stores weak child identities plus their generations. Attachment
requires a live managed parent, exact anchor containment in its popup content,
and an acyclic chain. Resolve the anchor before creating/showing the child
bridge; reject stale/replaced owners rather than falling back to a root family.
Only live associations participate in input containment or family close.

On AppKit the actual anchor's `window` identifies the CalloutWindow/delegate.
Fabric anchor lookup traverses the structural host's native owner/child-window
tree to reach the actual row, not process-global windows or a new registry.
Placement uses that row's native owner window. In the deferred RNW candidate,
`anchor.Root().Portal().UserData()` identifies the package-owned parent;
`RootComponentView.Portal` and `ComponentView.UserData` are installed APIs.
Creating a child DesktopPopupSiteBridge against that actual root rather than
`portal.Parent().Root()` would be necessary. That Windows change is NOT
implemented. macOS retains exact row identity/tag, parent generation and
owner window, and revalidates the chain at every managed operation/input.
The window captures the current generation across event dispatch and rejects
physical input timestamped before the current native presentation's uptime
boundary, so queued input from a recycled lifetime cannot act on a reopened one.

Opening/focusing a child and pointer/key input within any live member do
not light-dismiss ancestors. AppKit containment is restricted to live weak
family associations after binding the real owner. Existing native dismissal
monitors pass the original event through; they do not infer a child from a
pending JS opening request. Windows still needs the separate light-dismiss
decision below.

An action from any member elects the root close transaction. Invalidate the
whole associated subtree before hiding deepest-first; never run child return
transactions while closing the family. Check current **family** focus ownership
and the original root destination before/after hide. Only the root may return
to its original anchor, and only with eligibility, live identity, unchanged
original main-window identity, activity and destination-change guards. The originating command
result uses its originating generation and reports that single root return
result. Each hidden member emits its own original-generation context/legacy
notification once, after the operation result; descendants report
`returnFocus: 'not-requested'`. No duplicate JS close bubbling is needed.

`submenu-back` closes only the current child subtree and optionally returns
to its original live parent row. It is not an action and cannot close a root
as if a parent existed. Native child Escape uses reason `escape` with the same
child-only guarded destination. Root Escape retains its flat behavior.
Both refuse return after the parent row/owner/generation changes or a genuine
external destination takes focus. Never unconditionally make the parent key.
Branch replacement uses `programmatic`/no return; ancestor teardown cancels
descendants without intermediate restores or synthetic legacy teardown
notifications. Keep instant lifetime and first-close-wins arbitration.
Existing directional hints remain unchanged; this extension does not broaden
macOS gap/center/bottom placement or establish RTL/collision runtime evidence.

### Tab close-and-continue (N3)

Native owns bare Tab and Shift+Tab in the currently owned popup. Close the
whole family with reason `tab` and no return; continue the **same physical
key** in the originating root owner's native key loop from its unchanged
opening position. Modified shortcuts, deactivation, changed destinations and
stale generations must not activate an owner or dispatch a guessed next ref.
The original popup key observer is delivered once. Menu must not consume Tab
as collection navigation or dispatch an asynchronous Tab-close substitute.

**AppKit implementation, runtime qualification pending:** CalloutWindow retains
the original NSEvent while sending it through the ordinary popup event path,
intercepts next/previous/following/preceding popup key-view traversal, and then
closes the family. With unchanged native owner/destination guards, it hands
the same NSEvent to the originating NSWindow's `selectNextKeyView` or
`selectPreviousKeyView`. It does not resend or reconstruct a key, make the
trigger first responder, or choose the next control in JavaScript.
Installed AppKit exposes `sendEvent`, `selectNextKeyView`,
`selectPreviousKeyView`, and key-view-following/preceding APIs. The owner must
still have its exact live opening responder and intended active application;
key-window handoff is conditional continuation, not trigger restoration.
RN macOS Paper/Fabric mark the original NSEvent as already emitted when
forwarding key observers. Verify actual observer/default ordering and no
popup-local traversal on both renderers. If the owner/anchor/opening position
changes or activity is lost, close with no return and refuse continuation
with a native diagnostic rather than activating a different destination.

**Windows blocker W-TAB:** the installed RNW 0.81.35 projected APIs expose
`RootComponentView.GetFocusedComponent`, but not `TryMoveFocus`.
`ReactNativeIsland.NavigateFocus` has only `Restore`, `First`, and `Last`;
`Restore` merely recognizes a retained component, not next/previous traversal.
Normal Tab calls internal `RootComponentView::TryMoveFocus`, which traverses
the current popup, departs only at its end, and otherwise wraps. Suppressing
Tab with `KeyEventArgs.Handled` does not continue it in the owner.

SDK 1.8 exposes `InputFocusController.DepartFocus` and
`InputFocusNavigationHost.DepartFocusRequested`, but the installed RNW modal
source explicitly comments out `GetForSiteBridge(DesktopPopupSiteBridge)` with
the recorded microsoft/react-native-windows#14604 issue. This source comment
is not proof that the installed SDK patch still fails. Even successful
departure is not an exposed RNW owner-relative next/previous key loop, nor
does a focus-navigation request carry the original key.
`IInternalCompositionRootView.SendMessage` is documented for non-ContentIsland
hosting and its implementation asserts a separately supplied HWND. It is
not a supported ContentIsland continuation shortcut.

Smallest reviewer choice: require an RNW/host-owner supported, popup-scoped
original-key continuation entry point (or approve a separately evidenced
owned-HWND adapter retaining the original native message and ordinary owner
traversal). No such route is established by this extension. A reconstructed
WM_KEYDOWN, `SendInput`, private implementation cast, owner `First` navigation,
or trigger refocus is not an accepted substitute. Keep full Windows Menu
admission blocked on N3 rather than silently shipping a flat-menu policy.

### Current-child focus and scoped movement (N6/N7)

`focusInitialChild` keeps its existing physical-input supersession guard.
It cannot simply be reused after keyboard input. `focusOwnedChild` shares
target resolution/eligibility/result helpers but has a stricter precondition:
this exact current popup, not an ancestor, must already own native focus in
the intended active app/window. It cannot use the opening-parent
initial-focus allowance or activate another window.
Target attachment, containment, eligibility, generation and exact final
focus are rechecked natively. Empty popup-window/root focus may qualify for
repair. If AppKit still names a removed row as first responder, repair/Escape/
Tab additionally require exact weak identity of this presentation's last
native-confirmed child, no new native window on that child, and the currently
key, visible popup in the active app with its unchanged main-window owner.
A removed-row snapshot alone, a reparented row or an external/editor target
does not prove ownership. Menu owns the logical next row and ref/request
invalidation, never native activity. Ref replacement and newer navigation
cancel obsolete bridge requests; detach and family close invalidate native
lifetime as well. Already-dispatched commands still recheck live native
ownership, and JS cancellation cannot retract a command already executed.
Same-popup input/request ordering remains a regression gate, not an implied
native input-epoch guarantee. No cleanup refocus or timer.
AppKit uses `makeFirstResponder` for all three validated intents; it has no
additional portable focus-modality result here. Repair preserves existing
presentation semantics and never invokes a command/selection.

Scoped movement implementation and deferred platform evidence:

- AppKit: popup-local `CalloutWindow.sendEvent` observes genuine
  `mouseMoved`/drag events with `locationInWindow` and `deltaX`/`deltaY`;
  a popup-content NSTrackingArea (`mouseMoved`, `activeInActiveApp`,
  `inVisibleRect`) supplies movement delivery without a global monitor.
  Require nonzero event deltas and changed screen position against a
  family-local baseline; ignore duplicate/stationary samples. Native input
  supersedes late initial focus across the live family. Preserve ordinary
  event forwarding. Existing RN macOS W3C pointer dispatch
  is feature-gated and cannot be assumed enabled by attaching
  RCTSurfaceTouchHandler alone.
- Windows Fabric (not added by this macOS-first extension): the existing popup `InputPointerSource.GetForIsland`
  exposes `PointerMoved`; RNW itself uses `CurrentPoint`, pointer identity,
  timestamp and position, and ContentIsland's CoordinateConverter.
  `PointerMoved` also fires for button-state changes, so its name alone is
  not displacement evidence. Compare native screen-coordinate samples of
  the same pointer across the weak live family, reject duplicates/zero
  displacement and reset baselines when identity/generation changes.
  Keyboard suppression is cleared only by actual displacement, not
  PointerEntered, a new popup beneath a stationary pointer, or elapsed time.

Emit `onMenuPointerMove` only for qualifying displacement in a live member.
Coordinates are the platform's native screen coordinates, used for movement
comparison, not a portable geometry/placement contract. Native family
delivery does not itself activate a row. `targetTag` is the current event's
nearest eligible native hit/focusable ancestor below **this popup's** content
proxy, or `0` for no matching descendant. Hit-test the original
`NSEvent.locationInWindow` synchronously, converting it with the proxy's
superview `convert(_:from: nil)` before `proxyView.hitTest(_:)`. This is
AppKit's superview-coordinate hit-test contract, also used by the installed
RN macOS RCTSurfacePointerHandler; it is not guessed screen/row-layout math.
Walk only that actual hit ancestry, skipping nonfocusable label/decoration
views. The nearest focusable candidate must pass the existing native
eligibility guard and have a positive Int32 React tag; an ineligible or
untagged focusable candidate yields `0`, not an outer-control promotion.
Never search siblings, another popup, a saved hover rectangle, or a later
hardware mouse position. Recheck live generation/family/owner/activity after
hit-test; preserve the original event's screen displacement evidence.

Menu compares the event's `targetTag` against its current registered,
eligible typed native row refs **for that event only**, and requests guarded
`focusOwnedChild(..., 'pointer')` using the matching live ref. The native fact
alone does not identify a Menu entry: no match, `0`, disabled/removed rows or
ref replacement must not fall back to a retained hovered row or a persistent
tag registry. Never pass the event tag itself as a focus command target.
The JS event validator requires integer `0..2147483647`; Paper forwards the
same Swift dictionary and Fabric emits the same required Int32 field.
Callbacks after hide or from replaced generations do nothing. Preserve
existing row hover and caller observers once. Win32's installed public View
config declares `onPointerMove`/capture and screen-coordinate fields; that
is a compatibility transport candidate, not evidence that the prebuilt
popup host delivers physical movement. Do not send the new event there.

### Windows family light-dismiss decision

**Blocker W-FAMILY-INPUT:** SDK 1.8's reasonless InputLightDismissAction has no
supported family-membership/veto API. `InputLightDismissEventArgs.Reason`
and `.Handled` resolve to SDK 2.0 experimental member documentation, not
1.8. The DesktopPopupSiteBridge parent relationship is supported, but its
existence alone does not document suppression of ancestor dismissal.
Ignoring every dismissal while a child exists, or guessing its cause from
`HasFocus`/foreground snapshots, can swallow outside/no-activate pointer or
other real dismissal input. Do not implement either heuristic.

Smallest reviewer choice: qualify a real child bridge's native ownership and
event ordering, including no-activate outside clicks and modified/system
keys, to establish a trustworthy scoped distinction; otherwise obtain a
host-owner supported family-input route or approve a bounded native
message adapter with exact input origin. Retain truthful no-return outside/
deactivation handling. Membership and close arbitration can be implemented
without inventing experimental SDK members, but Windows N4 is not admitted
until this distinction is established.

### Bounded regression and qualification gate

Retain all flat JS/legacy scenarios and parent fixes: the RNW interop header,
macOS opacity guard, suppressed legacy child-teardown notifications, and
current-anchor placement before managed Show. No concurrent package/root
tests or codegen/native/app lifecycle runs are authorized by this gate.

Pure helper tests cover additive operation/reason identities and request
cancellation. Parent must schedule the authored mocked component tests and
type/build validation for generation/ref cancellation, truthful submenu-back, family result/context
ordering, and Win32 prop stripping with `onRestoreFocus` still unset.
Then qualify native root plus two child levels: both Tab directions reach
the actual external neighbor with one genuine observer/no restore; child
opening and input preserve ancestors; one leaf action hides every member
with at most one guarded root return; child Escape/back returns only to its
live row; branch replacement/anchor loss/rapid reopen cancels old work;
removal/disable repairs only the currently owned popup; empty content stays
Escape-dismissible; keyboard-to-hover suppression survives a stationary
pointer, button-only change, popup reposition and crossing into a child;
outside editor, no-activate target, another window/app and callbacks that
move focus are never overwritten. Test repeat/modifier/key-up cleanup and
controlled true after hide separately.
For the current-event hit extension, additionally qualify label/icon/padded
row hits, disabled/nonfocusable rows and gaps (`0`), occlusion/z-order,
scrolling/flipped coordinates, child-popup crossing, stale row refs and
generation changes during dispatch. A screen-coordinate/native-hit mismatch
must not be patched with JavaScript coordinate arithmetic.

Windows native build/runtime and Office Win32 evidence are unavailable on
this Mac. Source feasibility, codegen/build success and physical/AX/UIA
qualification are separate evidence categories. Existing V1/ContextualMenu
Win32 behavior remains `setInitialFocus`, native Escape/dismissal and default
native restore with `onRestoreFocus` unset, no managed messages to the
prebuilt host, and no unsupported-platform claim.

Parent-scheduled validation, run sequentially rather than alongside another
component's app/build/codegen lifecycle:

```sh
# From packages/native/Callout:
yarn test --runInBand --testNamePattern='^Callout managed focus bridge'
yarn test --runInBand
yarn lint
yarn build

# From apps/storybook; prep regenerates the app-owned native codegen:
yarn storybook prep --macos
yarn storybook --verbose build --macos
```

The pure-helper command was run by this worker. Full mocked component tests,
lint, TypeScript/project-reference builds, native codegen, macOS native build
and physical Paper/Fabric/AX cases are parent-scheduled and were not run by
this worker. The previously reported flat-protocol native pass is not a pass
for this delta. A successful native build still does not qualify the bounded
keyboard/pointer/return scenarios above.

## Demonstration

Interactive scenarios live in
`apps/tester-core/src/TestComponents/Callout/CalloutTest.tsx`, with end-to-end
coverage under `apps/E2E/src/Callout`.
