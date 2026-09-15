# Desktop focus and focus-visual improvement plan

**Status:** Shared component rework implemented; full native qualification remains incomplete.
**Reviewed baseline:** `69ce270dde98588f8386e60fa4c720cad3af0142`, September 14, 2026.
**Scope:** New agentic components on Office Win32 Paper, React Native Windows
Fabric, and React Native macOS. **V1 Win32 is the behavioral reference for both
Windows endpoints**, not only a compatibility check for Win32. macOS shares the
focus/accessibility goals but has explicit AppKit-specific adaptation.

The historical filename is retained so existing plan references remain valid.
This refinement adds common/platform authoring instructions, modern-ref
requirements, macOS source research, and a gated `native-lib` assessment.

## Execution status (September 14, 2026)

Implemented:

- Framework Base `useFocusTarget` and `useFocusablePressable`: stable ref-backed
  targets, attachment generations, cancellable request status, native focus
  confirmation, self-focus filtering, callback-ref handoffs, and Windows pointer
  focus before activation.
- Design `useRootInputModality` and `RootInputBoundary`: stable root settings,
  deduplicated focused-owner subscriptions, modifier-only filtering, and popup
  event attachments sharing the scene controller.
- All eleven focus-ring consumers plus Input use the target foundation.
  TabList commits eligibility/selection before requesting focus and distinguishes
  its tab stop from confirmed native focus. Card keeps its structural ref and
  respects a caller's nonfocusable overlay setting.
- Switch no longer toggles independently on key-up. Native Win32 qualification
  exposed `code="Unidentified"`; the shared helper now uses one generation/blur-
  guarded, key-based fallback only where native code-based activation cannot run.
  Checkbox/Switch `Toggle` and Tab `Select` accessibility actions expose the expected
  native toggle/selection patterns.
- Dedicated `desktop-focus` Button/Switch/TabList stories and owned smoke
  selectors (`STORYBOOK_SMOKE_STORY`, `STORYBOOK_SMOKE_TAG`) make native
  qualification reproducible without bypassing leases or changing default smoke
  contracts.

Native evidence so far: all three dedicated Win32 cases passed with real input
and no skips. The default Win32 Button/Checkbox/Input lane also passed all three
cases after declaring Checkbox's native Toggle action; the previous failure
showed a checked glyph but false UIA checked state. Windows Fabric Switch and
TabList cases passed; the first Button
case repeatedly timed out during story selection before executing input steps.
The full Windows story traversal rendered successfully. The unsuccessful
orchestrator experiments were removed rather than weakening readiness checks.

Affected workspace suites pass, as do the root build and package lint/format.
The required uncached repository test graph stops in two unchanged codemod
fixture comparisons; these unrelated baseline failures were not modified.

Still gated: complete three-lane P0/V1 parity, the Windows first-story readiness
failure, macOS native input/VoiceOver, full popup/window restoration and activity
policy, and P4 visual/high-contrast/scale qualification. A complete new menu owner
or RadioGroup is not introduced. N0/native-lib remains deferred: observed
component activation/ref gaps were resolved without a new native module; native
window observation still needs its own scoped proof and host integration.

The investigation used three independent read-only passes over V1 leaf controls,
navigation/popups, and shared interaction/native-JavaScript adapters, followed by
a comparison with the new components. Repository paths and line ranges below
refer to the reviewed baseline. **Observed** describes source behavior, not a
claim that native interaction was executed. **Inferred** identifies a likely gap
that still needs a native reproduction.

## Platform contract and authoring deliverables

| Target             | Behavioral authority                                                                 | Implementation evidence                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Office Win32 Paper | Shipped V1 Win32 behavior and E2E sequences                                          | Installed `@office-iss/react-native-win32` 0.81.8 and the supported Office/REX host                  |
| Windows Fabric     | The same V1 Win32 focus, activation, navigation, and announcement outcomes           | Installed `react-native-windows` 0.81.35, Composition component views, native focus state, and UIA   |
| macOS              | Common accessibility goals adapted to AppKit click, keyboard, and window conventions | Installed `react-native-macos` 0.81.9, local FocusZone/Callout implementations, and AppKit/VoiceOver |

Versions are observations of this checkout, not claims about the latest release.
Preserve outcomes across Windows implementations without copying Paper view
managers, key descriptors, ref bridges, native classes, or pixels into Fabric.

The initial detailed instruction structure is now authored:

| File                                                                     | Responsibility                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `.github\skills\agentic-component-authoring\references\focus.md`         | Shared vocabulary, ownership, React 19 refs/cleanup, slot integration, abstractions, and qualification                    |
| `.github\skills\agentic-component-authoring\references\focus-windows.md` | V1-backed behavior, separate Win32/Fabric transports, keyboard handling, native focus reasons, Narrator, and visuals      |
| `.github\skills\agentic-component-authoring\references\focus-macos.md`   | First responder/key window, click-through, keyboard settings, field editors, popup readiness, AppKit rings, and VoiceOver |

