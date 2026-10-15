# Native-core modernization and validation handoff

## Scope and decisions

Implementation branch: `user/jasonvmo/native-lib2`. Baseline:
`c42f54fb15fcbfcf15fc926ec7253c6000f6d147`. Keep this work separate from the
ownership consolidation in PR #4354.

The owner authorized implementation of the cross-reviewed plan on 2026-10-02.
Use Swift for new macOS behavior, thin renderer/generated boundaries, one host
implementation behind modern and legacy facades, and `commandsRef` for
FocusZone's asynchronous command surface. Preserve its actual native root ref.
Callout exposes a presentation handle, not its hidden native marker.

New APIs initially belong to `/macos` and `/windows`; the root and `/win` are
not admission shortcuts. Win32 keeps its host-provided legacy implementation.
Do not send new protocol fields or commands to a baked Win32 registration.
Do not raise legacy React/RN peer floors implicitly.

## Implementation plan

1. Record native-sharing instructions and concrete component contracts.
2. Implement passive live target attachments and shared cancellable request
   correlation with generation fencing, native-result confirmation, and no
   implicit pre-mount queuing.
3. Extract a private native host boundary so legacy and modern facades consume
   the same registration/behavior, without requiring React-19 wrappers from
   legacy code.
4. Implement modern FocusZone native refs, commandsRef, target/default/edge
   focus requests, and renderer result events.
5. Implement modern Callout controlled presence, actual content refs,
   readiness/dismissal separation, view/local-rect/local-point anchors, logical
   placement, and presentation-scoped focus/close/reposition operations.
6. Share macOS eligibility and actual-responder normalization in Swift; retain
   the proven navigation algorithm until a separately validated Swift port.
7. Qualify flat nonmodal Menu/Popover prerequisites before adapting candidate
   family transactions. Keep one navigation owner per key and one native
   restoration executor.
8. Separately implement and qualify families, text layout providers, modal
   containment, and a genuine module when a real consumer justifies it.
9. Admit root APIs only after all mandatory semantics and declared host/version
   combinations are verified.

## Progress

- [x] Pinned baseline, candidate, and historical evidence; recorded approved
      implementation direction.
- [x] Native-sharing instructions and initial modern contracts.
- [x] Passive live attachments, callback cleanup, generation fencing and
      bounded abort/timeout/native-result correlation.
- [x] Hook-free private CalloutHost shared by legacy and modern Callout;
      FocusZone facades share the native registration. Existing compatibility
      tests and both shim tests pass.
- [x] Phased modern facades: hooks and slots in the first phase, a hook-free
      render phase, and documented first-phase slot props.
- [x] Modern FocusZone native ref, commandsRef, enum/default-target translation,
      scoped default/first/last/specific native requests, and result events.
- [x] Modern Callout presentation handles, physical-close latch/rearm,
      view/local-rect/local-point wire translation, native readiness,
      descendant focus, explicit close, and reposition.
- [x] Shared Swift eligibility/field-editor normalization and placement,
      Paper/Fabric boundary wiring, owned observer teardown and recycled-popup
      reparenting. Initial Fabric native qualification passes.
- [x] Windows generation/native build and initial FocusZone command, refusal,
      lifetime, and legacy navigation qualification.
- [x] Win32 legacy FocusZone regression and Callout story rendering; no new
      managed transport.
- [x] Windows Callout runtime (2026-10-15): popup-creation crash fix,
      per-mount popup/subscription ownership, outside-input and Escape
      dismissal, owner keyboard return, FocusZone requests inside owned
      popups, a flat Menu composition, and 100% scale view/rect/point
      geometry. Rework FocusZone cases pass on the rebuilt library.
- [ ] Remaining Windows FocusZone native generation/stale-result,
      pending-race, and inactive-window cases; Callout DPI/RTL/negative-origin,
      collision/flip, scroll/transform, and repeated-cycle resource checks.
- [x] Win32 legacy Callout outside-click/recreate and Escape popup operations
      (2026-10-15); modern operations remain unadmitted on Win32.
- [ ] Publishing, peer-floor, root-admission decisions.

This checklist is updated only with completed work and executed evidence.
Compilation, authored tests, and skipped tests are not native qualification.

### Executed evidence on macOS

