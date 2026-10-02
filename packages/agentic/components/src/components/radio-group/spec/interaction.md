# RadioGroup interaction

RGR-004 through RGR-010 define one group-local selection/navigation owner.
These policies passed independent review. Local implementation and regression
tests are authored; package execution and actual endpoint evidence remain
coordinator-owned.

## Selection transaction

The group passes a boolean selected value to every unchanged Radio stage.
Group selection uses `useControllableValue<string | null>` with explicit
no-op suppression: that helper otherwise invokes its callback on every setter.
`selectedValue=undefined` is uncontrolled; `null` is a controlled empty
answer. The default is null, not the first enabled option. `required` never
alters initial selection.

An enabled pointer/native press or semantic Select requests that item's
value. A navigation key requests its resolved destination. If it already
equals the current answer, there is no change callback. A press observer
still receives a real enabled press once. An arrow never calls an item's
press observer, and a Select event never synthesizes one.

In uncontrolled mode the answer commits locally. In controlled mode report
one request per distinct input action needing a change and render only the
parent's value. Repeated independent actions while a parent refuses a change
may report again; bubbling, keyup, native press, and Select must not duplicate
one physical/native action. A repeat that resolves to the already checked
item is a no-op. An outstanding identical focus destination does not cause
another focus request merely because a render or ref callback repeats.

Focus events are observations, not selection actions. This preserves initial
no answer and prevents Tab entry or programmatic/AT focus from manufacturing
an answer. Parent changes update checked state without invoking the group
callback.

## Keyboard ownership

Both layouts own the same unmodified keydown navigation:

| Key   | Destination in validated logical child order |
| ----- | -------------------------------------------- |
| Down  | Next eligible item, wrapping.                |
| Up    | Previous eligible item, wrapping.            |
| Right | Next in LTR, previous in RTL, wrapping.      |
| Left  | Previous in LTR, next in RTL, wrapping.      |
| Home  | First eligible item.                         |
| End   | Last eligible item.                          |

Resolve current position from the actual event's live member value, not the
selected value or target registration order. Skip disabled members. With one
eligible destination already active, consume the owned key without issuing a
redundant native focus request; it may still select that focused item when the
group has no answer. Repeated arrows can navigate, with newer pending work
superseding older work.

Ignore previously cancelled events, non-self events, modified chords, and
unsupported/composition events. Preserve Command, Option, Control, Shift,
editing and host shortcuts. Tab/Shift+Tab are native traversal and must not
be prevented or trapped; they cancel queued navigation. Up/Down do not become
unhandled merely because the layout is horizontal.

Handled keys prevent default and stop propagation only within the owning
scope. Native handled-key cancellation/delivery must also be verified per
renderer; JS cancellation alone is not proof that AppKit or a Windows host
did not run a competing loop. Use current Framework Base event/target
mechanisms and the TabList delivery precedent. The item declares only the six
unmodified navigation keys in `keyDownEvents`, with explicit false modifiers,
Win32 key/bubbling phase and Windows code/handled-bubbling phase; macOS uses
the same exact key/modifier entries. Activation and Tab are not in that list.
Disabled items declare an empty handled-key list. Runtime tests inspect these
descriptors; actual native cancellation remains an endpoint gate. Do not import production
FocusZone, add root/global key capture, or install competing native/JS owners.

Space and Enter remain in the reused Radio/Framework Base Pressability path.
macOS activation is on keydown; Windows/Win32 activation is on paired keyup.
Preserve release feedback and caller event counts through blur, disable,
replacement, repeats, and interrupted keys. No group keyup activation is
added. A native accessibility event has its own direct Select route.

## Entry, focus requests, and refs

Without current self-focus, entry is the selected eligible item or first
eligible item. Tab and Shift+Tab both enter through that one item and leave
without visiting its peers. Entry does not select. Disabled/all-disabled
cases expose no ineligible stop. Root and Label never enter the key loop.

Commit selected/active destination and its focusable props before requesting
focus in a layout effect. Controlled navigation waits for a matching parent
commit. Ref availability by itself is not native readiness. Record the target
and its generation; request with keyboard or pointer intent, never rewrite
physical root modality. Wait for actual self-focus/target observation before
recording the confirmed destination.

