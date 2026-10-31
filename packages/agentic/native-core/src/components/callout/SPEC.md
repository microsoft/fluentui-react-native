# Modern Callout

Owner-authorized initial contract, 2026-10-02. `/macos` and `/windows` preview
only, with a constrained [`/win32` adapter](#win32-adapter); not all-host root
admission. See the
[package qualification gates](../../../references/remaining-work.md#qualification-and-admission-gates)
for remaining geometry, lifecycle/accessibility, Menu/Popover, Win32, and
peer-floor work and the owning workstream issues.

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

## Popup consumer amendments

Pre-code contract review, October 16, 2026, against the existing macOS
`NativeFocusService`, Windows `FocusWithin`, and the owner's popup decisions that
native presence is authoritative (with a latch and rearm) and that every open
requests entry focus through a `first` strategy:

- `requestFocus(presentation, target, options)` also accepts `first` and `last`.
  These strategies search eligible descendants of the current presentation in
  native order; they never include the hidden native marker. As in FocusZone,
  a focusable enclosing stop takes precedence over its descendants. An empty
  search reports `not-mounted`, not confirmation. The consumer may then request
  its explicitly focusable content container by its live target.
- A strategy request retains the same readiness, cancellation, generation,
  active-window, and actual-focus checks as an explicit-target request.
- Native dismissal reports `escape`, `outside-pointer`, or
  `application-deactivated` only at a branch that observes that cause.
  `native-light-dismiss` remains valid for unclassified native notifications,
  including the Windows App SDK light-dismiss event. No cause is inferred from
  focus state. `programmatic`, `anchor-lost`, and `host-detached` are unchanged.
- These changes apply only to the experimental modern protocol. Legacy
  registrations and the legacy JavaScript API remain unchanged; no new command
  is sent to a prebuilt Win32 host.

Wrapper and type regressions belong in `modern.test.tsx` and
`modern.types.test.ts`; native entry-strategy and dismissal cases belong in
`Callout.stories.tsx`. CocoaPods module/Office bridging-header builds and both
macOS renderer runs remain mandatory qualification, not consequences of a
passing JavaScript test.

Pointer input outside the popup family, Escape in focused content, and losing
the host report their observed cause or `host-detached`. Input in a nested
popup does not dismiss the popups that own it. Closing a presentation that
holds keyboard focus returns input to the owner window's retained focused
component; outside input that already moved focus is not overridden. Whether
a pointer-opened trigger is that component follows its pointer-focus mode:
Windows and Win32 focus a pressed trigger by default, macOS follows AppKit and
keeps the previous first responder, and `pointerFocus: 'always'` focuses the
trigger on every platform. On
Windows, outside input is observed for the owner island and other application
windows; application deactivation dismisses only presentations that hold
focus. A Menu still restores its trigger explicitly after an item closes it.

Request-only veto, complete light-dismiss classification, policy-driven
restoration, popup-family transactions, modal containment and text fragments
are deferred; no success-shaped substitutes are provided.

## Popover surface amendments

Pre-code contract review, October 19, 2026, for the Popover consumer contract
(`packages/agentic/components/src/components/popover/SPEC.md`). These apply only
to the experimental modern protocol; legacy presentations keep their current
backdrop, window, and dismissal behavior.

- **Unstyled popup window:** a modern presentation draws no native backdrop
  material. Its popup window is transparent, so the content View defines the
  visible fill, stroke, and rounded silhouette. macOS previously drew the
  `.menu` vibrancy material behind modern content; that material remains only
  for legacy presentations.
- **Native elevation:** a modern popup window has the platform window shadow,
  derived from the content's opaque silhouette and refreshed when the content
  changes size or remounts. Transparent content casts no shadow. A JavaScript
  View shadow is not used because the window is sized to its content.
- **Anchor input:** pointer input that lands on a live view anchor does not
  light-dismiss the presentation. The anchor's owner decides what that input
  means; a trigger toggles its popup instead of having it closed and
  immediately reopened. Rect and point anchors keep ordinary outside-input
  dismissal.

macOS implementation qualification added two guarantees that Popover relies on:

- **Popup Tab order:** Tab and Shift+Tab move through focusable content within
  the modern popup and wrap there; the owner's Tab order is not continued
  (#4377). macOS derives the popup's key-view loop when it presents and
  recalculates it as content changes.
- **Command ordering:** a `requestFocus`, `close`, or `reposition` command
  observes every content update React committed before the command was
  issued, so a consumer can make content focusable and target it from the next
  effect. macOS Paper queues these commands behind pending view updates, as
  Fabric already does; the legacy `focusWindow` and `blurWindow` commands are
  unchanged.

macOS implements these in the shared Swift view for Paper and Fabric, with
command ordering in the Paper view manager.

## Menu family amendments

Pre-code contract review, October 19, 2026, for the Menu and MenuButton
consumer contracts (`packages/agentic/components/src/components/menu/SPEC.md`
and `menu-button/SPEC.md`). These apply only to the experimental modern
protocol.

- **Tab exit:** a modern presentation accepts
  `tabNavigation: 'cycle' | 'dismiss' | 'continue'`, defaulting to `cycle`,
  which keeps the popup Tab order above. With `dismiss` or `continue`, Tab and
  Shift+Tab in the popup, or in a modern popup it owns, dismiss the outermost
  such presentation in that ownership chain with the reason `tab-forward` or
  `tab-backward`, before any view in the popup handles the key. `dismiss`
  then leaves the owner window's retained focus in place. `continue` instead
  focuses the next valid key view after the presentation's view anchor for
  Tab, and the anchor itself for Shift+Tab, falling back to retained focus
  when that view is not eligible.
- **Nested presentations:** a presentation whose view anchor lies in another
  modern popup is owned by that popup's window. Input in it does not dismiss
  its owners (unchanged), and when an owner closes, its owned popups leave the
  screen with it. Each nested presentation still reports its own dismissal.

macOS implements both in the shared Swift view for Paper and Fabric. Windows
implements both in its Callout view: a keyboard hook on the focused popup's
thread routes Tab to the outermost Tab-exiting presentation, and an owner's
dismissal also dismisses the popups it owns.

Windows Fabric asks DWM to round a modern popup window and give it the
platform popup shadow, with no DWM border, so the content View draws the
visible stroke. Light dismissal from a press over the live view anchor waits
up to 250 ms for the anchor to receive that press. If it does, the anchor's
owner handles the press. If it does not, the popup closes as
`native-light-dismiss`. The owner-island pointer handler ignores presses over
the anchor.

## Win32 adapter

`@fluentui-react-native/native-core/win32` exports `Callout` as a JavaScript
adapter over the Office Win32 host's prebuilt legacy `RCTCallout` registration.
The adapter sends no modern prop or command to that host, so it implements the
modern props and presentation handle in JavaScript. It requires a host whose
view manager is registered. These divergences are host limits:

- **Anchors:** only view anchors are supported; rect and point anchors throw.
  The host positions against the view's native tag and has no screen-measure
  API from which to derive a rect.
- **Placement:** side and alignment map to the host's directional hint. The
  host ignores `gapSpace`, so the popup sits flush against its anchor.
- **Surface:** the host's layered popup window has no per-pixel transparency.
  The adapter therefore lifts the content's `backgroundColor` and
  `borderRadius` to the host, which draws the fill, the rounded corners, and a
  window shadow. A one-pixel shadow artifact can appear at a bottom corner.
- **Readiness and focus:** each presentation remounts the host, and the host's
  show event reports readiness. By default the host gives the popup initial
  focus, which it does before readiness. `requestFocus(…, 'first')` confirms
  only if that focus reached the content; otherwise it reports `not-mounted`.
  The adapter-only `initialFocus: 'none'` prop shows the popup without taking
  focus, and `'first'` then reports `unsupported`. An explicit target is
  focused through `focusWindow` and confirmed by its focus event. `'last'`,
  `close`, and `reposition` report `unsupported`; a caller closes the popup by
  setting `open` to false.
- **Event boundary:** Win32 bubbles content focus, blur, and key events
  through the React tree, past the popup to its owners. The content stops them
  after its handlers run, as a separate native window would.
- **Tab exit:** the host cycles Tab within the popup whatever the props say.
  With `dismiss` or `continue`, the adapter declares Tab and Shift+Tab on the
  content and dismisses the outermost Tab-exiting presentation in the React
  ownership chain when content receives either key. The host cannot continue
  Tab in the owner window, so `continue` focuses the view anchor for both
  directions.
- **Dismissal:** the adapter disables the host's own Escape handling and
  reports Escape in focused content as `escape`. All other host dismissals
  arrive unclassified. They fire at pointer-down, before the anchor's press,
  so the adapter holds them for 250 ms. A caller close in that window, such as
  a trigger toggle, supersedes the hold. Otherwise the adapter reports
  `native-light-dismiss`.
- **Restoration:** the host does not move focus when the popup closes. The
  consumer restores focus after Escape and after a caller-driven close.

Adapter regressions belong in `Win32Callout.test.tsx`; host behavior is
qualified by the Win32 Popover, Menu, and MenuButton stories.