Skill/package/ref guidance routes to these files. The common file owns shared
rules and breakouts own platform detail; the existing
`AGENTS.md#focus-visual-policy` anchor remains a router for component specs.
Each implementation stage must refine these instructions from verified evidence.
Proposed abstractions are not APIs that already exist.

## Recommendation

Fix focus ownership, native focus requests, and keyboard activation before
changing ring appearance. Keep the current separation:

- The scene root owns input modality.
- Interaction helpers own the actual focus target and event delivery.
- Collection/popup owners coordinate navigation, selection, and focus return.
- `useFocusVisuals` chooses visual policy.
- `applyFocusRingStyles` supplies shared theme defaults; component styles supply
  geometry and preserve semantic differences.

Use V1 Win32's observable focus/activation sequences as the starting contract
for Fabric too. Reuse current slot/ref composition and native FocusZone/Callout
ownership instead of building a parallel universal focus manager.

V1 does **not** support the assumption that Win32 native focus rings are generally
unavailable. It exposes and uses `enableFocusRing`, including per-item suppression
for menu hover. Preserve the new hook's current Win32 custom-ring default until
an explicit native/custom comparison supports a reviewed policy change.

## Evidence and differences

The V1 comparison drives both Windows implementation lanes. macOS differences
and renderer-specific evidence are detailed after this index.

| Area                                  | Observed V1 behavior                                                                                                                                                                                                                                                                  | New-component comparison and consequence                                                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public compatibility baseline         | `ButtonV1` and `CheckboxV1` are explicit public aliases; Win32 Tab has its own implementation. [V1, V2, V6]                                                                                                                                                                           | Follow public exports and platform resolution, not similarly named legacy or mobile implementations. Input's generic V1 file is a stub, so it is not a Win32 behavior reference. [V9]                                                                                |
| Pointer focus                         | Checkbox/Switch use `useOnPressWithFocus`; that helper requests imperative focus on Windows/Win32 before forwarding the press. [V2, V3, H1]                                                                                                                                           | New controls wrap React Native `Pressable` and forward `onPress`, without this explicit focus-request layer. This is a delivery/parity question, not proof that native Pressable never focuses. [N1]                                                                 |
| Activation timing                     | Shared key helpers use Win32 key-up activation, handled-key descriptors, and propagation control. Button also pairs keyboard invocation with earlier keydown and resets on blur to prevent a menu-close/reopen sequence. [V1, H2]                                                     | New Button relies on native Pressable; Switch additionally toggles in `onKeyUp`. Qualify exactly-once activation before either adding or removing handlers. [N1, N2]                                                                                                 |
| Focus after selection                 | Win32 V1 Tab changes selection/invocation state, then focuses through an effect; its comment explains the Narrator ordering requirement. [V6]                                                                                                                                         | New TabList changes active/selected values and immediately calls optional `.focus()`. The destination may still have old native focusability, and state can advance without confirmed focus. These are inferred races, not reproduced failures. [N3]                 |
| Menu pointer versus keyboard feedback | V1 MenuItem focuses/blurs on hover and changes `enableFocusRing` according to hover/focus origin. Disabled Win32 menu items can remain focusable; tabs use a different disabled policy. [V4, V6]                                                                                      | A universal `focused && keyboard` rule is not a complete menu policy. New MenuItem is a leaf, not a replacement for the V1 menu owner. Do not copy disabled-focusable behavior into every component. [N4]                                                            |
| Programmatic visibility               | The inspected Button two-tone branch tests focused state, and Radio/Switch use focused token states; these callsites do not consult a scene-root modality value. Menu separately suppresses hover-origin native rings. [V1, V4, V10]                                                  | The new default follows the last root modality even for programmatic focus. Treat this as an explicit new policy to qualify, not proven V1 parity; owner intent may need to override it. [N5]                                                                        |
| Scope ownership                       | MenuList explicitly refocuses a submenu trigger on close. MenuPopover owns initial focus and contains navigation keys. FocusZone exposes native navigation/default-tabbable configuration. [V5, V7]                                                                                   | Root modality is not a focus manager. Keep navigation and dismissal return at the owning scope; a popup's `target` prop alone does not prove all native restore paths.                                                                                               |
| Same-target modality changes          | V1 control helpers update local interaction state and menus explicitly manage pointer-origin feedback. [H3, V4]                                                                                                                                                                       | `ThemedRoot` mutates a stable object; `useFocusVisuals` samples it only during render. A modality-only change can leave the already-focused custom ring stale until another render. Its test currently supplies that render manually. [N5, N6]                       |
| Imperative target identity            | V1 controls carry component refs through the shared focus adapter; a native Win32 focus surface exists, but wrapper/ref compatibility must be checked per entrypoint. [H1, H4]                                                                                                        | Card's ref targets its structural View while its Pressable overlay owns focus. Input similarly separates structural root and TextInput. Preserve public ref contracts while providing an explicit internal focus target. [N7]                                        |
| Ring geometry and contrast            | V1 Button chooses a Win32 primary/non-high-contrast two-tone path and defaults the native ring off for that path. Checkbox defaults to the native ring; Radio and Switch also have focused token-driven borders. There is no single V1 ring recipe to copy everywhere. [V1, V2, V10]  | The new helper applies the same inner/outer token widths to all custom rings, and `FocusVisual` places both rings through absolute-fill Views. Retain this structure initially, then measure insets, clipping, contrast, and actual Win32 rendering against V1. [N8] |
| Validation                            | V1 has behavioral E2E specifications for Button Enter/Space, Checkbox click/Space, RadioGroup arrows/disabled skipping/Tab, and Switch click/Enter/Space, as well as snapshots and tester scenes. These are defined coverage, not tests executed during this investigation. [V8, V11] | The September 12 Win32 run's three authored input plans all skipped unsupported physical-click/keyboard capabilities. Rendering 143 stories was not focus qualification. New tests replace `Platform.OS` and dispatch synthetic events. [N6, N9]                     |

