---
name: popover
platform: react-native (Windows, macOS)
status: contract-reviewed
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Popover

## Scope

Popover is a trigger plus an anchored floating surface. It owns open state, trigger semantics, the anchor relationship, the tokenized surface, and the mount lifetime of the floating content. Its consumer supplies the trigger presentation and the surface content.

Popover does not own placement geometry, viewport containment, dismissal policy, or focus transfer. Those belong to the native `@fluentui-react-native/callout` surface on Windows and macOS. Where that surface does not implement a Flex behavior, or implements it differently per platform, this contract records a divergence instead of emulating the behavior in JavaScript. Popover also does not provide a selection model, block the underlying surface, or coordinate nested floating surfaces.

This selective recovery for #4236 is based on
`c3a89b0b717a6bcc8c2104fdb11b733b1a725356`. The reviewed original contract
and provenance remain identified at donor
`fdc8914c6ee2ba124ccd68f3b9e0ef841a60342d`; the sizing repair at
`a0fe649874156980d393b2a739167692c893bee8` is already included in that donor.
Unchanged open-state, anatomy, naming, surface-token, and exclusion decisions
are retained. Changed focus/ref, action transport, popup input attachment,
host lifetime, and evidence requirements were approved by independent
coordinator pre-code review on 2026-10-01. Local implementation and authored
tests/stories now exist; endpoint qualification is not represented by them.

Bounded host gate **P** and prospective Menu gate **FM** are different gates.
See [host feasibility](./spec/host-feasibility.md). P does not imply portable
initial child focus, reason-aware dismissal, safe restoration, Menu navigation,
or Tooltip's non-focus-taking behavior. Office Win32 is a separate Windows
endpoint whose host behavior must be qualified independently.

## Public contract

Open state is self-driving: `defaultOpen` initializes uncontrolled state, `open` makes the value controlled, and `onOpenChange` receives the requested next value in either mode. A controlled value is never changed internally. `position` selects a preferred anchor edge and defaults to `bottomLeftEdge`. `disabled` disables the trigger and prevents opening from trigger activation; it does not suppress cleanup of an already-open native surface. `surfaceAccessibilityLabel` names the floating surface and is distinct from the trigger's own name, which comes from the `trigger` slot. `accessibilityState` preserves unrelated consumer state on the trigger. The root accepts the owned `ViewProps` surface, including `style`; Popover owns root accessibility semantics because the root must stay a passive wrapper.

The reviewed recovered API has no public `focused` override. The donor's override
painted focus without native self-focus and bypassed the current shared ring
policy. The coordinator approved its removal and the current shared native/custom
ring policy during pre-code review. There is no `initialFocus`, return-focus target, dismiss-reason callback,
arrow, modal, selection, hover-open, or window-command prop.

`root` is a passive inline `View` wrapper. Its top-level React 19 `ref` refers
to that View, never the trigger or popup. `trigger` is a public `Pressable`
slot narrowed to presentation and observers: children, style, test identifier,
accessible name and hint, native observers/actions, a `ref`, and an `onPress`
that runs after the component's own toggle. Popover owns role, expanded and
disabled state, activation, focusability, and interaction tracking.
Conflicting aliases are excluded too. The trigger cannot use an `as`
replacement. Its public ref, internal anchor ref, and focus-target ref are
composed by Framework Base's slot runtime, including callback cleanup.
`content` is an optional public `View` slot; omitting it renders a placeholder,
and `null` renders an empty surface. A compatible content `as` replacement
must forward its own declared native ref.

The floating surface and its content mount only while open and attached to a
live trigger. A closed popover contributes no popup view, accessibility node,
or focus target. Private slots are the optional Callout `surface`, its first
non-collapsible `surfaceContent` host using `RootInputBoundary`, and the
optional trigger `FocusRing`. They are not additional public slots.
The content host preserves the existing theme and scene input controller;
it is not another `ThemedRoot` or focus scope.

The resolved state retains the requested open value, position, disabled state,
native trigger interaction and focus binding, theme state, public/private
slots, placeholder state, trigger children, and user styles. Attachment
generation and actual host visibility are separate from requested `open`.
The state/style/render stages remain `usePopover_unstable`,
`usePopoverStyles_unstable`, and `renderPopover_unstable`.

### Reviewed P1/P2 unstable composition amendment

