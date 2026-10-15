---
id: focus.windows-win32
kind: instruction-reference
owner_paths:
  - packages/agentic/components
  - packages/framework-base
---

# Windows and Win32 focus authoring

Read [common focus authoring](common.md) first. This file applies the shipped V1
Win32 behavioral model to both Windows endpoints, while keeping their native
implementations separate.

## Identify the endpoint

| Endpoint  | Platform package and renderer                                           | Native owner                                                        |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `win32`   | `@office-iss/react-native-win32`, Paper; prebuilt REX host in Storybook | Office Win32 host/view implementation                               |
| `windows` | `react-native-windows`, Fabric                                          | Windows App SDK Composition component views and React Native island |

Reviewed versions and other version-bound observations are in the
[platform evidence](platform-evidence.md), C-FOCUS-008 to C-FOCUS-015. Recheck the
lockfile, platform resolution, and host before implementation. Office Win32 Paper is **not** RNW's old UWP XAML renderer,
even though both are described as old-architecture/Paper in some contexts.

## Carry V1 behavior across, not its plumbing

For both endpoints preserve, unless the component's reviewed contract differs:

- focus-before-activation for Windows pointer interaction where the V1 control
  requests it;
- one action per Enter/Space/accessibility invocation, including menu-close and
  keydown/blur/keyup sequences;
- selection/focusability commit before imperative focus and Narrator announcement;
- explicit per-control disabled discoverability;
- menu hover-focus suppression, navigation ownership, and guarded focus return.

Use existing V1 Button/Checkbox/RadioGroup/Switch E2E sequences as scenarios for
both Windows test lanes. The V1 implementation need not run inside Fabric: map
its observed behavior to a shared scenario contract, run V1 on Win32 as the
reference, then verify the new implementation independently on both renderers.
Do not require matching native element classes or identical ring pixels.

Evidence: C-FOCUS-009.

## Focus requests and native identity

On Win32 use the host-supported ref/command path. V1 `componentRef` and
`useViewCommandFocus` are compatibility evidence, not the desired new public API.
Apply the common React 19 ref rules and resolve the actual mounted target.

On Fabric prefer the supported host focus method or a generated native command.
Native adapters operate on the correct mounted `ComponentView` in its owning
surface/island. They must not reuse Paper UIManager/view-manager identifiers or
assume a React ref can be serialized into a TurboModule argument.

The existing Fabric FocusZone requests focus and then confirms the root's focused
component (C-FOCUS-010). Reuse this request-versus-observation pattern. Do not report success merely
because JavaScript called an optional `.focus()` method.

RNW's root resolves programmatic focus with its own policy and ignores a request
for the already-focused component (C-FOCUS-011). This matters for modality-only changes: native focus reasons and the design
root's modality are related, but are not automatically the same source.
Do not synthesize a blur/refocus cycle simply to redraw a ring.

## Keyboard delivery and exactly-once activation

- Inspect the actual installed Pressable and native view handlers. Do not add
  key-up activation on top of an existing native press action.
- Use `useFocusablePressable` rather than per-control key activation. Office
  Win32 can deliver key events whose `code` is `Unidentified` (C-FOCUS-012). The helper supplies one paired key-up fallback only when Win32's
  code-based Pressability cannot activate that key; recognized codes stay native.
  Pairing is cancelled on blur, disable, and target-generation changes.
- Preserve required native accessibility actions. Checkbox and Switch supply `Toggle`;
  Tab supplies `Select`. Win32 UIA patterns depend on those declarations
  (C-FOCUS-012).
- V1 `useKeyProps` handles Windows and Win32 key descriptors differently
  (C-FOCUS-013). Translate and test the pinned Fabric representation instead of copying either branch blindly.
- Treat native `Handled`/capture registration and JavaScript
  `preventDefault`/`stopPropagation` as separate mechanisms. Establish which
  cancellation reaches native navigation at each phase.
- Pair keyboard invocation within the appropriate scene/gesture lifetime.
  Do not reproduce Button's module-global arming flag as a process-global
  cross-scene dependency.
- Forward caller handlers and preserve text editing, IME, modifiers, key repeat,
  and accessibility actions. Global root capture observes input; it must not
  consume every key.

Evidence: C-FOCUS-013.

## Native and custom focus visuals

Current new-component defaults remain native on Fabric and custom on Win32.
V1's native Win32 rings (C-FOCUS-014) make this a choice to qualify, not evidence
that Win32 native rings are unavailable.

- Request native rings only on the actual focus owner. Menu hover focus and
  disabled-focusable cases may require a different visibility policy from a
  generic keyboard-focus rule.
- On the custom path retain the optional slot and mounted configured ring Views.
  Keep the root/slot ref stable through focus and theme changes.
- Qualify Button primary versus high contrast separately; do not apply its
  two-tone Win32 inner-border recipe universally.
- Use platform/Fluent colors for native drawing. Preserve opaque system-color
  values; do not turn them into guessed CSS literals.
- For Fabric native visuals, use the renderer's focus/border hosting and
  lifecycle. React layout units and Composition physical pixels differ; apply
  the validated point-scale conversion. Test clipping/hosting and recycling.

RNW provides explicit focus hosting and native theme handling (C-FOCUS-014). See [Windows Fabric native components](../native/windows-fabric.md)
for codegen, UI-thread, registration, native visual, and UIA requirements.

## Collections, popups, and platform services

Use one native/JS navigation owner. Wait for committed target eligibility and
then confirm the resulting native focus; handle disabled/removed destinations.
Preserve Narrator's selection-before-focus order and test rapid navigation.

Distinguish a Fabric island/popup and an Office Win32 popup. Returning to a
window is not the same as restoring its intended control. Carry a live target
and dismissal reason, and never steal focus after an outside click or host
deactivation.

Consider `native-lib` only for a demonstrated missing capability such as
surface-scoped native focus observation, window activation, or safely shared
native target resolution. Keep view commands in their owning native components.
Fabric TurboModule support does not establish registration support in a
prebuilt Office Win32 host; that endpoint needs its own host integration or an
explicit capability-unavailable result.

## Qualification

Run separate Win32 and Fabric native lanes for the same behavior scenarios:
pointer focus, Enter/Space, stale key-up, repeat/modifiers, accessibility invoke,
selection-before-focus, disabled/removed targets, menu hover, popup return, and
same-target modality changes. Include Narrator, high contrast, display scaling,
active/inactive windows, and nested surfaces.

Gate on actual focused element and action/announcement count, not just selected
React state or a mocked ref call. A skipped input test is not qualification.
Use owned app/Metro lifecycle commands and preserve unrelated sessions.

The catalog uses named WDIO callbacks, and component focus cases use the
`desktop-focus` tag (C-FOCUS-015). Check aggregate result counts for zero skips
before claiming qualification; a disconnected input desktop can leave semantic
cases passing while physical-input cases skip.

For delegated modifier chords, assert parent delivery and unchanged collection
selection, not immovable native focus: the host is allowed to handle the chord.
For native editors, distinguish noneditable/nonfocusable from UIA `IsEnabled`;
Win32's enabled-state announcement gap (C-FOCUS-015) does not replace native
focus assertions.