### Evidence index

Paths are repository-relative except the explicitly identified installed-package
paths. The installed Win32 JavaScript inspected was
`@office-iss/react-native-win32@0.81.8`; re-resolve it before implementation.

- **V1:** `packages\components\Button\src\index.ts:27-28`;
  `packages\components\Button\src\useButton.ts:15-17,37-74,99-113`;
  `packages\components\Button\src\Button.tsx:113-140`;
  `packages\components\Button\src\ButtonTokens.win32.ts:27-40,56-66,103-111,148-158`.
- **V2:** `packages\components\Checkbox\src\index.ts:22-23`;
  `packages\components\Checkbox\src\useCheckbox.ts:54-62,95-98`.
- **V3:** `packages\components\Switch\src\useSwitch.ts:100-104,124-137`.
- **V4:** `packages\components\Menu\src\MenuItem\useMenuItem.ts:29-45,68-89,113-120,142-149`.
- **V5:** `packages\components\Menu\src\MenuList\useMenuList.ts:94-121`;
  `packages\components\Menu\src\MenuPopover\useMenuPopover.ts:42-84,100-118`.
- **V6:** `packages\components\TabList\src\Tab\useTab.win32.ts:64-110,142-152`;
  `packages\components\TabList\src\TabList\useTabList.ts:142-176,183-200`.
- **V7:** `packages\components\FocusZone\src\FocusZone.tsx:15-45`;
  `packages\components\FocusTrapZone\src\FocusTrapZone.ts:15-31`.
  These wrappers do not by themselves prove native trap/restoration semantics.
- **V8:** `apps\tester-core\src\TestComponents\FocusZone\FocusZoneE2ETest.tsx:1-120`;
  `apps\tester-core\src\TestComponents\TabList\TabListE2ETest.tsx:1-60`;
  `apps\tester-core\src\TestComponents\Menu\E2EMenuTest.tsx:1-110`.
- **V9:** `packages\components\Input\src\Input.tsx:22-39`.
- **V10:** `packages\components\RadioGroup\src\Radio\RadioTokens.win32.ts:80,97-102`;
  `packages\components\Switch\src\Switch.styling.ts:14-21,32-50`;
  `packages\components\Switch\src\SwitchTokens.win32.ts:16-17,50-95`.
- **V11:** `apps\E2E\src\ButtonV1\specs\ButtonV1.spec.win.ts:77-94`;
  `apps\E2E\src\CheckboxV1\specs\CheckboxV1.spec.win.ts:81-120`;
  `apps\E2E\src\RadioGroupV1\specs\RadioGroupV1.spec.win.ts:123-198`;
  `apps\E2E\src\Switch\specs\Switch.spec.win.ts:60-148`.
- **H1:** `packages\utils\interactive-hooks\src\useOnPressWithFocus.ts:14-29`;
  `packages\utils\interactive-hooks\src\useViewCommandFocus.ts:8-29`.
  Reuse the focus-adapter contract, not an assumed equivalence between every ref
  and a focusable native view.
- **H2:** `packages\utils\interactive-hooks\src\useKeyProps.ts:16-39,44-95,114-126`.
- **H3:** `packages\utils\interactive-hooks\src\useAsPressable.ts:47-73,139-149`;
  `packages\utils\interactive-hooks\src\usePressableState.ts:44-106`.
- **H4:** Installed Win32 package:
  `Libraries\Components\View\View.win32.js:114-188,240-243`;
  `Libraries\Components\Pressable\Pressable.win32.js:220-390`;
  `src-win\Libraries\Components\Touchable\TouchableWin32.tsx:250-272,583-626`.
  JS exposes capture/handled-key processing, focusability, and imperative focus
  surfaces. The audited JS/types do not establish a native focus-visible callback
  or the C++ ring's rendering/event-order guarantees.
- **N1:** `packages\agentic\components\src\components\button\useButton.ts:48-66`;
  `packages\framework-base\src\hooks\usePressableState.ts:37-78`.
