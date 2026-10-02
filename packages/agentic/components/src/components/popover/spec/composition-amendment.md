---
status: contract-reviewed
conformance: reviewed
reviewedAt: 2026-10-02
---

# Popover P1/P2 composition amendment

**Approved amendment, 2026-10-02.** Independent coordinator review approved
the semantic P1/P2 boundary; the owned implementation, types, regressions,
and typed story fixtures now exist. Integrated test/native execution remains
parent-owned and is not claimed here. The ordinary Popover contract, public
`PopoverProps`, token bindings, and installed code remain unchanged.
Public assembly still uses the unchanged one-argument path.

The coordinator authorized **macOS Menu first**. This policy does not admit
Windows family input/Tab behavior or new Office Win32 messages. P != FM:
Popover supplies presentation attachment/lifetime, while Menu owns membership,
eligible targets, action/navigation intent, and selection; native owns actual
family/window focus, close/return, original Tab continuation, and physical
pointer movement. This adapter does not implement those native capabilities.

## Evidence and authority

The amendment responds to
[`menu/spec/feasibility.md`](../../menu/spec/feasibility.md), P1/P2, and
[`Callout/SPEC.md`](../../../../../../native/Callout/SPEC.md), including its
proposed Menu-family delta. Those worktree documents are change proposals,
not immutable upstream authority or evidence of family runtime success.

The actual public native declarations consulted expose `CalloutHandle`,
`CalloutReadyEvent`, `CalloutDismissContextEvent`, their status types,
`menuFocusManagement`, `onReady`, and `onDismissContext`. The handle has
optional `focusInitialChild` and `closeOwned` for the flat protocol.
The native owner has now exported `focusOwnedChild`, `submenu-back`/`tab`
reason additions, and `onMenuPointerMove` in the actual public declarations.
This implementation imports/extracts those types directly, without local
native unions. Native implementation/qualification and the final immutable
interface revision remain coordinator/native-owner gates.

Existing `recovery-baseline` evidence governs root/ref/slot/input boundaries.
Existing `callout-native` evidence establishes legacy behavior being
preserved, not the new managed API. No existing source ID is relabeled to
claim an uncommitted native family implementation is pinned. The coordinator
must pin the reviewed native interface revision before ratifying the
amendment's new capabilities. All prior source identities and POP-001..013
are retained. No Flex payload body or private source prose is reproduced.

## Reviewed semantic unstable API

These signatures describe the owned implementation. The coordinator supplies
package-root type exports. The second argument to `usePopover_unstable`
is the only input extension. The public assembly continues calling it with
one argument. `PopoverProps`, ordinary defaults, and its top-level View ref
do not acquire any managed-host, anchor, or restoration props.

```ts
import type * as React from 'react';
import type { View } from 'react-native';
import type { CalloutHandle, CalloutProps, CalloutReadyEvent, CalloutDismissContextEvent } from '@fluentui-react-native/callout';
import type { FocusTarget } from '@fluentui-react-native/framework-base';

type PopoverAnchorLifetime = Pick<FocusTarget, 'current' | 'generation' | 'getSnapshot' | 'subscribe'>;

type PopoverCommittedAnchor = {
  readonly nativeRef: React.RefObject<React.ComponentRef<typeof View> | null>;
  readonly mountGeneration: number;
  readonly lifetime: PopoverAnchorLifetime;
};

type PopoverMenuHostHandle = Pick<CalloutHandle, 'focusInitialChild' | 'focusOwnedChild' | 'closeOwned'>;

type PopoverMenuHostSnapshot = {
  readonly handle: PopoverMenuHostHandle;
  readonly anchorMountGeneration: number;
  readonly signal: AbortSignal;
} & (
  | { readonly phase: 'mounted'; readonly nativeGeneration?: never }
  | {
      readonly phase: 'ready';
      readonly nativeGeneration: CalloutReadyEvent['nativeEvent']['generation'];
    }
);

type PopoverMenuHostBinding = {
  getCurrent(): PopoverMenuHostSnapshot | undefined;
};

type PopoverMenuHostOptions = {
  readonly policy: 'menu-macos';
  readonly initialFocus: 'owner';
  readonly presentationKey: string | number;
  readonly bindingRef?: React.Ref<PopoverMenuHostBinding>;
  readonly onReady?: (event: CalloutReadyEvent, binding: PopoverMenuHostBinding) => void;
  readonly onDismissContext?: (event: CalloutDismissContextEvent, binding: PopoverMenuHostBinding) => void;
  readonly onShow?: CalloutProps['onShow'];
  readonly onDismiss?: CalloutProps['onDismiss'];
  readonly onPointerMove?: (event: Parameters<NonNullable<CalloutProps['onMenuPointerMove']>>[0], binding: PopoverMenuHostBinding) => void;
};

type PopoverTriggerCompositionOptions = {
  readonly host: PopoverMenuHostOptions;
  readonly anchor?: { readonly mode: 'trigger' };
};

type PopoverExternalCompositionOptions = {
  readonly host: PopoverMenuHostOptions;
  readonly anchor: {
    readonly mode: 'external';
    readonly attachment: PopoverCommittedAnchor | null;
  };
};

type PopoverCompositionOptions = PopoverTriggerCompositionOptions | PopoverExternalCompositionOptions;

// Ordinary return type retains a required trigger.
declare function usePopover_unstable(props: PopoverProps): PopoverState;

declare function usePopover_unstable(props: PopoverProps, options: PopoverTriggerCompositionOptions): PopoverCompositionState;

// An external row is already the control: presentation cannot add a trigger.
declare function usePopover_unstable(
  props: PopoverProps & { trigger?: never },
  options: PopoverExternalCompositionOptions,
): PopoverCompositionState;

type PopoverCompositionState = Omit<PopoverState, 'trigger'> & {
  trigger: PopoverState['trigger'] | undefined;
};
```