- Native-core TypeScript build, story type-check, lint and format checks pass.
- `yarn workspace @fluentui-react-native/native-core test`: 17 Node contracts,
  28 Jest/type tests and one snapshot pass.
- Both shim tests pass (two tests each); root `yarn build` passes.
- Uncached repository `yarn lage test --no-cache --concurrency 4` passes all
  82 tasks. A downstream ContextualMenu snapshot caught style-array
  normalization through slot ref composition; legacy Callout now renders the
  hook-free shared host directly, preserving the legacy style representation.
- All three final desktop JavaScript bundles pass; Storybook format/lint,
  package publishing and changeset checks pass.
- `codegen:windows --check` passes; new generated command interfaces match
  the committed schema. This is not Windows C++ compilation.
- Storybook macOS prep, native build and JavaScript bundle pass.
- Owned Fabric smoke renders 174 stories and passes three new native cases
  with zero skips: Callout readiness/focus/reposition/close/rearm, FocusZone
  actual default/edge/specific focus, and disabled-zone refusal.
- Final combined `STORYBOOK_SMOKE_STORY='native-*'` owned Fabric smoke renders
  all 174 stories and passes all nine native cases, zero failures/skips:
  the three new cases plus six legacy Callout/FocusZone regressions.
- Command stories require explicit owner activation. They do not bypass
  inactive-window guards or activate a popup merely to inspect it.
- Independent lifecycle review found render-time slot props bypassing hooks
  and RNW entry redirection overriding explicit requests. The 2026-10-15
  rework supersedes its inner hook-owning components (see below); explicit
  RNW commands suppress entry redirection while retaining actual
  focused-identity confirmation.
- Native regression also caught a legacy presentation re-opening on a late
  layout update after dismissal. Closed generations now remain latched for
  legacy views until actual reattachment as well as for modern views until
  deliberate rearm. Recycled popup windows are reparented before showing.

### 2026-10-15 rework on macOS

Owner-requested review against the reorganized component, native, and Apple
authoring guidance. Changes:

- Modern Callout and FocusZone are real phased components. Their first phase
  owns hooks, the operation channel, live targets, imperative handles, and
  slots; the hook-free `directComponent` render phase merges render-time
  pass-through props. The previous inner hook-owning components (an empty
  first phase plus an extra React boundary) are removed. Hook-bound props
  (`ref`/`open`/`presentationKey`/`anchor` for Callout, `commandsRef`/
  `defaultTarget` for FocusZone) are consumed by the first phase and must be
  supplied through slot props; render-time values are ignored, matching the
  legacy facades. FocusZone composes slot, render-time, and internal root refs
  through framework-base slot composition. Disabled requests settle through
  the native result instead of a duplicate JavaScript check.
- Legacy FocusZone is restored to its `main` implementation. Legacy Callout
  keeps its phased hooks and renders the shared hook-free `CalloutHost`; the
  stacked-slot `cloneElement` style workaround is removed.
- The Paper Callout extern registration no longer implements methods in
  Objective-C or names `FRNCalloutView` (R-APPLE-003/004); its new commands
  are Swift with `RCT_EXTERN_METHOD`, the anchor bridge uses the narrow
  `FRNCalloutPropertyManager` protocol, and `directionalHint` remaps to the
  shared view's `placementHint`. Shared Swift derives the preferred edge from
  the hint, so neither adapter maintains a second edge mapping.
- Main-actor isolation is explicit for the Swift focus service, lifecycle
  delegate, local mouse monitor, and Paper anchor bridge. Notification
  observers have one owner with idempotent cleanup instead of a nonisolated
  `deinit` reaching main-actor state.
- Windows: explicit FocusZone commands use a dedicated flag rather than the
  Tab-trap flag, restoring main's Tab-exit and remembered-focus behavior; the
  Callout light-dismiss subscription uses an `auto_revoke` revoker and is
  revoked only with a modern popup, fixing a branch regression where a legacy
  Callout lost light dismissal after an unmount/remount of the same view.
  These Windows edits were not compiled or run on this Mac.

Executed:

- `yarn workspace @fluentui-react-native/native-core test`: build, story
  types, 18 Node contracts, 30 Jest/type tests, and one snapshot pass; lint,
  format, and `codegen:windows --check` pass.
