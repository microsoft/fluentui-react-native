# Menu interface realization and acceptance gates

**Pre-code review approved 2026-10-02; local Menu code/coverage authored.**
The native family and Popover P1/P2 interfaces are delivered and consumed.
Windows/Win32 Menu admission stays explicitly gated. This owner edited only
Menu and its handoff, never native/Popover/framework/shared/app files.
Integrated execution and physical/AX behavior remain coordinator-owned.

## Current usable boundaries

MenuItem exports its complete unstable pipeline and FocusTarget binding.
An explicit MenuEntry can adapt props, register that target, apply styles,
and render the same Pressable. The leaf's disabled/nonfocusable policy is
preserved. Selection and command effects remain caller-owned.

Popover exports state/style/render stages. Its private content host is a
RootInputBoundary; a composition consumer can attach menu role and padding
after invoking Popover styles, retaining native sizing, appearance and input
attachment. Menu must not publish these private host slots as public props.

The prior handle/trigger/lifetime boundary gaps are resolved by the approved
second argument. Ordinary public PopoverProps remain unchanged. Menu uses
exported stage/type declarations, not private anchor/session/host helpers.

## Actual semantic composition

P1 is `PopoverMenuHostOptions`: policy menu-macos, initialFocus owner,
presentationKey, bindingRef, onReady, onDismissContext and onPointerMove,
plus preserved genuine show/dismiss observers. Binding getCurrent returns
undefined after invalidation, or a mounted/ready snapshot with current handle,
anchorMountGeneration and AbortSignal. Only ready carries nativeGeneration.
Handle methods are picked from actual CalloutHandle, not locally invented.
Menu keeps requested open distinct from hidden host visibility, using an
explicit open boundary/presentation key to re-arm instead of reviving
controlled hidden true. Popover holds native closing transport until terminal
notification; context/results are not extra boolean close owners.

P2 is anchor mode external with attachment null or PopoverCommittedAnchor:
nativeRef, mountGeneration and the existing FocusTarget lifetime witness.
MenuEntry publishes the actual committed row and composes public/focus/local
refs through callable slots. Popover's machinery remains the sole overlay
anchor algorithm; the external branch creates no duplicate trigger.
Root/content/row/native handle identities remain distinct.

The coordinator approved P1/P2 independently. Local Menu controller, child
presentation and styles consume these actual overloads; no raw CalloutProps
bag, new native return target, family prop, FocusZone dependency or leaf edit
is introduced.

## Actual native macOS API

The actual delivered declarations retain managed ready/context and expose
these optional methods, whose availability Menu checks before dispatch:

```ts
focusInitialChild(generation, targetRef): Promise<CalloutFocusOutcome>;
focusOwnedChild(generation, targetRef, intent: 'keyboard' | 'pointer' | 'repair'):
  Promise<CalloutFocusOutcome>;
closeOwned(generation, reason: 'action' | 'programmatic' | 'submenu-back',
  returnFocus: boolean): Promise<CalloutCloseOutcome>;
```

`onReady` carries the native generation. `onDismissContext` retains its
generation, truthful reason and return result, adding native-only `tab` and
`submenu-back`. `onMenuPointerMove` carries the original native event with
generation, pointerId, screenX, screenY and required targetTag for actual
displacement and synchronous original-event hit identity.
Bare Escape and Tab are native-owned; neither is a JS close reason.
Callout's private correlation/events/command schema remain its own transport.
Menu supplies typed committed View refs. Per-request native cancel is not
an exposed method: JS work epochs, snapshot signal, attachment/native/target
generations and current registration/ref checks cancel continuations. They
cannot retract a native command already executed. Close legitimately aborts
its lease and is checked against its originating live binding/work identity.

Bare Escape is delegated to the native popup scope. Escape and Menu action
share guarded native machinery, with child Escape returning only to its own
parent and action closing the whole family. Native light-dismiss always
closes without returning. Keep no public activity/window snapshots, global
focus service, SDK upgrade, experimental reason API, or arbitrary restore target.

