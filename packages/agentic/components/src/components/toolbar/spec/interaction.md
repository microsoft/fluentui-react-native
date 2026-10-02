# Toolbar interaction

This companion describes the authored implementation of the reviewed
[contract](../SPEC.md). Native execution remains NOT RUN; see
[native evidence](native-evidence.md).

## Ownership

Toolbar owns membership, eligible ordering, the active entry, and horizontal
navigation. ToolbarButton extends Button's composition stages and registers
Button's own Framework Base target; it does not create another Pressable,
another controller for that host, or another activation path.

Command action and selected state are external. Native Pressability,
Button's shared keyboard pairing, and the leaf's existing accessibility
contract remain responsible for activation. Toolbar never handles Enter,
Space, or an accessibility invocation by calling `onPress` itself.

## Traversal (TBR-005, TBR-006)

Resolve eligibility from validated membership and `disabled`. Noncommand
children, separators, and disabled commands cannot become navigation
destinations. Initial active identity is the first eligible command.

Only unmodified horizontal arrows and Home/End originating on a registered
command's actual native self-target belong to this scope. Check native
target/currentTarget identity with the existing Framework Base self-target
mechanism. Descendant events do not stand in for command focus.

LTR Right and RTL Left advance through logical child order; the reverse arrow
goes backward. Both ends wrap. Home/End use logical first/last identities,
independent of direction. One eligible command requires no redundant focus
call. Arrow repeat can issue further navigation, but never command activation.

Tab and Shift+Tab remain native traversal. The root is not a stop. Toolbar does
not call `preventDefault` for Tab, find the next external control, or retain a
focus trap. Reentry retains the last eligible active identity. Empty and
all-disabled scopes provide no command entry and do not intercept keys.

Forward caller key/focus/blur handlers once with the original event. A command
key handler runs before Toolbar navigation and may cancel that JS navigation
using the original event's cancellation state. Toolbar then handles only its
owned uncancelled key. Preserve leaf keyboard-release cleanup. There is no
promise that JS cancellation alone undoes a separately registered native
handled-key descriptor.

## Native transport gate

Native event suppression is separate from JavaScript propagation. Installed
Windows Fabric handling matches `code`, modifiers, and event phase. Installed
RNmacOS matches native `keyDownEvents` before deciding whether AppKit handles
the event. Win32 has its own handled-key representation. Public type
declarations do not establish that one descriptor works on every renderer.

`toolbar.keyboard.ts` registers only ArrowLeft/ArrowRight/Home/End, with all
modifiers false, on the active eligible command. macOS receives `key` entries;
Windows and actual Win32 runtime receive `code` and `handledEventPhase: 3`.
Win32's installed runtime/Flow fields differ from its stale TypeScript
key/eventPhase declarations; the helper records the runtime contract without
importing another native fork or casting props. Inactive/disabled commands
have no Toolbar descriptor list.

Caller descriptor overrides are excluded and rejected, rather than erased.
Caller event handlers remain forwarded. There is no second compatibility
key filter or capture-stage navigation owner.
Native physical-key evidence must prove no competing host navigation. If
the current supported transport cannot satisfy this, report a capability
blocker to the coordinator, not a production FocusZone import.

## Request lifetime (TBR-007, TBR-008)

The ordered inventory is derived from the child tree, not target attachment
timing. Registration associates a stable value with the existing target and a
registration epoch. Replacement/unregister operations cancel old work and
cannot remove a newer registration.

For navigation, update active entry first. After native eligibility commits,
request focus from the current registered target with keyboard intent. Record
pending value/generation separately from native confirmation. Subscribe to
the target's existing snapshot; do not duplicate native focus state.

Check `current` as well as the snapshot because a same-commit ref detach can
temporarily retain the observed focused snapshot. Callback-ref handoff to the
same native host must not cause a registration/render loop, new mount identity,
or false focus loss. Real target replacement invalidates the old generation.

Confirm only when native self-focus arrives on that live eligible target.
An unsupported, missing, or nonfocusable target produces a warning identifying
the value and actual status. Restore the valid entry bookkeeping rather than
claiming native success. A merely requested operation stays unconfirmed until
an event or explicit cancellation; do not invent a timeout or delay constant.
New navigation, scope exit, disable, detach, replacement, and unmount cancel
pending work and unsubscribe idempotently.

## Pointer and accessibility focus (TBR-003)

An eligible command's confirmed self-focus updates the retained entry.
An already-active Windows/Win32 command preserves Button's
focus-before-activation behavior.
If a press starts on an inactive command, make it the entry and request its
pointer focus after eligibility commits; the inactive leaf could not request
focus while nonfocusable. Its caller action remains synchronous and the native
focus request follows the eligibility commit; do not claim focus-before-action
for that inactive case. An already-active command retains Button's existing
pointer request and does not get a duplicate Toolbar request.

On macOS, pressing a command can update the future entry but does not force
Windows click-focus. Actual first-responder state is observed independently.
Toolbar does not alter selected state in either case.

## Dynamic children (TBR-009)

Reorder preserves eligible active identity. Removing or disabling it selects
the first remaining eligible identity as the next entry; no activation or
selection follows. If no eligible identity remains, clear entry and pending
work. Remounting a value uses the newly attached target, never an old native tag.

Automatic post-removal native restoration is excluded: an entry repair does
not establish active-window ownership or permission to steal external focus.
Document actual host behavior when the focused command disappears. A future
restore policy requires its own window/eligibility evidence.

## Excluded scopes and motion (TBR-012)

Editors, IME, custom descendants, nested navigation scopes, vertical controls,
and composite popup triggers are not supported child adapters. Do not capture
their arrow, Home/End, or Tab behavior by walking their native subtrees.
Modified shortcuts remain with the caller/host.

No Toolbar animation or measurement-driven overflow is implemented. Motion and
reduced-motion policy remain with child controls.