- From `apps/storybook`: Fabric and Paper `prep`/`build` pass with every
  changed native-core object recompiled; default Fabric is restored.
- Office bridging-header probe: no `React` module, strict Swift 5 compile
  (RegionBasedIsolation, InferSendableFromCaptures, GlobalConcurrency,
  warnings as errors), emitted manager/view/focus-service declarations, and
  `-Werror=nonportable-include-path -Werror=unused-parameter` syntax checks of
  the extern registration (without the generated header) and both FocusZone
  Objective-C sources pass. `-strict-concurrency=complete` leaves only the
  pre-existing Paper `view()` warning.
- Fabric and Paper smoke render all 175 stories, including 17 legacy/modern
  native stories. While the machine was locked, every executable case,
  including non-native Button, failed at Desktop Driver session creation with
  "Accessibility returned an incomplete or internally inconsistent window
  enumeration".
- After unlocking, `STORYBOOK_SMOKE_STORY='native-*' yarn storybook smoke
--macos --mode stories-and-tests` (Fabric) renders 175 stories and passes all
  11 native cases with zero skips: legacy Callout open/dismiss/recreate, five
  legacy FocusZone navigation/Tab cases, modern Callout readiness/focus/close/
  rearm, and four modern FocusZone command, disabled, live-target, and
  detached-handle cases.
- Paper first failed every executed case because the Desktop Driver required
  `AXEnabled`, which Paper views publish only when disabled. With the driver
  treating an absent `AXEnabled` as enabled, `yarn storybook smoke --macos
--paper --mode stories-and-tests` renders 175 stories and runs 35 cases
  (33 passed; the 2 skips are Fabric accessibility-projection gaps whose
  skip conditions do not distinguish the renderer). This qualifies the Paper
  runtime lane for the 11 native cases.
- Full Paper runs exposed a cross-story Framework Base bug, not a native-core
  defect: a View focused through `focusTarget.requestFocus()` stayed recorded
  in React Native macOS `TextInputState` after unmounting (TabList), and the
  legacy Callout story's ScrollView tap then dispatched `blur` to the removed
  tag, which Paper raised as a RedBox sheet. Focus targets now clear that record
  without dispatching on blur and genuine detach.
- The same Fabric command renders 175 stories and passes the same 35-case set
  after the driver and Framework Base changes.
- macOS, Windows, and Win32 production bundles pass.

Windows must re-run its build and the modern/legacy FocusZone cases for the
dedicated command flag and revoker. (Windows did so on 2026-10-15; the
revoker crashed RNW and was replaced. See below.)

### 2026-10-15 Windows Callout and Menu prerequisites

Executed on Windows 11 x64 at 100% scale (96 DPI) with Node 24.15.0, RNW
0.81.35, react-native-win32 0.81.9, and the rebuilt Debug x64
`FRNNativeCore.dll` (zero warnings/errors).

Root cause and changes:

- Every Windows Callout mount crashed the RNW host with an access violation in
  `FRNNativeCore.dll` (`weak_ref<IInputLightDismissAction>::from_com_ref`):
  `InputLightDismissAction` does not support weak references, so the macOS
  session's `auto_revoke` subscription faulted at popup creation. The fault
  surfaced as the next story failing to render. Subscriptions now use
  explicit tokens.
- Each mount owns its popup, window, and subscriptions; unmount hides and
  reports a shown presentation once (`host-detached`) and releases them for
  both facades. Legacy views no longer leave a visible popup after unmount.
  Visibility, readiness, and closure share one dismissal transition.
- `InputLightDismissAction` reports outside input only while the popup island
  has focus. Windows now mirrors the macOS local mouse monitor: while shown, a
  Callout observes the owner island's `InputPointerSource` and a UI-thread
  message hook for other application windows (including the owner's
  non-client area). Input in a nested popup does not dismiss its owners.
- Escape in focused popup content dismisses as `native-light-dismiss`, like
  AppKit `cancelOperation`. Legacy `dismissBehaviors` are honored.
- Closing a presentation that holds keyboard focus returns input to the owner
  island, whose retained focused component regains focus, matching AppKit's
  owner-window key restoration.
- FocusZone and Callout focus requests treat an owned popup as active while
  its root owner is the foreground window (macOS already walks parent
  windows), so a FocusZone inside Callout content can enter and navigate.