- **N2:** `packages\agentic\components\src\components\switch\useSwitch.ts:123-148`.
- **N3:** `packages\agentic\components\src\components\tablist\useTabList.ts:124-164`;
  `packages\agentic\components\src\components\tab\useTab.ts:38-46,58-92`.
- **N4:** `packages\agentic\components\src\components\menu-item\useMenuItem.ts:38-81`.
- **N5:** `packages\agentic\design\src\theming\ThemedRoot.tsx:28-83`;
  `packages\agentic\design\src\theming\rootContext.ts:3-24`;
  `packages\agentic\components\src\common\useFocusVisuals.ts:34-42`.
- **N6:** `packages\agentic\components\src\common\useFocusVisuals.test.tsx:53-72`;
  `packages\agentic\components\src\common\focusVisualPolicy.test.tsx:41-84`.
- **N7:** `packages\agentic\components\src\components\card\useCard.ts:59-110`;
  `packages\agentic\components\src\components\card\useCardStyles.ts:17-24`;
  `packages\agentic\components\src\components\input\useInput.ts:142-179`.
- **N8:** `packages\agentic\components\src\common\applyFocusRingStyles.ts:10-45`;
  `packages\agentic\components\src\primitives\focus-visual\focus-visual.tsx:44-84`.
- **N9:** Local, ignored historical evidence:
  `apps\storybook\artifacts\win32\desktop-driver\run.json:3-43`,
  finished September 12, 2026 at 07:31:17 UTC. Recreate equivalent evidence on an
  input-capable host; do not treat this artifact as a portable test dependency.

### Added Fabric, macOS, and modern-ref evidence

- **W1:** `packages\components\FocusZone\windows\FRNFocusZone\FocusZoneComponentView.cpp:33-65,71-133,175-224`
  subscribes to native focus/key events, requests `TryFocus(FocusState::Keyboard)`,
  and checks actual focused identity. This is a Fabric implementation model for
  V1 outcomes, not a reason to copy its transport to Win32.
- **W2:** Installed RNW 0.81.35
  `Microsoft.ReactNative\Fabric\Composition\RootComponentView.cpp:79-118`
  stores native focus state, resolves programmatic focus through native policy,
  and returns early for an already-focused target.
  `CompositionViewComponentView.cpp:189-201,419-426,728-791` owns focus visual
  hosting. These are projection candidates, not established public JS APIs.
- **M1:** `packages\utils\interactive-hooks\src\useOnPressWithFocus.ts:14-29`
  forces click focus only on Windows/Win32.
  `packages\utils\interactive-hooks\src\useKeyProps.ts:44-95,114-126` prefers
  key-down on macOS and key-up on Windows/Win32, with different key descriptors.
- **M2:** Installed RNmacOS 0.81.9
  `React\Fabric\Mounting\ComponentViews\View\RCTViewComponentView.mm:1719-1804`
  implements AppKit focus/blur, ring-mask drawing, responder events, and pointer
  focus behavior. Lines 1807-1861 emit key events and use native handled-key
  entries to decide whether AppKit receives `super` handling.
- **M3:** `packages\components\FocusZone\macos\RCTFocusZone.m:24-35,122-129,584-675`
  resolves editable focus targets and key-view navigation, including a hierarchy
  fallback for Fabric-backed zones.
  `packages\components\FocusZone\macos\RCTFocusZoneComponentView.mm:118-195`
  forwards focus to its content rather than becoming a duplicate tab stop and
  clears default-responder state on recycle.
- **M4:** `packages\native\Callout\macos\CalloutWindow.swift:9-38`;
  `packages\native\Callout\macos\CalloutView.swift:33-45,142-216`;
  `packages\native\Callout\macos\RCTCalloutComponentView.mm:96-132`.
  Popup key-window activation, initial child focus, and a separate Fabric touch
  attachment are distinct concerns.
  `packages\native\Callout\macos\GuardedEventMonitor.swift:1-29` owns monitor cleanup.
- **M5:** `packages\components\ContextualMenu\src\ContextualMenu.tsx:39-55`
  contains a macOS layout-effect/timer workaround: a readiness problem to solve,
  not a general timer recipe.
  `packages\components\Checkbox\src\Checkbox.macos.tsx:22-30` is a stub, not a
  working V1 macOS focus reference.
- **R1:** `packages\framework-base\src\component-patterns\slot.ts:14-76,118-142`
  already composes refs, callback cleanup, and transform refs;
  `packages\framework-base\src\component-patterns\render.ts:38-75` preserves the
  custom runtime path.
  `packages\framework-base\src\component-patterns\useSlot.test.tsx:453-490`
  covers stable native refs and compatible replacements.
- **R2:** `packages\agentic\components\src\refs.types.test.tsx:30-84` distinguishes
  structural and pressable root refs.
  `packages\native\Callout\src\CalloutNativeComponent.ts:63-70` demonstrates
  typed native commands with host refs rather than global tag arguments.

### macOS adaptation decisions