`PopoverMenuHostHandle` picks actual imported method types, not a copied
method/result union or an extra imperative implementation.
The binding exposes the **mounted host's handle**, not the root ref or a slot
function. Its contract permits only the native managed operations accepted
by the reviewed macOS interface. Legacy `focusWindow`/`blurWindow` are deliberately excluded from the binding's
type; they are not an adapter-endorsed restoration path. There is no
arbitrary native prop bag, operation-result bridge, family ID, return target,
window handle, or public `surface`/`surfaceContent` customization option.

### Actual native pointer type

The semantic option is `host.onPointerMove(event, binding)`. It
forwards only the native managed movement event, never row hover or scene
modality. Its type must be extracted from the actual exported native prop:

```ts
// Extracted from the actual exported native property, not generic View movement.
onPointerMove?: (
  event: Parameters<NonNullable<CalloutProps['onMenuPointerMove']>>[0],
  binding: PopoverMenuHostBinding,
) => void;
```

The field is now present in the native owner's declarations and consumed
as written. No synthetic event shape, `any`, index signature, or generic
View movement fallback is introduced. Actual physical filtering/delivery
is a native endpoint qualification obligation.

Similarly, no Popover-owned `focusOwnedChild`, submenu close method, Promise
result constant, or cancel-command name is invented. Menu eventually invokes
the actual optional methods on the live native handle. The owned-child
method is picked directly from `CalloutHandle`; no new command signature
or native result transport is defined in Popover.
Its caller must check capability availability and native results. A missing
method is not a confirmed operation or permission to call `.focus()`.

## P1: mounted binding, events, and initial-focus ownership

`bindingRef` is a React 19 semantic ref to a stable per-host-session binding,
not `componentRef` passed through from user props. Popover owns the internal
Callout `componentRef`. Preserve object refs, callback cleanup, null detach,
ref replacement, development setup/cleanup, and cleanup registration epochs.
Bind through the existing ref/imperative-handle machinery; do not manually
assign another consumer's ref or reintroduce a component-local ref merger.

`binding.getCurrent()` reads live attachment. It returns undefined
immediately after hide, detach, replacement, policy invalidation, or
component unmount, even if Menu retained an older render or the binding object.
A mounted snapshot proves only handle attachment; a ready snapshot additionally
has the actual native generation. Neither asserts native focus/window activity.
The signal belongs to that attachment/generation lease. Invalidate and abort
it before notifying consumers of dismissal or authorizing another generation.
A new native generation has a new lease; a retained snapshot cannot revive it.
Changing only the consumer `bindingRef` callback does not abort the native
host lease; its old ref cleanup cannot clear a newer binding registration.

Native ready processing first verifies current host, committed anchor,
managed policy, and generation; it then publishes the ready snapshot before
calling `onReady` with the **same original event object once**. `onShow`
remains the genuine legacy notification, not a readiness surrogate. Readiness
does not execute a focus request in Popover.
If a live ready event precedes handle binding, retain that original event
with its current session identity (and `persist()` where required) until
commit attaches the handle. No consumer focus dispatch is authorized before
both facts exist. Cancel/release it on detach/hide/replacement, never replay
it into a successor, and never use a timer. A terminal context from the same
mounted session before readiness may invalidate it; that is not a ready event.