- Work-area flips keep the requested gap; local rect/point offsets round to
  physical pixels.
- The Windows Desktop Driver retries a UI Automation subtree read when a
  descendant (a closing popup island) disappears while the window root
  remains available.
- Windows now includes every native-core story; the story override was
  removed. New/updated authored cases: legacy outside-click/recreate and
  Escape (all hosts), modern light-dismiss/rearm, Escape, separated
  lifecycle/operation status labels, Menu composition, and Windows-only
  view/rect/point geometry (owned popup content is exposed in the owner
  window's accessibility tree only on Windows).

Executed:

- `yarn workspace @fluentui-react-native/native-core test` (build, stories,
  Node contracts, 30 Jest/type tests, one snapshot), `test:stories`, `lint`,
  and `format --check` pass.
- From `apps/storybook`: `yarn storybook prep --windows`, `build --windows`,
  `bundle --windows`, and `build-driver --windows` pass.
- Before the fixes, five Windows Event Log `Application Error` records showed
  `0xc0000005` at the same `FRNNativeCore.dll` offset; offline
  `llvm-symbolizer` mapped it to the revoker's weak reference. None recur.
- `$env:STORYBOOK_SMOKE_STORY = 'native-*'; yarn storybook smoke --windows --mode stories-and-tests`
  renders 170 stories (all native-core stories) and passes 18 cases with zero
  failures/skips: five legacy FocusZone cases from the components catalog
  (directional/spatial, Tab/Shift+Tab exits), four modern FocusZone cases,
  two legacy Callout cases, and seven modern Callout cases (light-dismiss/
  rearm, Escape, focus/reposition/close/rearm, Menu composition, and three
  geometry cases within one logical unit). No owned listener remained.
- A manual owned-host probe confirmed no leaked popup windows after Callout
  teardown, title-bar and owner client clicks dismiss, and a click inside the
  popup does not.
- `$env:STORYBOOK_SMOKE_STORY = 'native-*'; yarn storybook smoke --win32 --mode stories-and-tests`
  renders 152 stories and passes seven cases with zero failures/skips: the
  five legacy FocusZone cases plus the host-provided legacy Callout's
  outside-click/recreate and Escape cases. No owned listener remained.
- `yarn workspace @fluentui-react-native/native-core codegen:windows --check`
  passes without generated-source changes.
- `yarn workspace @fluentui-react-native/desktop-driver test` passes 58 tests
  (three native-gated skips); with `FURN_NATIVE_DRIVER_TEST=1` and
  `--runInBand`, the Windows native contract passes 59 tests (two
  platform-gated skips).
- `yarn clean-lage-cache` then `yarn lage buildci`: every task passes except
  root `lint-repo`, whose knip step reports unused dependencies only in
  untouched packages and fails identically on clean `HEAD` on this Windows
  machine. One `storybook-desktop` test failed once under the parallel run;
  the package's 175 tests pass in isolation and the task passes on a
  `--continue` rerun. `yarn change:check` passes.

Not established on Windows: DPI other than 100%, RTL,
negative monitor origins, collision/flip geometry, scrolled or transformed
anchors (the frame-summing position ignores scroll offsets), app deactivation
for presentations without focus, and repeated-cycle resource measurements.

#### Reconciliation with the macOS Paper/driver work

The Windows commit was rebased onto `0ffb15fa3` (macOS Desktop Driver Paper
fixes, Framework Base host focus record, Paper qualification). Only the
modern Callout story, this plan, and one README sentence needed merging;
native, driver, and changeset content is unchanged. The story now reports
lifecycle, operation results, and dismissal on separate labels.

Upstream's Windows/Win32-reachable changes were checked at source:
`releaseHostFocusRecord` only acts when `TextInput.State.onTextInputBlur`
exists, which RNW 0.81.35 and react-native-win32 0.81.9 do not expose; window
event diagnostics are requested only when a helper advertises `windowEvents`,
which the Windows helper does not; the helper's source digest is unchanged.

Executed on the reconciled commit: `yarn build`; native-core (18 Node, 30
Jest), framework-base (184), desktop-driver (61, 3 native-gated skips), and
storybook-desktop (175) tests; Windows `build-driver`/`prep`/`build` (zero
warnings/errors); `native-*` smoke on Windows (170 stories, 18/18 passed, 0
skipped) and Win32 (152 stories, 7/7 passed, 0 skipped). `yarn clean-lage-cache`
then `yarn lage buildci --continue` passes 170 tasks; only root knip fails,
with the same 11 untouched-package findings as clean `HEAD`.

Full authored catalogs (no story filter) were also run, because upstream
changed shared Framework Base focus targets and WDIO wait defaults. Every
Windows/Win32 `*--focus-*` story that first clicks an agentic `Input`
(`focus-probe-entry`, `focus-request-entry`, `focus-switch-entry`) fails
because the entry never reports UIA focus. Button focus-management fails
identically on the pre-upstream base `5705e14f1` on both Windows and Win32,
matching a 2026-09-10 Win32 observation, so this is pre-existing and not
caused by either line of work. Separately, some physical clicks
intermittently land at the idle cursor position (two Button stories
navigated to the same sidebar item) or report "Windows did not move the
pointer"; the same cases pass in other runs of the identical commit, and the
base runs show the same error. These catalog gaps remain open and are
outside the native-core lanes.

### Executed evidence on Windows

Executed 2026-10-02 local / 2026-10-03 UTC with Node 24.15.0, React 19.1.4,
React Native 0.81.6, RNW 0.81.35, react-native-win32 0.81.9, and REX 0.81.1.
The Windows x64 Debug build uses MSBuild 18.10.1. The updated FocusZone object
and consolidated `FRNNativeCore.dll` were rebuilt after the source fix;
`FRNNativeCore.winmd` is present in the app output.

- `yarn workspace @fluentui-react-native/native-core format --check`,
  `lint`, `build`, `test:stories`, and `test` pass: 17 Node contracts,
  28 Jest/type tests, and one snapshot.
- `yarn workspace @fluentui-react-native/native-core codegen:windows --check`
  passes without generated-source changes.
- `yarn workspace @fluentui-react-native/callout test` and
  `yarn workspace @fluentui-react-native/focus-zone test` pass, two tests each.
- From `apps/storybook`, `yarn storybook prep --windows` and
  `yarn storybook build --windows` pass with both components autolinked.
- `$env:STORYBOOK_SMOKE_STORY = 'native-*'; yarn storybook smoke --windows --mode stories-and-tests`
  passes: 161 stories rendered, nine cases passed, zero failed/skipped.
  Four modern FocusZone cases cover actual default/first/last/specific focus,
  disabled refusal, native unfocusable/outside-target rejection, pre-aborted
  cancellation, and use of a retained command handle after native unmount.
  Five legacy FocusZone cases cover directional/spatial navigation and
  forward/backward Tab exit. Disabled/pre-aborted/detached results include
  wrapper guards; they are not evidence of native generation-mismatch,
  pending-request cancellation, or late-result fencing.
- The first native command run returned `refused`: `GettingFocus` redirected
  an explicit destination to the entry preference. It now respects an
  explicit-command guard (a dedicated flag since the 2026-10-15 rework). The command case enters the
  default target before requesting the edges and later re-enters the first
  target, verifying actual focused identity rather than only an outcome label.
- From `apps/storybook`, `yarn storybook bundle --win32` and
  `$env:STORYBOOK_SMOKE_STORY = 'native-*'; yarn storybook smoke --win32 --mode stories-and-tests`
  pass: 152 stories rendered, five legacy FocusZone cases passed, zero
  failures, one macOS-only Callout case skipped. Callout rendering is not
  popup-operation qualification. Modern previews remain absent on Win32.
- All desktop production bundles pass, including
  `yarn storybook bundle --macos`. New target-lifetime cases have not been
  executed on macOS in this Windows session.
- Storybook format/lint, native-core checks, desktop-runtime format/lint/build
  and 14 tests, `yarn lint-lockfile`, `yarn build`,
  `yarn check-publishing`, and `yarn change:check` pass.
- Initial bundling stopped on duplicate Storybook theming/ui-common copies
  after independent upstream dependency bumps. The targeted
  `yarn dedupe @storybook/react-native-theming @storybook/react-native-ui-common`
  consolidates their compatible ranges to the already-locked 10.6.0 copies;
  no new packages, blanket resolution, or duplicate-checker exemption was
  added.
- Both owned native smoke lifecycles shut down their app/services; their
  channel, Metro, and driver ports have no remaining listeners.

The Windows Callout story exclusion was unchanged on 2026-10-02; it was
removed on 2026-10-15 after the crash fix and native Callout qualification
above.

### How to exercise the new API

```tsx
import { FocusZone, Callout, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';
// Use /windows on RNW. /legacy remains the supported Win32 surface.
```

Use `useNativeViewTarget().ref` on a materialized View/Pressable. FocusZone's
`ref` is the native instance and `commandsRef` exposes
`requestFocus('default' | 'first' | 'last' | target, { signal, timeoutMs })`.
Callout `onReady` supplies an opaque presentation; its handle exposes
`requestFocus(presentation, target)`, `reposition(presentation)`, and
`close(presentation)`. Results are not inferred from void commands.

The initial close operation does not perform policy-driven restoration or
family closure. Closing a focused presentation returns keyboard input to the
owner window's retained focus on both hosts; a Menu still restores its
trigger explicitly after an item closes it. Do not treat a timeout as evidence
that no native mutation occurred.

A flat nonmodal Menu or Popover composes these primitives: controlled
`open`/`presentationKey`, a view anchor on the trigger, `onReady` followed by
`commandsRef.requestFocus('first' | 'last')` on a FocusZone inside `content`,
FocusZone arrow navigation, `onDismissed` reasons for outside input/Escape/
host loss, and `close(presentation)` after item invocation. The
`MenuComposition` story is the executable reference on Windows. Win32 Menu
and Popover use the `/legacy` Callout and FocusZone (`setInitialFocus`,
`dismissBehaviors`, `onDismiss`, and the FocusZone `focus()` ref).

### Known remaining implementation/qualification

The first foundation/primitive milestone is implemented, not the entire
Menu/Popover roadmap. Family transactions, safe restore/owner-relative Tab,
text layout providers, modal isolation, actual Menu/Popover components,
disabled discoverability, and a real module remain.

Windows FocusZone focus-result identity, scoped target rejection, detached
handles, legacy navigation, and FocusZone entry inside an owned popup have
native evidence. Native generation mismatch/stale result, pending
abort/unmount races, target replacement, and inactive-window refusal remain.
Windows Callout readiness, explicit operations, outside-input/Escape
dismissal, rearm, owner focus return, teardown without leaked popups, and
100% scale view/rect/point geometry are qualified. Windows ancestor
transform/scroll tracking still needs follow-up; do not infer it from the
current frame-summation positioning path. DPI, RTL, negative monitor origins,
collision/flip, app deactivation without popup focus, and repeated-cycle
resource checks remain.

Mac local rect/point stories render, but the full one-logical-unit geometry
matrix, 100-cycle leak test, and VoiceOver/field-editor cases remain
unqualified; the Paper runtime lane passes the authored native cases. The ObjC FocusZone navigation algorithm is retained;
a full Swift port is a separate parity-preserving follow-up.

## Windows-machine validation

Run from the repository root after fetching this branch and installing its
declared dependencies:

```sh
yarn workspace @fluentui-react-native/native-core format --check
yarn workspace @fluentui-react-native/native-core lint
yarn workspace @fluentui-react-native/native-core build
yarn workspace @fluentui-react-native/native-core test
yarn workspace @fluentui-react-native/native-core codegen:windows --check
yarn workspace @fluentui-react-native/callout test
yarn workspace @fluentui-react-native/focus-zone test
yarn build
yarn check-publishing
yarn change:check
```

Run native commands from `apps/storybook`:

```sh
yarn storybook prep --windows
yarn storybook build --windows
yarn storybook bundle --windows
yarn storybook smoke --windows --mode stories
STORYBOOK_SMOKE_STORY='native-*' yarn storybook smoke --windows --mode stories-and-tests
yarn storybook bundle --win32
STORYBOOK_SMOKE_STORY='native-*' yarn storybook smoke --win32 --mode stories-and-tests
```

Inspect the fresh native library/provider and first actionable failure. A
Windows host crash can surface as the next story failing to render; check
whether the owned host exited before treating it as a render timeout. Record
exact commands, versions, pass/fail/skip counts, and whether a case actually
exercises the new protocol.

Windows includes every native-core story, legacy and modern. Win32 includes
only legacy native-core stories; modern previews are not imported and no new
managed fields/commands are dispatched there.

Required scenarios: command-generation mismatch, stale result, abort/unmount,
default/first/last/specific descendant focus, disabled/unfocusable/outside
targets, true focused-component identity, inactive windows, and legacy
navigation/refs. For Callout: actual readiness, close/reopen without an
automatic reopen loop, target replacement, local rect/point placement,
alignment/gap/collision, DPI/RTL/negative monitor origins, and teardown.
Passive observation must not activate a popup to inspect it.

### macOS rerun after the Windows Callout and Menu work

The Windows session's new and changed cases (legacy outside-click and Escape,
modern light dismiss, Escape, and Menu composition) were run on macOS. Menu
composition exposed two Fabric FocusZone defects, both now fixed:

- Fabric hosts the Paper `RCTFocusZone` without a React tag, and `RCTView`
  builds its focus and keyboard events from that tag. When a new Callout popup
  selected the zone as its first key view, the zone's focus forwarding resigned
  it and `RCTView` threw building the blur event, aborting the app on the first
  menu open. Every key that bubbled through the zone also threw, and AppKit
  dropped it, so Escape never reached the popup's `cancelOperation:`. A tagless
  zone now sends resign and key messages past `RCTView`.
- The Fabric wrapper returned keys that bubbled out of the zone to the zone
  again; with the zone forwarding them, that recursed. The wrapper now
  continues bubbled keys up the responder chain.

AppKit restores the owner window's retained first responder when a focused
popup closes. A pointer press does not make a Pressable first responder on
macOS, so a pointer-opened menu returns focus to whatever held it before, not
the trigger. At the owner's direction this is configurable: Framework Base's
`useFocusablePressable` takes `pointerFocus: 'platform' | 'always' | 'never'`.
The default follows the platform (Windows and Win32 focus a pressed target;
macOS follows AppKit). The Menu composition story's trigger uses the mode; its
default case asserts the platform convention and `MenuCompositionFocusingTrigger`
asserts trigger restoration with `always` on every platform. Windows must rerun
both Menu cases: its trigger now requests focus on press through the hook.