Native associates weak acyclic families from the actual row anchor's mounted
popup owner and generation. A leaf action invalidates/hides deepest-first,
with one guarded root return and no child restores. Submenu-back closes only
that child subtree and returns conditionally to its original parent row.
Native Tab retains the original NSEvent and natural owner-loop continuation.
Owned-child focus requires that exact popup's current native ownership, with
no opening-parent allowance or activation of another window. Scoped native
movement rejects stationary/button-only/synthetic events.

The delivered hit follow-up resolves the earlier incompatible-coordinate
issue: native hit-tests the original NSEvent in its actual popup and emits the
nearest eligible descendant tag, or zero. Menu resolves current row tags **for
that event only**, matches current registered eligible refs, then dispatches
focusOwnedChild with the ref. It never focuses the event tag, keeps a tag
registry, uses RN mouseLocationOutsideOfEventStream, or guesses window/screen
rectangles. Unknown/zero/stale/replaced hits do not fall back to retained hover.
The coordinator reports all 47 native Callout tests and final hit-target
macOS codegen/build passing. Physical geometry/hit cases remain required;
those prerequisite passes do not qualify Menu or eventless AX runtime.

The bridge must preserve original show/dismiss/key observers once; ready
does not synthesize show, operation results do not synthesize a press, and
context dismissal plus original dismissal cannot produce two false requests.
Generations/first-close arbitration must cancel old focus/close work.
Actual active owner, weak original anchor identity, and destination guards
remain native facts.

## macOS integrated and native acceptance gates

The prior missing-method gates are resolved at the consumer declaration/local
code level. Actual native behavior and integrated execution are not established
by that fact. Remaining work is:

| Gate                           | Approved direction                                                                                                                                       | Specific unresolved dependency/evidence                                                                                                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1: integrated Menu validation | P1/P2 and family/hit declarations are consumed; parent reports final native47 tests and hit-field codegen/macOS build passing.                           | Parent export/story type/discovery wiring and integrated Menu/Popover package/root/bundle execution remain separately owned. Native schema/build is no longer an unfulfilled hit-interface gate.                                                               |
| G2: visibility/state ordering  | Result precedes context then legacy dismissal; native subtree invalidates before hide.                                                                   | Execute authored controlled/hidden/reopen/ref cases against current Popover session, including subtree callbacks. No three-callback close loop.                                                                                                                |
| G3: native-owned keys          | Bare Escape/Tab remain native; Menu owns collection keys and character search.                                                                           | Exact AppKit descriptor/default cancellation, original key observer once, Return/Space cleanup, native composition/Unicode delivery; no replacement Tab event.                                                                                                 |
| G4: family return/repair       | Atomic family action returns only at root; submenu-back/child Escape return locally; owned-child repair checks current ownership.                        | Native concurrent/ref/newer-navigation and root-only return outcomes; guarded current-owner removal repair, with parent mounted through native child close.                                                                                                    |
| G5: pointer hit/handoff        | Real movement plus original-event hit tag matched to current ref replaces stale hover/layout targeting.                                                  | Physical padded/icon/disabled/clipped/occluded/removed/recycled hits and cross-child handoff. Programmatic branch close never activates the parent; native owned-child focus must confirm actual natural owner.                                                |
| G6: geometry/full conformance  | Actual live row anchoring; native left/right placement aligns popup top to row top before collision corrections.                                         | Qualify RTL, gap, edge flipping/sliding, oversized containment and visual separation. Gap/shadow remain recorded Popover token gaps, not secretly synthesized margins.                                                                                         |
| G7: actual macOS behavior      | Root plus two descendants, full required keyboard/hover/actions and safe close.                                                                          | Native build/flat results are not Menu family results. Parent schedules physical/AX/VoiceOver evidence and reports critical skips honestly.                                                                                                                    |
| G8: native AX qualification    | Optional-event callback amendment approved/ratified 2026-10-02; real eventless tap directly requests semantic activation and forwards its observer once. | Earlier event-shape implementation blocker resolved. Actual AX command/choice/submenu/trigger dispatch counts, disabled behavior, state projection and guarded-close focus still require native execution. No fabricated press/action event or alias fallback. |