| Concern                      | Required distinction                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pointer activation           | Do not impose Windows focus-before-press on ordinary AppKit controls; test inactive-window first click and `acceptsFirstMouse` separately.                 |
| Keyboard phase and shortcuts | Qualify key-down activation, key equivalents, Command/Option/Control chords, IME, and Return/Space; do not transplant Win32 modifier rules.                |
| Focus identity               | Track key window and actual first responder, including field-editor ownership; distinguish VoiceOver navigation focus.                                     |
| Keyboard settings            | Respect key-view-loop and keyboard-navigation/Full Keyboard Access settings; do not assume a static startup snapshot or unsupported KVO subscription.      |
| Popup lifetime               | Window activation does not prove child focus. Wait for content/window readiness, cancel stale requests, and avoid unconditional reactivation on dismissal. |
| Ring drawing                 | Preserve AppKit mask/bounds, window activity, points/backing scale, and Increase Contrast; Composition geometry is not interchangeable.                    |

Apple documents that `makeFirstResponder` can fail, and that a true result can
mean the window became responder when the requested object refused. Confirm
the actual responder, not just the boolean. The macOS authoring breakout links
the official AppKit sources and the local implementation evidence.

## Abstractions to build or extend

Names in this table other than existing helpers are **proposed contracts**.
Final public names require review and compile-time coverage.

| Abstraction                                           | Placement and payoff                                                                                     | Constraints                                                                                                                  |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Ref-backed focus target/registration                  | Framework Base; one mounted-target contract for TabList, Card overlays, editable slots, and popup return | Reuse slot ref composition; track attachment generation/scope and cleanup without redirecting public refs.                   |
| Cancellable focus request/observation                 | Framework Base contract with injectable platform adapters                                                | Distinguish request/confirmation/cancellation/unavailability; apply eligibility first. No success-shaped optional-ref no-op. |
| Root input controller with focused-owner subscription | Design; stable settings and targeted refresh with multiple native event attachments per scene            | No context-value churn, process-global gesture flag, or duplicate per-control modality tracker.                              |
| Focus scope and return intent                         | Component-private coordination, reusing native FocusZone/Callout                                         | One navigation owner; request intent does not rewrite global physical modality.                                              |
| Existing focus visual policy and styling              | Extend `useFocusVisuals` and `applyFocusRingStyles`                                                      | Keep behavior and ThemeState separate; preserve component geometry and native renderer choices.                              |
| Native capability/environment projection              | Optional `native-lib` service if N0 proves a gap                                                         | Narrow capabilities, snapshots, and events for app-owned windows/surfaces; no React refs across module arguments.            |
| Shared native target/window lifecycle helpers         | Optional projection layer reused by FocusZone/Callout                                                    | Extract demonstrated duplication; preserve generated registration, UI-thread ownership, and recycle cleanup.                 |

### Modern-ref acceptance contract

Agentic code uses React 19 `ref` props and `PropsWithRefOf`, not new V1
`componentRef` APIs or `forwardRef` wrappers. Preserve object refs, callback
cleanup, slot `as` replacements, transform refs, development setup/cleanup
cycles, and replacement/unmount cancellation. Ordinary TypeScript may use
`React.ComponentRef`; codegen-specific syntax must match the pinned generator.

Use existing `prepareSlotProps` ref composition rather than a new merge-ref
utility. Public root, actual focus target, scope, and anchor refs remain distinct.
Never keep a numeric tag as durable identity or submit focus before native
attachment/eligibility is ready. Native confirmation must identify the intended
target, not just a queued command or activated window. Preserve Framework Base's
older-React compatibility while applying the React 19 agentic contract.

## Is a native-lib package useful?

**Recommendation: yes as an opt-in, capability-driven foundation; not as an
up-front rewrite or prerequisite for JavaScript-only fixes.** Native focus/window
observation and cross-window readiness are plausible gaps. Local macOS
FocusZone/Callout already duplicate native target lookup and lifecycle work.
Prove the first shared consumer pair before creating the package.

Proposed location/name: `packages/native/native-lib`,
`@fluentui-react-native/native-lib`, subject to boundary review.

### Separate three native API responsibilities

| Kind                                                                           | Appropriate surface                                                                       | Avoid                                                                                                               |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Non-view capability, window activity, keyboard-navigation snapshot/observation | Codegen TurboModule and platform-neutral facade where existing RN APIs are insufficient   | Global keyboard hooks, production AX/UIA automation, guessed defaults, synchronous cross-thread waits               |
| Operation on a mounted control                                                 | Existing host `.focus()` or typed native command in the owning renderer/component adapter | TurboModule `focus(reactRef)` or arbitrary process-global `focus(tag)`                                              |
| Shared native implementation                                                   | C++/WinRT on Windows; AppKit with Objective-C++ codegen glue/native helpers on macOS      | Leaking native types into shared TS, editing generated headers, or mixing UIKit/UWP assumptions with desktop Fabric |