The [2026-10-02 composition amendment](./spec/composition-amendment.md)
defines an optional semantic second argument to `usePopover_unstable` for
macOS Menu hosting and an external committed existing row anchor.
It does not change `PopoverProps`, ordinary one-argument behavior, source
pins, token bindings, or ordinary assembly behavior. Independent coordinator
review approved it on 2026-10-02; the native-derived types and owned
implementation/regressions are present, with integrated execution deferred.

The adapter binds only the actual mounted native handle and ready generation,
forwards original native observers once, invalidates native-hidden controlled
attempts, and reuses the existing Popover anchor machinery without another
row/trigger. The passive top-level View/ref remains unchanged.
All family/selection/navigation/Tab/return behavior remains Menu/native-owned;
the macOS policy does not admit new Windows or Win32 behavior.

### Requirements

- **POP-001:** Resolve the documented defaults and implement controlled and uncontrolled open state without mutating a controlled value. Preserve omitted versus `open={false}`; ignore `defaultOpen` while controlled.
- **POP-002:** Render the wrapper, trigger, and anchored surface tree, mounting the surface and content only for an open session with a live anchor. Preserve omitted-placeholder versus null-empty content.
- **POP-003:** Expose the trigger as a button reporting expanded state and disabled semantics. Compose its consumer, anchor, and focus-target refs; run an enabled consumer press observer after the owned toggle.
- **POP-004:** Name the floating surface from `surfaceAccessibilityLabel`, warn in development when the name is missing, and apply the surface name and role to the React Native content host inside the popup rather than to the native popup window.
- **POP-005:** Draw the whole surface boundary, clipping, padding, and 200-unit native sizing floor on the content host. Use the shared trigger focus policy instead of the donor's unconditional custom ring.
- **POP-006:** Anchor to the live trigger using the preferred edge. Report native dismissal through the same boolean open-state request channel, including dismissal while the trigger is disabled; do not infer a reason.
- **POP-007:** Keep anchor gap, arrow presentation, dismissal suppression, anchor rectangles, named anchors, window commands, minimum display padding, elevation shadow, motion, initial child selection, and focus return outside the public contract.
- **POP-008:** Named expand/collapse actions request the stated value once; an already-satisfied request does nothing. Controlled state stays external. Preserve caller labels and unrelated actions, forwarding the original accessibility event once after the owned request. Never synthesize `onPress` from an action or add transitions for tap/invoke/activate aliases.
- **POP-009:** Keep root, trigger, content, and anchor identities distinct. Support object/callback refs, React 19 cleanup, null detach, same-instance handoff, replacement, and unmount without stale targets or stale-dismiss callbacks. Native Callout hooks belong to the mounted open session, not the closed Popover state hook.
- **POP-010:** Attach popup content to the existing input controller with `RootInputBoundary`. Preserve nested theme identity and caller observers; physical popup input updates scene modality without creating another scene or forcing keyboard modality for programmatic focus.
- **POP-011:** Use `useFocusablePressable` and compose its native target ref on the trigger. Use `useFocusVisuals` plus styling-stage `applyFocusRingStyles`; only actual enabled self-focus determines visibility. Preserve platform activation phase, cancellation, exactly-once press delivery, and disabled-before-pressed-before-hovered precedence.
- **POP-012:** Resolve Windows Fabric lowercase expand/collapse, Office Win32's declared `Expand`/`Collapse`, and macOS declared custom actions through the extended shared `resolveAccessibilityAction`. Deduplicate owned declarations with caller labels intact and preserve exact observer events.
- **POP-013:** Qualify bounded P independently on each claimed endpoint: actual anchor/content geometry, constrained/scaled text, theme/modality, native popup content semantics, attachment and dismissal races, ref replacement, and host cleanup. Discovery exclusions, unsupported properties, mocks, and skipped critical cases are not native passes.
- **POP-014:** Preserve public/base behavior while exposing the amendment's macOS-only semantic composition host binding.
- **POP-015:** Preserve React 19 binding cleanup, current attachment/generation validity, and original ready/context/show/pointer/dismiss delivery exactly once.
- **POP-016:** Reuse the existing Popover machinery for an explicitly committed row ref/mount generation and its existing lifetime, rendering no duplicate trigger or native row wrapper.
- **POP-017:** Keep native-hidden managed attempts invalid until deliberate rearm, with one false request and a native context/legacy teardown barrier.
- **POP-018:** Keep family/window focus, native Tab/Escape, physical pointer filtering, and guarded restoration native/Menu-owned; reject unsupported managed policies.

