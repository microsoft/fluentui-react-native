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
- [x] Private CalloutHost/FocusZoneHost boundary shared by legacy and modern
      facades; existing compatibility tests and both shim tests pass.
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
- [ ] Remaining Windows FocusZone protocol/inactive-window cases and Callout
      runtime/geometry qualification.
- [ ] Win32 legacy Callout popup-operation qualification; its macOS-only
      executable case is skipped on Win32.
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
  normalization through slot ref composition; the shared host now preserves
  the legacy style representation without changing that consumer's snapshot.
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
  and RNW entry redirection overriding explicit requests. The facades now
  merge into stable hook-owning implementation components (with a committed
  slot regression); explicit RNW commands suppress entry redirection while
  retaining actual focused-identity confirmation.
- Native regression also caught a legacy presentation re-opening on a late
  layout update after dismissal. Closed generations now remain latched for
  legacy views until actual reattachment as well as for modern views until
  deliberate rearm. Recycled popup windows are reparented before showing.

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
  an explicit destination to the entry preference. It now respects the
  existing explicit-command/Tab-trap guard. The command case enters the
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

The Windows Callout story exclusion is unchanged. Native C++ compilation
does not qualify its popup operations, geometry, or resource lifecycle.

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

The initial close operation does not perform automatic restoration or family
closure. These policies remain for the Menu/Popover stage. Do not treat a
timeout as evidence that no native mutation occurred.

### Known remaining implementation/qualification

The first foundation/primitive milestone is implemented, not the entire
Menu/Popover roadmap. Family transactions, safe restore/owner-relative Tab,
text layout providers, modal isolation, actual Menu/Popover integration,
disabled discoverability, and a real module remain.

Windows helpers/handlers and local rect/point placement now compile on RNW
0.81.35. Initial FocusZone focus-result identity, scoped target rejection,
detached handles, and legacy navigation have native evidence. Native
generation mismatch/stale result, pending abort/unmount races, target
replacement, inactive-window refusal, and broader resource checks remain.
Windows Callout runtime behavior remains excluded and unqualified.
Windows ancestor transform/scroll
tracking still needs full geometry qualification and follow-up; do not infer
it from the current frame-summation positioning path.

Mac local rect/point stories render, but the full one-logical-unit geometry
matrix, 100-cycle leak test, VoiceOver/field-editor cases, and Paper runtime
lane remain unqualified. The ObjC FocusZone navigation algorithm is retained;
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
STORYBOOK_SMOKE_STORY='native-modern-focuszone--*' yarn storybook smoke --windows --mode stories-and-tests
yarn storybook bundle --win32
yarn storybook smoke --win32 --mode stories
```

The existing Windows Callout story exclusion must not be removed merely to
claim qualification. Inspect the fresh native library/provider and first
actionable failure. Record exact commands, versions, pass/fail/skip counts,
and whether a case actually exercises the new protocol.

Windows currently includes the three modern FocusZone stories, not modern
Callout. Win32 includes only legacy native-core stories; modern previews are
not imported and no new managed fields/commands are dispatched there.

Required scenarios: command-generation mismatch, stale result, abort/unmount,
default/first/last/specific descendant focus, disabled/unfocusable/outside
targets, true focused-component identity, inactive windows, and legacy
navigation/refs. For Callout: actual readiness, close/reopen without an
automatic reopen loop, target replacement, local rect/point placement,
alignment/gap/collision, DPI/RTL/negative monitor origins, and teardown.
Passive observation must not activate a popup to inspect it.

## Remaining gates

- Paper runtime/input qualification; the current automation lane targets
  Fabric. Paper compilation alone is insufficient.
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