TurboModules and Fabric views may share a package, but module registration does
not create a view command or its lifetime. If a native service must identify a
target, use a scoped registration token with a mount generation acquired through
owned renderer attachment; reject stale or cross-runtime tokens.

### Dependency and support contract

Preserve `components -> framework-base/design`. Introduce native-lib through
optional platform adapters or injected capabilities only after review. Do not
make every Framework Base import eagerly load native code. Native-lib must not
import Framework Base, design, components, or desktop-driver. Existing source
boundary rules, manifests, and project references need an explicit amendment if
the new dependency is approved.

Keep FocusZone/Callout schemas and visual ownership in their packages. They may
reuse a projection library; do not duplicate their registrations in a monolithic
native-lib view manager.

Windows Fabric/macOS module support does not establish registration in the
prebuilt Office Win32 host. Win32 needs a supported host extension/projection,
or explicit capability unavailability while existing ref paths keep working.
Do not use top-level `getEnforcing` in an optional facade.

### N0. Bounded native feasibility spike

Start only after P0 identifies a concrete missing signal. JS-only P1/P2 work can
proceed independently.

1. Select one service gap and two real consumers, such as FocusZone and Callout.
   Check existing renderer/public APIs before adding a bridge.
2. Define the minimal schema, capabilities, freshness/event ordering, explicit
   errors, cleanup, target lifetime, and UI/main-thread scheduling.
3. Build one Windows Fabric and one AppKit projection. Add a module only for the
   non-view service; mounted-view commands remain ref-based.
4. Prove attach/recycle/unmount, runtime reload, inactive windows, multiple
   surfaces/popups, and module absence in native runs.
5. Measure import/startup/bundle cost. Verify package/autolinking, C++/WinRT
   registration, Apple pod/Objective-C++ codegen, and Release packaging. Do not
   set `includesGeneratedCode` on a cross-platform package unless generated code
   is actually shipped for every supported platform.
6. Establish Office Win32 host integration separately. Promote the package only
   if it removes duplication or closes the observed gap; otherwise keep the
   adapter local and record why.

Deliver an ADR before public exports or manifests change. A native package
cannot replace correct selection sequencing, React ref cleanup, or visual policy.

## Implementation sequence

### P0. Establish three native desktop qualification lanes

**Owner:** Storybook/desktop-driver test infrastructure and component stories.
**Prerequisite for behavioral rollout:** real physical-click and keyboard support.

1. Use paired V1/new Win32 scenes to establish behavior for Button, Checkbox,
   Switch, Radio/Tab navigation, and popup opening/dismissal. Run the same
   behavioral scenarios against new Windows Fabric components in a separate
   host; do not require loading V1 Paper components into Fabric. Add macOS
   variants for AppKit-specific click, key phase, keyboard settings, field
   editor, first-responder, and key-window behavior. Use stable test IDs,
   recorded theme/scale, and existing V1 E2E sequences [V11]. Exclude mobile/stub
   entrypoints from reference claims.
2. Record native focused element, event target/currentTarget, event phase,
   keydown/up, press-in/out/press, focus/blur, modality, and activation count.
   Capture focus state before and after native property updates.
3. Include focus arriving from outside the scene, imperative `.focus()`, popup
   creation, click on the already-focused target, and keyboard use after that
   click without a focus transfer.
4. Compare native/custom rings independently on all three endpoints, retaining
   current defaults during investigation. Record Fabric native focus reasons
   and macOS key-window/first-responder state where exposed. Establish whether
   support is sufficient, not just whether a prop survives JavaScript.
5. Turn selected traces into deterministic regressions. Keep diagnostic logging
   test-only and remove it from normal runtime paths.

**Exit:** recorded, non-skipped native results for focus delivery and exactly-once
activation. If the host lacks input capability, report the lane as blocked, not
passed. Confirm popup restoration in native tests rather than inferring it from
`target`, FocusTrapZone names, or snapshot output.

### P1. Repair the focus-target and activation contract

**Owner:** `framework-base` interaction/focus adapters; component state hooks.
**Depends on:** P0 event/ref findings.

- Provide one platform-aware focus-request path for real native targets, preserving
  caller refs and the V1 focus-before-press behavior where the new host needs it.
  Implement V1 observable outcomes on Fabric too, with explicit AppKit differences
  on macOS. Keep fork imports in `.win32.ts`, `.windows.ts`, and `.macos.ts`
  adapters. Do not import all legacy interaction hooks into the new package.
- Track actual self-focus separately from descendant focus. Qualify bubbling
  focus/blur on nested pressables; do not mark every ancestor as the focused
  control. Disabled, removed, and re-enabled controls must not retain phantom
  focus.
- Centralize keyboard phase, handled-key descriptors, propagation rules, repeat,
  modifier, and accessibility-activation behavior where shared. Do not install a
  second activation path on top of native Pressable without proving it is needed.
- Use Button's keydown/keyup pairing as evidence for the menu-close/reopen case,
  but do not copy its module-global guard blindly. Prefer a scoped gesture token
  that can survive the relevant popup lifetime without coupling unrelated scenes.
