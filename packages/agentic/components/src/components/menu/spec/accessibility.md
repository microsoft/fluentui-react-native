# Menu accessibility

Full macOS Menu is the first delivery target under `macos-menu-first`.
Windows/Win32 Menu use is explicitly gated before any native subtree exists.
Their UIA parity obligations remain future admission work, not a fallback path
or an implication that native Win32 Callout has no restoration capability.

## Native semantic targets (MNU-002, MNU-006, MNU-013)

The inline root is passive and not a keyboard stop. Its ref does not identify
the popup. The trigger is an enabled/disabled button with expanded state and
its own name. The first non-collapsible popup content host receives menu role
and `surfaceAccessibilityLabel`. Its accessible grouping must not collapse
the independently accessible entry roots into a single AX node.

This grouping is a qualification obligation: setting `accessible=true` and
`role="menu"` in JS is not proof of AX descendant exposure. If the renderer
cannot preserve both named grouping and items, record the exact projection
gap; do not quietly remove the menu role or substitute a dialog.
Closed/native-invalidated content contributes no live command target.

MenuEntry retains the native Pressable produced by MenuItem.
Command rows expose `menuitem`; radio and checkbox commands expose the
corresponding menu-item role with caller-owned checked state, including false.
Submenu rows expose expanded state and a submenu hint, without invented
cross-window `controls` relationships. Aliases cannot override owned roles,
disabled, checked, expanded, or focusability.
Unrelated consumer accessibility state/actions/labels survive.

Disabled rows remain visible and labeled but nonfocusable/nonactivatable,
matching agentic MenuItem. Screen-reader discoverability must be tested
separately from the arrow loop. Headers keep their existing noninteractive
`none` role; Divider keeps separator semantics. Headers are not falsely
described as native named groups. Decorative indicators are inaccessible and
cannot create a second Toggle/Select focus target.

Each submenu has its own required surface name. The parent row and child menu
must be discoverable as related controls through supported native semantics
and actual announcements; a chevron or JS expanded value alone is not evidence.
Caller textValue affects character navigation only, not the accessible name.

## Native action transport (MNU-009, MNU-013)

Use the shared `resolveAccessibilityAction` for checkable Toggle/Select and
submenu Expand/Collapse. Resolve sequentially when more than one action is
owned. The same resolution supplies declarations and exact event comparisons.
macOS custom actions use the resolver's declared title-case names. Keep caller
labels, custom names, event identity, and one observer delivery. Windows
lowercase and Win32 title-case transports are later parity references, not
current Menu support.

A named checkable action requests the caller's selection through onAction and
action-close; it never synthesizes a press. A submenu named action requests
its self-driving expansion/collapse without activating a command.
Disabled/custom actions still reach the original observer once.
Ordinary command invocation continues through the existing Pressable/native
press path. Real macOS Fabric eventless activation has the distinct path below;
do not invent an Invoke resolver entry or synthesize an AXPress-to-onPress event.

### Default AX activation amendment

Read-only inspection of installed RNmacOS Fabric
`RCTViewComponentView.mm::accessibilityActivate` shows only the declared
`onAccessibilityTap` callback being emitted, otherwise returning NO.
Pressability's handler set supplies onClick/keyboard/responders but no
onAccessibilityTap-to-onPress adapter. The public View callback is typed
`() => void`. The user explicitly approved, and the coordinator ratified on
2026-10-02, `onAction?: (event?: MenuActionEvent) => void` for this real
eventless path. MNU-001/003/009/013 are amended; native pin/provenance is unchanged.

The owned command receives undefined once, followed by the caller's original
eventless tap observer once, then guarded native action-close. No press or
action event is fabricated; no onPress, named Toggle/Select, tap/invoke alias
or additional activation path is called. A command observer may move focus
before close; native still decides whether return is permitted.

Eventless checkbox activation requests the inverse of caller-owned selected.
Eventless radio activation requests selection, never deselection; already-
selected radio invocation still reaches its command once. These semantics are
implemented by the caller's onAction callback reading/updating its own state,
not by Menu mutation. Submenu AX activation requests open only and forwards
the tap observer; it cannot execute/close a root command. Root trigger AX
activation requests the normal open toggle and forwards its observer.

Disabled controls suppress owned activation while delivering the genuine
native tap observer once. Stale/no-ready row presentations similarly forward
the observer without executing a command. Real press and named-action paths
retain exact event identity and callback order; those paths never call the
tap observer. This resolves the earlier event-shape/API blocker. Actual AX
activation, projection and announcements remain native runtime gates.

Verify actual macOS command activation and declared AX custom actions
independently, including native checked/expanded projection. Later Windows
admission also needs Toggle/SelectionItem/ExpandCollapse/Invoke patterns.
A physical click
followed by a checked read is not action-dispatch evidence. Current renderer
action declarations do not establish every native pattern, default assistive
gesture, state projection, or announcement.

## Focus, visibility and return (MNU-005, MNU-010..MNU-012, MNU-019)

Actual native self-focus on a live eligible entry drives its focus visual.
Use the existing shared macOS native policy, without adding a new ring override.
MenuItem's custom fallback geometry/colors remain styling-stage responsibilities.
Hover must not produce
a keyboard ring by forging keyboard modality. Scene input is shared through
Popover's RootInputBoundary, not another ThemedRoot or global focus service.

Managed initial and owned-child focus confirm native target and current popup
owner, not just a ref method call. Native derives submenu families from live
anchor owners. Child Escape/submenu-back returns only to its parent row; leaf
action closes the whole family with at most one guarded root return.
Native Tab/Shift+Tab continue the original event through the natural owner
loop, never through a synthesized press or trigger-ref restoration.

Future Win32 first-child focus and return must remain delegated to existing
native Callout. No onRestoreFocus override is supplied: that documented
callback opts out of default native restoration. The macOS-first gate does
not alter existing Win32 Menu/ContextualMenu behavior.

Outside click, deactivation, teardown, and natural Tab departure must not steal
the destination. Escape/command return is conditional, not an unconditional
accessibility repair. A live menuitem snapshot in an inactive window does not
authorize refocusing it. Accessibility exploration and AppKit first responder
are not the same focus.

## Required native evidence (MNU-020)

Observe the owned popup without activating/selecting a window to inspect it.
Assert menu and item roles/names, enabled/disabled and checked/expanded state,
native target focus, action count/order, and announcements separately.
Run keyboard and assistive invocation entry, empty/all-disabled content,
headers/separators, root plus two submenu levels, and both Tab exits on macOS.
Assert keyboard-to-hover suppression using real movement and unchanged active
window ownership, not a mocked hover event or counter.

Current RNmacOS disabled/selected projection and desktop-driver named-action/
passive-popup lookup limitations are infrastructure gates, not intended Menu
semantics. Report unsupported reads/actions and skipped critical cases
explicitly, never with default false/true values or rendered-text proxies.
There are no executed Menu AX or VoiceOver results in this worker. Windows/Win32
UIA/Narrator results are gated separately; they are not silently inferred from
macOS.
