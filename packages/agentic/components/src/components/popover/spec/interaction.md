# Popover interaction

## Open-state ownership

Defaults remain closed, enabled, and `bottomLeftEdge`. Pressing the enabled
trigger requests the opposite open value, then forwards its genuine press
event once. Named expand/collapse request explicit values rather than toggle.
Controlled `open` is externally owned. Disabling an open trigger does not
prevent a later native dismiss event from requesting false.

Retain the original review repair separating activation guards from dismiss
cleanup. A blanket disabled `useToggleState` binding would suppress cleanup.
Implementation must use the existing controllable-state mechanism with
activation-specific guards, or an approved equivalent, and suppress
already-satisfied named requests. An observer runs after the request; it is
not promised synchronously updated React state.

`useFocusablePressable` owns Pressability, native self-focus, pointer-focus
policy, and platform key pairing. macOS activates on keydown and cleans up on
release. Windows/Win32 activate on the paired keyup. Do not add another
Enter/Space action path. Preserve caller handlers, repeat/modifiers, blur/
disable/replacement cancellation, and native press cleanup.

## Attachment and host lifetime

The donor's required `useSlot(Callout, ...)` executes Callout's phased hooks
in the Popover hook even while closed. Callout resolves its target in a
layout effect depending only on the target object. A later `.current`
replacement is not a new dependency, and a popup unmount does not detach
those pre-expanded hook lifetimes. This is a recovery issue, not a supported
native readiness contract.

Implemented bounded adaptation:

1. Keep the public passive root ref separate. Compose trigger public,
   focus-target, and anchor refs through the existing slot runtime.
2. Resolve committed live anchor attachment, not a render-time tag. Preserve
   a generation for genuine target replacement and ignore stale cleanup.
   Same-instance callback handoff must not tear down a valid popup.
3. Keep Callout behind an optional slot or a normal mounted React boundary
   so its phased hooks execute only with the open host session. Do not call
   hooks conditionally in Popover or pre-expand them while closed.
4. Bind each host session to the current committed anchor generation.
   Because Callout observes the ref object's identity, genuine replacement
   needs a fresh target object/session; mutating a stable `.current` is
   insufficient. Never forward a stale renderer tag.
5. An initially open Popover waits for its trigger attachment before mounting
   the host. Do not create a Callout with no target and adopt `(0, 0)` as
   successful placement. A genuine anchor loss after presentation invalidates
   that host and requests close once; a controlled owner may retain requested
   `open`, but cannot keep a stale host alive.
6. Reject old host-session dismiss callbacks after replacement/unmount.
   No focus request or restoration runs in cleanup. Diagnose an unsupported
   ref/attachment using repository-standard development notification rather
   than silently claiming an anchored popup.

Default-open, rapid close/reopen, ref object/callback cleanup, compatible root
and content replacements, genuine trigger replacement, stale-dismiss, and
unmount scenarios have focused authored tests, pending parent execution. There is no approved
native target-registry repair or global workaround hidden in this proposal.

## Popup input boundary and appearance

The first non-collapsible content host uses `RootInputBoundary`, retaining
the existing 200-unit measurement floor, and carry the visible boundary.
This attaches physical popup events to the existing scene controller without
introducing another theme or controller. Keep boundary style/theme identity
immutable and preserve event observers.

The boundary observes modality; it is not Menu navigation, a focus trap,
window activity, or an Escape guarantee. No new focus scope is introduced.
Use the shared optional ring on the actual trigger and apply shared ring
styles in the styling phase. The approved recovery removes the donor's
forced all-modality `focused` API.

## Placement and dismissal

Forward a preferred directional hint and adopt native geometry. macOS
collapses alignment variants and performs partial flip/slide correction.
Windows Fabric uses native work-area popup positioning, not the donor's
claimed absence of repositioning. Oversized-content containment and Win32
host geometry remain unqualified.

macOS has cancel, outside-left-click, application-resignation, and menu
tracking paths. Windows emits dismissal from the platform light-dismiss
action without identifying the trigger. Win32 host declarations are not
implementation evidence for event order or reasons.

Every native dismissal requests false. The callback does not distinguish
Escape, outside click, deactivation, or focus leaving the popup, and the
public boolean callback is intentionally not widened in this recovery.
Native hide can happen before a controlled owner changes `open`; leaving
`open` true is not permission to assume the hidden host reshows.

No unconditional restoration, React-ancestry key listener, global key
monitor, timer, or delayed focus retry may turn these gaps into guarantees.
macOS key-window commands are real but do not select a child or establish
active parent eligibility. Windows key-window commands are `nyi`.

## P versus FM

P qualifies this bounded host, its geometry/lifetime, theme/modality, and
content semantics. Menu additionally needs an approved initial-item target,
popup-local keyboard owner, Escape/outside-click/deactivation reasons,
and active-window guarded restoration. Those interfaces are not present in
Popover's boolean state channel. See [host feasibility](./host-feasibility.md).
No native run or readiness claim accompanies this recovery.

## Reviewed Menu composition amendment (POP-014..018)

The [P1/P2 amendment](./composition-amendment.md) was approved on 2026-10-02
and implemented as opt-in composition, not a change to ordinary Popover.
It specifies a macOS-only owner-initial-focus policy, current host binding,
native generation/lease invalidation, exactly-once original event forwarding,
and a context-to-legacy close barrier. It requires explicit intentional
rearming of a managed controlled-true presentation after native hide.

External mode uses MenuEntry's committed literal native row ref and mount
generation with its existing FocusTarget lifetime. Popover retains all anchor/
session logic and renders no second trigger. Ref handoffs preserve the same
host; genuine detach invalidates live work immediately. There is no
FocusTarget request, timer, or restoration from Popover cleanup.
The adapter consumes actual exported native family methods and pointer
types. Native execution and family qualification remain separate gates.
Ordinary policy and endpoints are unchanged.