- Resolve Switch's `onPress` plus `onKeyUp` path from native traces. Required result:
  one toggle and one caller notification per intentional activation.
- Keep disabled and disabled-focusable policy explicit per control. V1 menu items
  and tabs differ intentionally; any public `disabledFocusable` addition needs
  its own reviewed accessibility/API contract.
- Preserve Card's structural ref and Input's TextInput slot ref contracts; add
  internal focus-target plumbing rather than silently redirecting public refs.
- Reuse Framework Base's ref composition and cleanup and meet the modern-ref
  acceptance contract above. Do not recreate V1 componentRef or freeze tags at
  render time. Native-lib use is gated by N0, not assumed.

**Exit:** Button/Checkbox/Switch canaries pass pointer, Enter, Space, repeat,
modified-key, accessibility activation, blur-between-keydown/up, and unmount cases.
No duplicated action, lost caller event, or parent/child double focus.

### P2. Make focus-visible state current without rerendering the scene

**Owner:** design root controller plus component `useFocusVisuals`.
**Depends on:** P0 event ordering and P1 reliable self-focus.

- Preserve stable `RootSettings` identity and the single root tracker. Add an
  opt-in modality-change notification path for the active custom-ring owner.
  Subscribe only while it is focused; do not change the context value or broadcast
  React state updates throughout the scene.
- Reconcile the current snapshot on focus/subscription so a focus-before-key
  delivery sequence cannot permanently miss the initiating keyboard modality.
  Remove the manual `rerender` requirement from the same-target regression test.
- Verify which pointer/responder events actually arrive on each endpoint. Retain only the
  necessary root capture surfaces and compose user handlers without swallowing
  navigation or claiming the responder.
- Separate current physical modality from explicit programmatic focus intent.
  A menu opened by pointer may need different feedback from a keyboard-invoked
  popup or restored keyboard focus; do not globally change modality to keyboard
  merely because `.focus()` was called.
- Model native-window/event boundaries separately from React theme boundaries.
  A popup can inherit theme/settings yet require its own event-registration
  boundary if events do not reach the outer root. Register it against the owning
  scene controller; do not create an unrelated theme root just to repair capture.
- Retain `alwaysVisible` as a focused-only custom-path override. Expose owner-level
  intent through internal composition first; do not add it to every component's
  public props by default.
- Reconcile renderer focus state and window activity separately from physical
  modality. Use AppKit readiness and scoped Fabric signals; add native projections
  only if existing supported APIs cannot meet the contract.

**Exit:** an already-focused ring updates on keyboard/pointer changes without
manual rerender, refocus, or unrelated state changes. Theme switches preserve the
controller. Nested themes share it; independent scenes remain isolated; popup
subscriptions clean up. Unfocused components do not rerender for modality changes.

### P3. Correct composite navigation and focus-return ownership

**Owner:** TabList/Tab and existing popup owners; native focus adapters.
**Depends on:** P1; P2 for correct visual feedback.

- Separate a requested destination from confirmed native focus. For TabList, apply
  the target's focusability/selection state before requesting focus, cancel stale
  requests, and reconcile through the resulting focus event. Avoid optional-chain
  no-ops that leave active state pretending focus moved.
- Evaluate reusing the existing FocusZone navigation contract versus retaining a
  JS roving implementation. Pick one owner per scope; do not let both consume the
  same arrows. Preserve automatic/manual selection modes.
- Port V1's selection-before-focus accessibility ordering, but do not add its
  Ctrl+Tab behavior to the new public TabList contract without review.
- Recover when the active item is removed/disabled and when all items are disabled.
  Preserve unrelated caller handlers and reserve text-editing keys for Input.
- Define initial focus, submenu-close return, Escape/Tab handling, hover focus,
  pointer capture, and return-to-trigger by dismissal reason. Outside-click
  dismissal must not steal focus back from the control the user just clicked.
- If a trigger is removed or becomes unfocusable, use an explicitly owned fallback
  or leave focus at the user's destination; never issue a stale ref request.

**Boundary:** the current new MenuItem is only a leaf. Implement its reliable
focus/activation now; a complete new menu owner, FocusTrapZone redesign, or new
RadioGroup is not implied by this plan. Apply popup cases to existing owners and
carry their requirements into future container contracts.

**Exit:** native focus, active item, selected item, and visible ring agree after
arrow/Home/End movement, rapid changes, removal, popup opening, and dismissal.
Verify Narrator ordering on both Windows endpoints and VoiceOver behavior on
macOS, not only React state values.

### P4. Qualify visual parity and roll out deliberately

**Owner:** component styles, shared focus styles, and conformance stories.
**Depends on:** P1-P3 as relevant to each component.

- Keep `ThemeState` separate from `useFocusVisuals`. Cache theme-only values in
  `applyFocusRingStyles`; keep resolved radius, target bounds, inset/outset, and
  interaction state outside shared theme caches.
