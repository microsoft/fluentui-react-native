# Common desktop focus authoring

Read this file for every focusable component, collection, popup, focus hook, or
native focus adapter. Then load only the applicable platform detail:

- [Windows and Win32](focus-windows.md)
- [macOS](focus-macos.md)

These files define authoring and review obligations. Execution status in
the [desktop focus plan](../../../../packages/agentic/components/WIN32-FOCUS-PLAN.md)
distinguishes implemented APIs from native-only follow-ups. Keep each reviewed contract and
source-specific divergences authoritative.

## Behavioral authority and platform evidence

Use shipped V1 Win32 behavior as the compatibility model for **both** Office
Win32 Paper and React Native Windows Fabric. Preserve user-observable outcomes:
which element focuses, action count/timing, selection and announcement order,
disabled discoverability, key ownership, and dismissal return. Implement those
outcomes through each renderer's supported APIs, not copied Paper internals.

On macOS preserve the same accessibility goals but follow AppKit's first
responder, key-window, keyboard-navigation, click, and shortcut conventions.
Document intentional differences rather than imposing Windows input behavior.

Before changing behavior, record the public export, platform-resolved file,
renderer/version, host, and relevant V1 sequence. Distinguish declarations,
implementation, authored tests, and native results actually executed. A passing
snapshot or `Platform.OS` mock does not prove native focus delivery.

## Keep these concepts separate

| Concept                | Owner and invariant                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Input modality         | Scene controller; stable `RootSettings`, shared by nested theme boundaries.           |
| Native self-focus      | Actual mounted focus target, not an ancestor receiving a bubbled event.               |
| Focus within           | Explicit scope/ancestor state, never substituted for self-focus.                      |
| Focus request          | Cancellable intent to move focus; not confirmation that it moved.                     |
| Focus-visible policy   | Component/scope policy using modality and explicit focus intent.                      |
| Native window activity | Endpoint adapter; a retained focused object need not belong to the active/key window. |
| Selection              | Component or collection state according to its controlled/uncontrolled contract.      |
| Ring geometry/colors   | Styling phase and renderer, not navigation or activation logic.                       |

Programmatic focus must not rewrite physical modality to keyboard. A keyboard
menu invocation, hover focus, accessibility action, and dismissal restoration
may need different visual intent. Keep that intent scoped to the request/owner.

## Modern refs and slot composition

- Agentic components target React 19.1.4+: receive `ref` as a prop and preserve the
  declared native root using `PropsWithRefOf<typeof Root>`. Do not add legacy
  `componentRef` props or `forwardRef` wrappers to new components.
- Use `React.ComponentRef<typeof Host>` for ordinary host-instance typing when
  supported. Codegen schemas are a separate grammar: preserve their validated
  ref spelling, including existing `React.ElementRef`, until the pinned
  generator accepts a change. A newer TypeScript alias does not establish
  codegen compatibility.
- The public root ref, internal focus-target ref, popup-anchor ref, and scope ref
  can refer to different native objects. Card's structural root must not silently
  become its overlay; Input's public View must not silently become its TextInput.
  Use the inner slot's ref or a deliberately reviewed imperative API.
- Reuse Framework Base's slot ref composition. It merges base-slot/render refs
  and preserves refs returned by slot transforms; do not create another
  component-local merge-ref helper or write into the consumer's ref yourself.
- Forward refs through the custom JSX runtime and compatible `as` overrides.
  Do not assume the callable slot function is a mounted native target.
- Support object refs, callback refs, React 19 callback cleanup, null detach,
  replacement, and development setup/cleanup cycles. Registration cleanup must
  be idempotent and cannot remove a newer target registered under the same key.
- Resolve targets at commit/attachment time, not while rendering. A registration
  should identify the current host, owning surface/window, and mount generation.
  Never keep a naked renderer tag as a permanent target identity.
- A ref becoming non-null is not proof that native focusability/layout has been
  committed. Schedule focus from the owning effect/lifecycle after the needed
  state is applied, then confirm through the native focus event or an explicit
  native result. Cancel on detach, disable, superseding request, or scope close.
- Do not call `focus()` during render or expose a success-shaped fallback for
  unsupported targets. Distinguish requested, confirmed, cancelled, not-mounted,
  not-focusable, and unsupported outcomes in the proposed adapter contract.

Existing mechanisms: `packages\framework-base\src\component-patterns\slot.ts:14-76,118-142`,
`render.ts:38-75`, and `useSlot.test.tsx:453-490`. The framework still supports
older React consumers; do not remove its compatibility behavior merely because
agentic components use React 19.

## State, activation, and rendering

1. Resolve disabled/interactive state and the actual focus target in
   `use<Component>_unstable`.
   Use `useFocusablePressable` for pressable targets and `useFocusTarget` for
   editable or other native targets. Carry `focusTarget`/`focusTargetRef` in
   private state; compose the internal ref on the actual focus slot.
