# Popover accessibility

## Retained semantics

The inline root is passive. The trigger is an enabled, focusable native
Pressable with button role and the current expanded/disabled state. Keep
unrelated caller state, labels, hints, and observers. A trigger slot cannot
override the owned role, expanded state, disabled state, or focusability
through another native alias.

The surface name is `surfaceAccessibilityLabel`, separate from the trigger
name. Missing names produce the existing development warning. The optional
TypeScript prop remains semantically required for a named surface.
The first popup content host carries dialog role and that name. Neither the
root nor the native popup window is silently renamed. Closed content is
unmounted, not merely painted invisible.

The content host's role does not prove native dialog-window semantics, a
trigger-controls relationship, child traversal, or an announcement.
Qualify actual AX/UIA content and interactive descendants on each endpoint,
including `content={null}` and large/scaled content. Preserve the
`popover-surface-dialog-semantics` and `popover-haspopup` divergences.

## Reviewed action transport

POP-008 remains the semantic contract: expansion requests true, collapse
requests false, and an already-satisfied request does nothing. Disabled
guards block owned opening and press effects, not the caller's original
accessibility observer or native dismiss cleanup. Named actions never
fabricate a gesture for `onPress`. Invocation aliases are not additional
state transitions.

| Endpoint                     | Source observation                                                                                                | Reviewed adaptation and remaining evidence                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows Fabric, RNW 0.81.35  | ExpandCollapse provider dispatches exact lowercase `expand` / `collapse`; dispatch iterates matching declarations | Declare each owned action once, preserving caller labels. Invoke real ExpandCollapse operations and verify expanded projection plus one callback. |
| Office Win32 0.81.8          | Public View accessibility types declare `Expand` / `Collapse`                                                     | Exact title-case resolver transport; native host dispatch remains unverified. Do not infer it from Fabric behavior.                               |
| macOS Fabric, RNmacOS 0.81.9 | Declared custom action names are exposed verbatim; custom action dispatch returns that exact name                 | Preserve a declared custom-action path; do not equate it with AXPress, AXExpanded projection, or a writable AXExpanded setter.                    |

The coordinator extended Framework Base's shared resolver for expand/collapse
using the observed endpoint names. Resolve the two actions sequentially from
the preceding declarations and compare incoming events against those same
resolved names. Do not resurrect the removed donor helper or duplicate the
transport constants locally.
Deduplication must preserve the first supplied label, exact unrelated custom
names, and original event identity.

The donor companion claimed a root-Yarn RNmacOS Fabric compatibility patch.
There is no such RNmacOS patch in this integration baseline. Installed Fabric
source provides custom actions and `accessibilityActivate` forwarding to
`onAccessibilityTap`, not proof of the donor's AXPress/expanded setter path.
Missing native projection is a native repair/qualification gate, not intended
semantics or a reason to fake a passing native state read.

## Focus and refs

The root View ref is not a trigger, content, or popup-window focus handle.
The trigger slot ref exposes its own native host. Compose public and internal
refs with Framework Base's slot path and preserve React 19 callback cleanup.
A content ref belongs to the content View or a ref-compatible replacement.

Only enabled native self-focus drives the trigger's focus visual. The recovery uses
`useFocusablePressable`, `useFocusVisuals`, and `applyFocusRingStyles`.
Native Windows/macOS rings and custom Win32 rings do not compete.
No `focused` override, decorative control, or programmatic request is proof
that native keyboard focus moved.

The popup content uses `RootInputBoundary` to attach to the existing scene's
input controller without changing themes. It does not trap focus, register a
new global keyboard owner, or supply window activity.

Windows Fabric requests island focus and `First` navigation; macOS can make
the popup key. Neither establishes a portable initial child target. Callout
dismiss callbacks do not expose a reason on these endpoints, so no automatic
trigger restoration is specified. A caller controlling `open` still lacks
that information. See [host feasibility](./host-feasibility.md) before any
Menu or Tooltip consumer claims.

## Planned P evidence

Use native action invocation, actual popup-content lookup, role/name/expanded
reads, and real keyboard traversal as separate assertions. Observe an owned
popup by its unique content identity without activating it first or inventing
a window title. A callback counter or JS prop read is not an AX/UIA result.
Report unsupported projection and pass/fail/skip counts explicitly.
No accessibility run has been executed for this recovery.

## Reviewed external-row composition

The [P1/P2 amendment](./composition-amendment.md) adds no new public
Popover accessibility props. An external anchor is the existing MenuEntry
control, so the composed child must not create another accessible trigger,
apply button/expanded semantics to that row, or redirect the passive root ref.
Menu owns the row's submenu semantics and popup content role after the normal
styling stage. RootInputBoundary and its non-collapsible content View remain.
Native ready and an existing row ref are not AX focus or announcement proof.
The reviewed implementation is macOS-only; native AX/focus evidence is NOT RUN.