For `policy: 'menu-macos'`, `initialFocus: 'owner'` is mandatory and maps to
the reviewed native managed mode with `setInitialFocus=false`. Menu chooses
the eligible row after commit, gets a current ready binding, and uses the
native initial-child operation. Popover neither selects a child nor creates
a focusable placeholder/container to obtain a different initial destination.
Empty content still relies on the native managed Escape/Tab owner.

On any non-macOS endpoint, a request for this host policy is an explicit
unsupported-policy error, not a silent legacy fallback or partial Menu.
Omitted composition options retain ordinary `setInitialFocus=true`,
reasonless dismissal, no managed transport, no binding, no automatic JS
restoration, and existing Windows/Win32 behavior.
The policy and anchor mode are stable for an instance; changing either while
attached is invalid usage requiring an explicit unmount/new component.

Pointer processing verifies the current native generation and active binding
before calling the pointer observer once with the original native event.
Menu owns hovered-entry identity and keyboard-to-pointer suppression. Popover
does not compare coordinates, manufacture movement, select a row, rewrite
scene modality, or issue pointer focus itself. No new key handler is added:
native owns Escape and full-family Tab; existing genuine observers survive.

### Cancellation boundary

The binding signal cancels **consumer JS continuations**. Menu checks it,
the current binding, the target's committed native ref/mount generation,
and the ready generation before dispatch and after settling a Promise.
Abort cannot retract a native command that already executed.

Current flat handle methods return Promises and expose no per-request
`cancel()` or AbortSignal argument. Popover must not claim otherwise.
Native family owner must supply/review its promised newer-request and
target-replacement invalidation for owned-child work. Popover supplies host
detach/generation invalidation only; it must not duplicate native request
correlation, maintain a tag registry, or add a focus retry timer.

## P2: external committed existing row

MenuEntry publishes an attachment only from its committed actual row. The
explicit `nativeRef` identifies that very View/Pressable. Its existing
FocusTarget supplies lifetime observation; `mountGeneration` must equal
that target's current committed generation. Popover uses only the picked
liveness/observation members, never `requestFocus()` or focused state as
window authority.

Validity requires all of:

- non-null row native ref, equal to `lifetime.current`;
- supplied mount generation equal to `lifetime.generation`;
- current owner registration, plus the adapter's current host session.

`attachment: null` is the valid waiting/detached value. A stale non-null
attachment or unsupported instance is diagnosed using the repository's
standard error path, not treated as a successfully anchored host at `(0,0)`.
The owner may keep the reference object stable, but must publish a new
committed attachment on genuine instance/generation replacement. Ref-object
identity or a label alone is not a mount generation.

Popover subscribes to the **existing** target's attachment observation and
routes it into `usePopoverAnchor`'s own session machinery. It does not copy
the algorithm into Menu, read a tag, or require another native wrapper/ref
on the row. Every host callback and binding read also directly rechecks
the ref and generation, so synchronous detach makes stale ready/focus/
pointer/dismiss work inert before an end-of-commit notification arrives.
Same-instance callback-ref handoffs preserve the existing host and generation.
Old cleanup cannot remove a newer owner registration.

The external branch renders **zero trigger Pressables** and no trigger
FocusRing; the MenuEntry remains the sole control with its leaf activation
and observers. Popover's top-level root remains a passive View with the
same public native ref. Root/row/content/native handle identities remain
distinct. Popover does not toggle, re-role, or re-register the external row;
Menu owns its submenu axis and calls the composition stages for the child.
The state/render stage gains only a resolved private render decision;
`PopoverSlots` and public prop slot names remain unchanged.

The native Callout anchor is derived from that committed row using Popover's
existing generation-bound target/session path. Native must resolve its family
membership from the actual row's owning popup/window; React structural
placement of the Popover root does not establish a native parent. The native
external-row resolution/family attachment gate must pass before child
presentation is admitted.

## One close owner and native-hidden controlled sessions

There are three separate identities: requested `open`, the local host/
anchor attachment lease, and the opaque native ready generation.
`presentationKey` is a Menu-owned **intent token**, not a family ID or native
tag. Hold it stable for one intentional presentation attempt, including
waiting for initial attachment. It has no meaning to Callout.

Managed native hide latches that attempt as hidden even if controlled
`open` stays true. Do not re-show it because of rerender, callback/options
identity, a duplicate `onReady`, content/theme/style change, a late operation
result, or row reattachment. A fresh attempt is authorized only by:

1. committed requested close followed by a new open; or
2. a deliberately changed `presentationKey` for a new owner opening intent.