Types, controller, stages, tests and stories are now authored in the retained
whole-component context. G1 integration and G2..G8 actual evidence precede
acceptance, not file creation. Required typeahead/hover/submenus/Tab were not
cut to claim a complete flat Menu.

The proposed non-macOS use-time guard is a synchronous explicit error before
trigger/entry/popup creation, with import-safe exports and no fake subtree.
It applies even when closed. Parent owns discovery/export wiring; it must
distinguish an authorized endpoint exclusion from skipped macOS critical cases.

## Gated endpoints and retained Win32 compatibility

Windows Fabric full Menu remains gated on supported original-key Tab
continuation and trustworthy family-input versus light-dismiss handling.
The flat bridge, SDK APIs and weak parent relationship do not establish these.
No SDK upgrade, experimental reason API, native heuristic or reduced menu
substitutes for admission. These Windows gates no longer hold up the approved
macOS implementation direction.

Win32 remains gated for this new Menu, without claiming that its native host
is unsupported. The following is retained **later parity research**, not a
current fallback or instruction to ship Win32 Menu in this phase.

The public V1 Menu export resolves through generic desktop Menu/MenuPopover/
MenuCallout/MenuList/MenuItem files. Legacy core ContextualMenu resolves through
its generic package and renders Callout/View/ScrollView on Win32. Both reach
the existing host `RCTCallout`, not this package's editable RNW Fabric native
implementation. These paths are distinct from each other and from Fabric.

V1 keyboard/accessibility opening supplies a passive container with native
`setInitialFocus=true`; pointer opening can make the container focusable.
Its Win32 MenuList uses host FocusZone, while the macOS-only focus-zone ref
effect does not select a Win32 item. V1 includes disabled keyboard stops and
explicit hover focus. MenuEntry proposes the current agentic eligibility
instead, with one local collection owner to qualify.

V1 enabled item invocation runs its action then requests close when not
persistent. Root Escape remains native; the dismiss observer requests false.
Legacy ContextualMenu's item context-close occurs before its callbacks, and
native onDismiss only forwards the caller. Neither family's default path
installs an onRestoreFocus callback or an unconditional trigger-ref restore.
Legacy's macOS timer is not a Win32 readiness primitive.

Callout's [public callback contract](../../../../../../../docs/pages/Components/Callout.md)
states that supplying onRestoreFocus disables native default restoration.
Therefore a later admitted Win32 Menu must preserve this sequence:

1. Mount against the committed live trigger/session, with first-eligible native
   descendants and `setInitialFocus=true`.
2. Let the host own bare Escape and native light-dismiss. Forward the existing
   reasonless dismiss once to request false/unmount.
3. Run a command through current leaf activation once, then request close.
   Leave onRestoreFocus unset so native default restoration retains authority.
4. Qualify default restoration before requesting any host repair: live original
   trigger, caller moving focus, same-window outside editor, another window/app,
   deactivation, stale/disabled/unmounted anchor, empty content, rapid reopen,
   controlled true, child Escape/back arrow and family action-close.

No managed commands, polite/aggressive focus, focusWindow/blurWindow sequence,
FocusTrapZone, unconditional JS restore, or new host registration is added.
Unavailable Office source is an ownership limitation, not proof of unsupported
behavior. The required default guard outcomes remain unverified until native
scenarios and Office-owner guarantees establish them.

V1's authored Win32 tests cover visibility, action count, disabled arrow stops,
group Tab movement and Escape disappearance. They do not prove passive initial
focus, default restoration guards, outside-destination preservation, or this
new adapter's transport. Legacy tests are narrower again. No such test ran in
this Menu contract session.

## Coordinator integration

Preserve the approved public API, all twenty requirement IDs and pinned
metadata. Wire explicit Menu/MenuEntry symbols and stages, include
menu.stories.tsx in the strict story project, and exclude menu/ in actual
Windows/Win32 StorySettings platform storyPatterns. No per-story platform
parameter is supported by the current discovery contract; a descriptive tag
alone is not enforcement. Do not run unsupported Menu to get a false pass.
Serialize integrated tests/builds/bundles/native generation and evidence.
Uncommitted FURN interfaces remain local realization evidence, not invented
immutable upstream source entries. This owner changed no dependency folder.