- Compare V1 and new rings on filled/transparent backgrounds, rounded/square/
  circular targets, high contrast, scaling, clipped ancestors, nested controls,
  and selected/disabled states. Test opaque native system colors in the native
  renderer rather than converting them into guessed literal colors.
- Only add shared geometry options when measured cases require them. Do not copy
  Button's special inner-border treatment to every control or equate native
  Windows Fabric/AppKit geometry with Win32 rendering.
- Revisit the Win32 native-ring default only with the P0/P4 evidence and an explicit
  contract decision. Native and custom visible rings must never compete.
  Include Button primary versus high-contrast behavior and menu hover suppression
  in this decision; renderer choice and requested ring visibility are separate.
- Roll out from canaries to all eleven focus-visual consumers, update specifications,
  preserve the standalone decorative FocusVisual contract, and record changesets
  for intentional public behavior/type changes.

**Exit:** reviewed behavior and visual evidence on Win32, Windows Fabric, and
macOS. Fabric is a first-class V1-backed target, not only a regression lane.
A successful story traversal is an additional smoke
check, not a substitute for native input and accessibility qualification.

## Required acceptance matrix

| Scenario                                                  | Required result                                                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Tab/Shift+Tab enters/leaves scene                         | Real focus target is correct; keyboard ring is visible; one tab stop per declared owner.                                |
| Pointer activation, including already-focused target      | Correct native focus and exactly one action; ring follows the control's pointer policy immediately.                     |
| Keyboard after pointer without focus transfer             | Active custom ring updates without explicit rerender; modifier-only/IME input follows the reviewed classification.      |
| Enter/Space, repeat, modifiers, keydown then blur/unmount | No duplicate toggle, stale key-up activation, or menu reopening.                                                        |
| Disabled/re-enabled/removed target                        | Correct per-control discoverability; no activation or phantom self-focus.                                               |
| Nested controls                                           | Only the actual owner displays focus; child activation does not invoke ancestors unintentionally.                       |
| TabList movement/removal                                  | Actual native focus tracks committed focusability; automatic/manual selection and Narrator order remain correct.        |
| Popup keyboard/pointer open and each dismissal reason     | Correct initial focus, key containment, visual intent, and guarded focus return.                                        |
| Theme/high-contrast changes while focused                 | Stable scene/slot identity and current colors; geometry does not clip or duplicate native visuals.                      |
| Independent scenes and native popup boundaries            | No shared invocation guard leakage, stale controller listener, or missed popup modality event.                          |
| Object/callback refs, cleanup, replacements, remounts     | One live target per attachment generation; public root, inner target, and anchor contracts remain intact.               |
| macOS inactive-window first click and keyboard settings   | AppKit-appropriate focus/activation and key-view navigation, without forced Windows click-focus behavior.               |
| macOS field editors and VoiceOver                         | Editable native targets and accessibility focus/actions are not confused with wrapper self-focus.                       |
| Fabric native focus reasons and island transitions        | V1 observable behavior with correct native ownership, intent, and confirmed target acquisition.                         |
| Optional native service absent or target stale            | Existing supported paths work; unavailable/stale outcomes are explicit and JS import does not require an absent module. |

## Validation and limits

Use owning workspace scripts for unit/type checks and relevant component stories
for native plans. Keep tests under `ThemedRoot`; include real focus event payloads
and ref behavior in integration coverage. Assert handler forwarding and exact
action counts, not only mocked `.focus()` calls.

The final qualification lane must advertise physical-click and keyboard
capabilities and produce non-skipped results. Use separate app-owned Win32,
Windows Fabric, and macOS lifecycles
and stop owned Metro/app processes between runs. Protect unrelated sessions and
do not alter disabled-input policy to make a report appear green.

No native tests were run during this investigation/refinement; macOS native
code was researched from this Windows checkout. Native event ordering, complete
Callout/FocusTrapZone restoration, renderer ring behavior, and the native-lib
spike remain explicit evidence gates. Do not port mobile stubs, macOS timing
workarounds, legacy global state, or all V1 APIs wholesale.

Public architecture references:

- [React 19 ref props and callback cleanup](https://react.dev/blog/2024/12/05/react-19)
- [React Native 0.81 Fabric native commands](https://reactnative.dev/docs/0.81/the-new-architecture/fabric-component-native-commands)
- [React Native 0.81 TurboModules](https://reactnative.dev/docs/0.81/turbo-native-modules-introduction)
- [RNW New Architecture](https://microsoft.github.io/react-native-windows/docs/new-architecture)
- [RNW native components](https://microsoft.github.io/react-native-windows/docs/native-platform-components)
- [AppKit first responder and key window](https://developer.apple.com/documentation/appkit/nswindow)
- [AppKit makeFirstResponder result semantics](<https://developer.apple.com/documentation/appkit/nswindow/makefirstresponder(_:)>)

Web documentation supplies architectural guidance; the pinned installed sources
remain authoritative for this checkout's detailed APIs.