A genuine anchor detach/replacement invalidates the old managed attempt,
aborts its lease, and requests false once without restoring. A new committed
row while controlled true is not by itself a new opening intent. Ordinary
Popover's existing replacement behavior is not broadened by this rule.
Changing keys while a native transaction is closing must wait for the old
host's close/teardown barrier before mounting its successor; no timer or
simultaneously live replacement is authorized.

Native result, context, and legacy dismissal are not three close owners.
Use one per-session close gate: one false request maximum, regardless of
controlled state. A native close result is returned to its caller and never
synthesizes `onDismiss`, `onPress`, or another false request.

For the native protocol's ordinary close sequence:

1. Callout resolves the actual native operation result, when one exists.
2. On the actual context event, invalidate command/readiness authorization and
   the managed presentation before forwarding `onDismissContext(event, binding)`
   once. The binding now reads undefined. Retain the closing transport boundary
   for the promised original legacy notification; do not unmount it early and
   lose that observer.
3. On the actual following legacy `onDismiss`, request false through the
   sole close gate, forward the composition legacy observer once, and retire
   the boundary. Native's legacy callback has no event argument; do not
   fabricate one.

`host-detached` context is the documented teardown exception with **no**
legacy notification. Invalidate/abort, forward that original context, and
retire through the same single false-request gate without inventing legacy
dismissal. A legacy-only close can use that gate without inventing a context
reason. Unexpected native event ordering or a missing promised terminal
notification remains a native contract failure, not a timeout heuristic.
Actual component unmount cancels silently: it does not request open-state
changes or forward late native events into an unmounted consumer.

A Menu action calls the reviewed native close transaction while keeping the
host attached; Menu must not request `open=false` before that transaction
settles/hides. External requested false or parent teardown is cancellation/
no-return, never restoration from React cleanup. Consumer callbacks that
move focus or throw are not swallowed or followed by an unconditional restore.
Native owns guarded return and actual family cancellation.

## Realized artifacts and execution gates

| ID      | Proposed obligation                                                                                                                                                             | Planned evidence                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| POP-014 | Keep public/base behavior unchanged; expose only a macOS semantic second-argument host policy and actual mounted/ready binding.                                                 | `popover.types.ts`, `usePopover.ts`, `PopoverSurface.tsx`, `popover.types.test.tsx`, `popover.test.tsx`      |
| POP-015 | Compose React 19 binding cleanup; invalidate live attachment/generation leases and forward actual ready/context/show/pointer/dismiss observers once.                            | `PopoverSurface.tsx`, `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                             |
| POP-016 | Accept a literal committed native row ref/generation with its existing target lifetime, with no duplicate trigger, native wrapper, anchor algorithm, or private import.         | `usePopoverAnchor.ts`, `popover.types.ts`, `renderPopover.tsx`, `popover.test.tsx`, `popover.types.test.tsx` |
| POP-017 | Latch managed native-hidden controlled attempts, require explicit rearming, and arbitrate context/legacy/results into one false request without premature transaction teardown. | `usePopover.ts`, `PopoverSurface.tsx`, `popover.test.tsx`, `popover.stories.tsx`                             |
| POP-018 | Keep Menu/family focus, native Tab/Escape, pointer filtering, and guarded restoration outside Popover; reject unsupported managed policies.                                     | `popover.types.test.tsx`, `popover.test.tsx`, `spec/platform-evidence.md`, `spec/composition-amendment.md`   |

The authored regressions cover no-options type stability, mounted-versus-ready,
ready-before-ref or late ready, duplicate contexts, context plus legacy,
teardown-only context, controlled true after hide, explicit intent rearm,
same-host callback handoff, root/content/binding refs, external waiting/
replacement/detach, stale owner cleanup, stale results/pointer, and exact
event identity/counts. Include zero duplicate row/trigger native hosts,
root ref stability, no automatic ordinary restoration, and Windows/Win32
exclusion. Read-only owned-file diagnostics and in-memory session lifecycle
probes ran in this worker; Jest and native scenarios did not. Parent owns
exports, integrated validation, and native family acceptance.

## Approved review and remaining native gates

The coordinator approved the second-argument union, external lifetime witness,
binding current/lease semantics, context-to-legacy closing barrier,
initial-focus owner policy, and explicit intent rearm on 2026-10-02.
The actual exported owned-child/pointer types are consumed. The native owner
must qualify the result/context/legacy and teardown exception sequence.
Validate its external-row parent resolution and generation cancellation,
not a guessed family relationship.

MACOS-MENU-FIRST leaves Windows family Tab/input blocked and
Win32 compatibility untouched. Parent-reported flat builds and JS passes
are not family/Popover amendment qualification.