## Platform behavior

The Callout dependency is the approved narrow production exception in
`../../AGENTS.md`. That does not authorize FocusZone or Native Lib imports.
Public declarations alone do not establish the native capability matrix.

macOS maps fourteen hints onto four edges and aligns a below-anchor surface
to the leading edge. It has selected flip/slide corrections, not complete
viewport containment. Windows Fabric passes all hints to
`CalculatePopupWindowPosition` with `TPM_WORKAREA`; the donor's assertion that
Windows never repositions is inaccurate. That call is not proof that oversized
content always fits, and its result is not checked by Callout. Win32 positioning
is host-supplied and has not been executed in this recovery.

Surface appearance is drawn by the React Native content host inside the popup,
which Windows/macOS render and measure. Windows observes the first portal
child's layout; keep that child non-collapsible. The 200-unit floor is the
existing native text-measurement guard, not a new design token or a maximum.
Constrained content must still wrap; viewport-sized maximums are not promised.
Retain non-null native fill/stroke/radius compatibility values for macOS.
Win32's separate native appearance must not be assumed identical.

macOS dismisses through its cancel operation, local outside left-button
monitor, application resignation, and menu tracking paths. Windows Fabric
registers `InputLightDismissAction.Dismissed` and emits a reasonless event.
It has no explicit Escape or application-deactivation branch in this
component. The operating system's action may provide additional behavior,
which requires actual endpoint evidence. Neither implementation reads
`dismissBehaviors`; no suppression API is exposed. Win32's supplied native
host has declared restoration/capture capabilities, but native implementation
and reason classification are not established by this package.

Windows Fabric `Show()` requests island focus and navigation to `First`
before emitting `onShow`, ignoring `setInitialFocus`. It does not select a
Menu-owned target or confirm the focus request. macOS `setInitialFocus` makes
the popup key without selecting a descendant. No portable child-focus contract
follows from either path.

macOS `focusWindow` and `blurWindow` are implemented through Paper and Fabric:
they make the popup or its parent key. This corrects the donor's contrary
claim. They neither select a child nor guard against stealing outside-click
focus. Windows Fabric's corresponding handlers remain `nyi`.
`onRestoreFocus` is declared with `containsFocus`, but Windows/macOS do not
emit it. A Win32 declaration or the boolean alone supplies neither dismissal
reason nor active-window eligibility. Popover never restores unconditionally.

Callout's `onShow` is a show notification, not a content-layout/focus-ready
handshake. Its wrapper resolves a target ref to a numeric tag in an effect
depending only on the ref object. A `.current` replacement is not tracked.
The recovery must preserve committed attachment generation and mount a
fresh host session against that generation, rather than reuse a naked tag.
See the interaction companion for the bounded lifetime plan.

## Divergences from Flex

The original identifiers remain stable. Retained donor dispositions and the
changed bounded adaptations were approved on 2026-10-01.

Authority is resolved per requirement in `source.json`: Flex supplies design
intent, the reviewed donor supplies compatibility decisions, native Callout
and renderer evidence bound capabilities, and the recovery baseline supplies
current ref/focus/input mechanisms. None defines every requirement alone.

| Claim group                                                                                           | Disposition in this React Native contract                                                                                           |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Passive surface, replaceable content, explicit trigger, hidden content absent                         | Adopted through retained FURN anatomy and open-session mounting.                                                                    |
| Surface palette, boundary, radius, padding, placeholder type                                          | Adopted through existing FURN token paths; native sizing floor is a separately documented repair.                                   |
| Open ownership, expanded/name semantics, key activation, scene modality                               | Adapted to controllable native state, declared actions, actual refs, and shared focus/input policy.                                 |
| Optional arrow and exact placement alignment                                                          | Intentionally bounded to the retained arrowless API and native hint interpretation.                                                 |
| Browser relationship attributes, document tab order, browser motion preferences                       | Not applicable as native APIs; their accessibility and input goals require explicit native evidence rather than a copied mechanism. |
| Gap, shadow, guaranteed containment, portable initial target/return, window semantics, surface motion | Deferred under the stable divergence identifiers below.                                                                             |
| Windows Escape/deactivation classification, Win32 native event routing, popup AX/UIA projection       | Unknown until endpoint evidence or the separately owned native repair resolves it.                                                  |