2. Compose interaction handlers with exactly one activation owner. Native
   Pressable activation, key handlers, and accessibility actions must not each
   invoke the same action independently.
   Separate activation cancellation from cleanup of an already-started native
   press. macOS activates on keydown; Windows/Win32 activate on keyup. Always
   finish pressed feedback on release, self-blur, disable, or target replacement
   without generating a new action or forwarding `onPressOut` twice.
3. Call `useFocusVisuals` after resolving focus. Store its private optional
   `FocusRing` in state and apply `enableFocusRing` only to the focus target.
4. In the styling phase call `applyFocusRingStyles` with theme state and resolved
   radius. Its shared defaults are `strokeFocusInner`/`strokeFocusOuter` and
   `strokeWidth.thin`/`strokeWidth.thick`. Keep native colors opaque and theme
   caches immutable; pass disabled/noninteractive targets as unfocused.
5. Render the optional slot inside the target. Native/custom rings must not
   compete; mounted custom ring geometry must not change merely on focus/blur.

Current `alwaysVisible` means visible **while focused** for any modality and
selects the custom path. It does not focus the control or make an unfocused
control visible. Native window activity remains a separate renderer obligation.
Do not add this option to every public component prop surface without a contract.

`useRootSettings` remains a stable non-subscribing query. `useRootInputModality`
provides opt-in notifications; `useFocusVisuals` subscribes only while focused
on the custom path. `RootInputBoundary` attaches additional native popup content
to the same controller without changing themes. Do not add scene-wide React
updates or per-control pointer trackers.

Focus targets expose `requestFocus(intent)`, an observable snapshot, and a
mount generation. A request reports `requested` until a focus event confirms it;
detach, disable, replacement, or explicit cancellation invalidate pending work.
Same-commit ref handoffs to the identical native instance preserve focus,
snapshot identity, and mount generation; inline forwarding callbacks must not
create a subscription/render loop or cancel a valid keyboard press. Registration
epochs reject stale cleanup independently. Genuine detach notifications are
coalesced to the end of the commit, but `current` clears and pending requests
cancel immediately. Never treat the last observed focus snapshot as proof that
a target is still mounted. Higher-level native window activity and cross-window
restore remain separately qualified.

For nested controls, preserve `target`/`currentTarget` or equivalent native
identity and separate self-focus from focus-within. Functional Input borders,
selection visuals, and hover styling are not generic focus rings.
Do not apply this self-focus filter to Pressability's responder press: a valid
pointer press can originate on a noninteractive label/icon descendant.

## Collections and popup scopes

- Use one owner for arrows/Home/End/Tab within a scope. Do not run a JS roving
  algorithm and a native FocusZone over the same keys.
- Apply selection/focusability changes before requesting a target. Confirm
  focus before treating it as the active native element; retain controlled
  selection semantics.
- Define initial focus and dismissal behavior for keyboard, pointer,
  accessibility, Escape, outside click, and application deactivation.
- Restore only to a live eligible target in the intended active window. Do not
  steal focus back from an outside-click destination.
- React ancestry is not native-window ancestry. A popup can inherit themes and
  settings while requiring a separate event attachment to the same controller.
- Keep navigation and restoration in the owner; leaf MenuItem/Tab components
  must not invent a global focus manager.

## Abstraction and native boundaries

Extend existing helpers before adding layers. General interaction/target
contracts belong in Framework Base; modality and appearance remain in design;
component-specific eligibility, layout, and selection remain in components.

A future `native-lib` may provide opt-in native capabilities and shared native
projections. It must depend downward on React Native/platform APIs, never on
design or components. Keep view-bound operations on native refs/generated
commands. Use TurboModules for non-view services that actually need them.
Do not add a process-global `focus(tag)` registry, arbitrary OS handle access,
or production dependencies on the desktop automation driver.

## Required evidence before shipping

- Object/callback refs, cleanup, `as` replacements, ref replacement, and
  unmount/remount retain exactly one live focus target.
- Native focus, active/selected state, event order, and action counts agree.
- Disabled and disabled-focusable policies are intentional per control.
- Same-target modality changes update only the relevant visual consumer.
- Nested owners, popup boundaries, and independent scenes do not leak state.
- Native keyboard/pointer and accessibility runs are non-skipped on each
  supported endpoint; include Narrator/VoiceOver and active/inactive windows.
- Theme/high contrast, scaling, clipping, rounded targets, and native/custom
  ring exclusivity have renderer-specific evidence.

## Public references

- [React 19 refs and cleanup](https://react.dev/blog/2024/12/05/react-19)
- [React imperative handles](https://react.dev/reference/react/useImperativeHandle)
- [React Native 0.81 native commands](https://reactnative.dev/docs/0.81/the-new-architecture/fabric-component-native-commands)
- [Types and slots](types-and-slots.md)
- [State and accessibility](state-and-accessibility.md)