Use the Radio state stage's `focusTarget` and existing render stage's composed
`focusTargetRef`. The item's public ref remains its native Pressable; the
group's public ref remains its View. Preserve object refs, callback cleanup,
null detach, compatible slot replacement, and same-instance handoffs. Cleanup
must not unregister a newer target under the same value. Do not add a
merge-ref helper, naked tag registry, hidden child-ref walk, or focus during
render.

A missing, detached, disabled, or unsupported requested target must produce
a diagnostic with identity and actual status; do not treat a void `focus()`
return as success. Pending requests cancel on superseding navigation,
nonmatching controlled update, Tab exit, loss of ownership, disable,
replacement, removal, or unmount. Expected source blur during an issued
in-scope transfer is distinct from external exit; do not use it to issue
another request. Cancellation cannot recall a native command already sent.
No timer loop, arbitrary delay, or automatic focus retry on later unrelated
attachment is part of this contract.

Windows pointer focus ownership is group-owned. Radio normally asks
for pre-press Windows focus through its shared helper, whereas a group needs
selection first, including for an unanswered first entry. The approved adapter
passes one effective-disabled-guarded member-activation callback into Radio's
state stage, then attaches that same callback to the resolved root's onPress
instead of executing the helper's pre-focus wrapper there. This is a reviewed
local press-routing extension, not arbitrary-child/ref introspection.
Retain all other shared keyboard/release handlers and the target binding.
Native recognized keyboard presses use that same member callback; the Win32
Unidentified-code fallback still calls it through the existing helper, whose
key-event path does not request pointer focus. Neither path synthesizes a
second press.

After selection/eligibility commits, the group owns the only pointer focus
request. Exact event-order tests and native checks must confirm no duplicate
activation, lost release cleanup, or pre-selection focus. If the existing
stages cannot meet this policy, stop for a narrowly approved
foundation/interface decision rather than editing Radio or adding a wrapper.

On macOS, ordinary clicks request selection but do not impose Windows click
focus. An already-focused checked item can receive a no-op activation without
an additional focus command. Select does not inherently move keyboard focus.
An external selected-value update while focus remains inside does not
invalidate that eligible focused entry; reentry follows the new selection.

## Dynamic membership

Reorder retains identity, answer, and eligible current entry. Removal or
disable cancels the affected pending request. Disabled selected items retain
checked state and become noneligible; group disable changes no answer.
Uncontrolled selected removal clears to null with one callback; controlled
removal leaves an orphaned parent value, no checked child, and an effect-based
development diagnostic. A replacement at the same index is not selected.

Repair an unavailable entry to the selected eligible member or first eligible
member. This repairs later traversal, not native restoration. Do not focus a
replacement after removal just because a remembered focused identity vanished:
the current APIs do not prove that focus stayed in the active native scope.
An AppKit responder may remain native first responder after disable; do not
claim React focus state repaired that. Record endpoint behavior and any
required native owner decision explicitly.

The two-to-five membership constraint still applies to dynamic changes.
Count-invalid updates use the explicit malformed-composition error policy,
not an unannounced empty or standalone-radio mode.

## Motion and evidence

There is no group animation; Label and Radio retain their current immediate
updates and focus visuals. Shared native/custom policy stays on the actual
Radio target. No group ring, outline styling, or local modality tracker exists.

Authored runtime tests assert commit-before-request, no initial selection,
callback/event order and count, controlled acknowledgment/refusal/delay,
RTL/wrap/disabled navigation, ref generations and cleanup, removal clear,
pending cancellation and native-mode absence. Authored WDIO cases assert
actual focus/checked values, Tab/Shift+Tab entry/exit, modifier delivery,
held-key timing, native Select, dynamic membership, and first-responder
limits on all three desktop endpoints. Narrator/VoiceOver and native state
projection are separate evidence. Native Select invocation has an explicit
capability skip because the current driver has no named-action invocation
operation; no click is presented as a Select test. The macOS role/selected
projection cases also state their blockers explicitly. No runtime or native
case was executed by this worker.