Full macOS rerun also showed the legacy FocusZone stories calling host
`focus()` directly, leaving a dead View in React Native's focused-input record;
the next ScrollView tap raised a Paper RedBox. They now use `pointerFocus:
'always'` and a focus target.

Evidence: `yarn storybook test --story 'native-*'` passes 19 cases (16 passed,
3 Windows-geometry skips) on Fabric and Paper. `yarn storybook smoke --macos
[--paper] --mode stories-and-tests` renders 178 stories and runs 43 cases
(38 passed, 5 skipped) on both renderers. The Office strict probe passes. One
earlier full Paper run failed two Button focus-management cases intermittently:
the window-event descriptor identified macOS AutoFill's
`SafariPlatformSupportAutoCompleteWindow` over the story's TextInput; the cases
passed four isolated repeats and the final full runs.

## Remaining gates

- Paper geometry, leak, and assistive-technology qualification beyond the
  authored runtime cases.
- Win32 capability evidence for modern operations; do not infer either
  support or impossibility from missing observation infrastructure.
- Older React/RN codegen and native build compatibility before changing peer
  declarations or adding root exports.
- Disabled-but-discoverable MenuItem policy: focus, activation, and
  accessibility-disabled state are separate.
- Natural owner-relative Tab continuation and family close/restoration races.
- Renderer-owned UTF-16 text fragments, truncation/bidi/attachments, and layout
  generations. PR #3661's Paper traversal is not a Fabric implementation.
- Modal focus scope and background accessibility isolation; FocusZone cycling
  is not a modal contract.
- A representative real TurboModule; no speculative module solely for sharing.

## Evidence sources

- Candidate wave-three:
  `5f6e7af1252bcfe087dcd1672afaa4ceb7c5efbb`.
  It contains implemented macOS family behavior, narrower RNW, and recorded
  Menu qualification of 1 passed / 0 failed / 12 skipped. Adapt selectively.
- Historical PR #3661:
  `829883482ddd37324e64633126cc86ba08c2a75f`, open/unmerged at research time.
- Preserve the invariants documented in the package README and new component
  specifications; this handoff does not grant unverified capabilities.