- `popover-anchor-gap` - **deferred.** The mapped `spacing.componentBase100` exists, but Windows/macOS Callout does not implement the required offset. Do not substitute a content margin.
- `popover-arrow-not-modeled` - **accepted, retained.** Preserve the arrowless default; do not expose unsupported beak props.
- `popover-escape-dismissal` - **accepted, bounded.** macOS has a cancel path. Windows delegates to native light dismissal; explicit Escape behavior is not established. Win32 remains separately unqualified.
- `popover-focus-return` - **deferred.** Keep no automatic restoration. A boolean open callback cannot distinguish outside click, Escape, navigation exit, or deactivation. Controlled `open` is not a workaround for that missing information.
- `popover-haspopup` - **accepted, retained.** Button role and expanded state do not claim an accessible cross-window controls relationship.
- `popover-initial-focus` - **deferred.** Native popup activation/first navigation is not a portable consumer-selected child target.
- `popover-motion` - **deferred.** No component animation; no delayed focus workaround.
- `popover-placement-alignment` - **accepted, retained.** Keep the full preferred-hint union, with macOS side-only alignment behavior documented.
- `popover-surface-dialog-semantics` - **deferred.** Name and role belong to the content host; actual AX/UIA child exposure and popup relationship remain P evidence obligations.
- `popover-surface-shadow` - **deferred.** A mapped `shadow.low` does not establish an unclipped native-window shadow.
- `popover-viewport-clamping` - **deferred.** Correct Windows source description to native work-area calculation without promoting it to guaranteed containment.
- `native-system-focus-visuals` - **accepted.** The donor's forced custom ring and `focused` API are replaced by the [shared focus policy](../AGENTS.md#focus-visual-policy). Windows/macOS default to native rings; Win32 uses the shared custom path.
- `popover-popup-lifecycle-adaptation` - **accepted.** Callout hooks mount in an open-session React boundary keyed to committed anchor generation. Popup content uses the existing input controller. Same-instance handoffs coalesce at commit completion; true detach invalidates live callbacks immediately.
- `popover-accessibility-action-transport` - **accepted, native projection still gated.** The shared resolver declares expand then collapse and supplies exact endpoint event names. No obsolete donor helper or invocation-alias transition is used. The donor macOS patch is absent at this baseline; native projection remains a separate P gate.
- `popover-menu-composition` - **accepted.** The reviewed P1/P2 amendment defines a macOS-only unstable composition policy and existing-row anchor mode; ordinary Popover remains unchanged. Actual native types are consumed; event/lifetime and family qualification remain distinct from the flat host build.

## Conformance

Implementation, type-test, runtime-test, and typed story artifacts named in
`spec/source.json` now exist. Tests are authored, not executed in this worker.
The [evidence status](./spec/platform-evidence.md) explicitly records native
qualification as NOT RUN. The original
three source entries are preserved; the immutable recovery baseline is added
for changed adaptation requirements. Independent coordinator review approved
the bounded API, source identities, host-session/ref lifetime, shared focus
and input boundary, action resolver, and token bindings on 2026-10-01.
The coordinator reports the integrated base passing 701 component tests,
194 framework tests, the root build, and three desktop bundles, plus the
flat Callout macOS build. Those results are parent-reported, not rerun here,
and do not qualify this amendment or native family interaction.
POP-001..013 retain their reviewed meanings and existing evidence.
The coordinator independently approved POP-014..018 on 2026-10-02.
Document lifecycle is `contract-reviewed`, conformance `reviewed`, with
that review date. New evidence paths now name actual owned source/type/test/
story artifacts. Integrated Jest/build and native family execution remain
parent gates before implemented-contract ratification. Source identities,
prior requirements, and parent fixes are preserved.

The five actually consulted Popover payload files match the pinned Git blob
and SHA-256 identities, including both shared files and all available web
companions. There are no desktop/mobile Popover companions in that inventory.
The exposed CLI alias is `popover`; provenance retains
`flex-components:popover`. The coordinator independently verified all canonical
cache files against the three immutable upstream plugin tree inventories;
Agency's generated runtime envelope is not a replacement source identity.
This establishes pinned content, not native qualification.

Independent review approved the focus API change, private host lifetime,
ref-generation behavior, action-transport disposition, and bounded exclusions.
The coordinator owns public exports, exact export tests,
story type inclusion, aggregate provenance reporting, shared/native repairs,
manifests, changesets, and native instance leases. FM is currently not passed.
