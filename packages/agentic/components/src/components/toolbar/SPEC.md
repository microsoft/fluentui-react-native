---
name: toolbar
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Toolbar

## Review boundary

This original React Native contract for #4248 passed independent coordinator
review on 2026-10-01. The user explicitly approved the bounded ToolbarButton
and Divider composition. The owned implementation and referenced tests/stories
are now authored; lifecycle is `implemented`. Package validation, public
integration, and native readiness remain separate, unexecuted gates in this
worker session. The coordinator generated and
verified `spec/source.json` against the pinned Marketplace and X3 inventories;
there are no release-content differences for Toolbar.

The author consulted `flex-components:toolbar` and every Toolbar file in the
resolved `flex-1.5.0-206c4996` payload. Shared and web are the consulted
surfaces; that payload has no Toolbar mobile or desktop-specific companion.
Web evidence informs the design and navigation requirements, not proof of
native implementation. Private source bodies are not included here.

## Scope

Toolbar provides a named command scope with one keyboard entry point. It does
not execute commands, coordinate selection, render a popup, or keep focus in
an editor. Button remains the activation, selection-presentation, and
focus-visual implementation.

The implementation supports **direct `ToolbarButton` children**, existing
`Divider` children configured for this scope, arrays, and recursively expanded
Fragments. Null and boolean conditional placeholders are allowed. Every
ToolbarButton has an explicit, unique, nonempty `value`; React keys, labels,
native tags, and child positions are not substitute identities.

`ToolbarButton` is a Toolbar-local adapter over the existing Button composition
pipeline, not a replacement Button or a new generic collection framework.
Its state stage obtains Button's existing `focusTarget` and registers that
same controller with its nearest Toolbar. It renders the same native
Pressable as Button, not a focusable wrapper around a Button.

Arbitrary React children are **not** implicitly focus-adapted. Plain Button,
TextInput/Input, custom wrappers, nested Toolbar/TabList, and controls with
interactive descendants are outside this contract. A future explicit
custom-target adapter requires its own contract review. No descendant walk,
child-root introspection, injected legacy `componentRef`, or replacement of
consumer refs is permitted.

**TBR-001:** Validate supported child structure and explicit stable identities;
diagnose unsupported, duplicate, or missing identities using the repository's
effect-based `console.error` pattern. The rejection policy leaves
the structural root mounted but mounts no command subtree and installs no
navigation for an invalid scope. Report the offending child/value and reason,
including in release builds when controls are rejected; never silently drop
only the invalid command and present the remainder as a conforming scope.
The coordinator approved this explicit rejection and diagnostic policy. Do
not fabricate replacement commands or identities.

A rejected root uses safe structural styles only; conflicting caller styles
are not applied to an already-invalid scope. This is an explicit rejection
path, not a successful toolbar with silently defaulted command variants.

## Public contract

### Toolbar

`ToolbarProps` includes required `children` and a required nonempty
`accessibilityLabel`, plus:

- `size?: ToolbarSize`, where `ToolbarSize` is `small | large`; default `large`.
- `direction?: ToolbarDirection`, where `ToolbarDirection` is `ltr | rtl`.
  Omission resolves from React Native's `I18nManager.isRTL`, not a hardcoded
  left-to-right assumption. The resolved direction controls both Yoga layout
  and arrow mapping.
- Supported native View props and `style`, with the public React 19 `ref`
  targeting the structural View.

The only public slot is `root: Slot<typeof View>`. It renders the validated
child order. The root owns the toolbar role, descendant-preserving
accessibility policy, nonfocusable status, and its children. Exposed native
props must omit conflicting role, focusability, tab-index, and native
handled-key settings. The native configuration is `accessible={true}`
and `focusable={false}`, following the current TabList structural-root pattern;
child-preserving AX/UIA behavior is still a required gate. Root `as` replacements
must accept the declared props and forward a compatible native View ref.

There is no group `selected`, `defaultSelected`, `onSelectionChange`,
`disabled`, `orientation`, `wrap`, or `overflow` prop. Child disabled state is
individual. Horizontal orientation and wrapping navigation are explicit
contract policies, not configurable defaults hidden in an implementation.

**TBR-002:** Resolve the size and effective direction, preserve native root
identity and user props, and keep the root out of the keyboard tab sequence.

### ToolbarButton

`ToolbarButtonProps` has required `value`, `accessibilityLabel`, and a nonnull
Button-compatible `icon` slot. It permits `selectedIcon`, `selected`,
`disabled`, supported native Pressable props, `style`, and a native Pressable
`ref`. `disabled` defaults to false. Omitted `selected` is an ordinary command;
either boolean value opts into the existing Button checked-state contract.

Public slots are `root`, `icon`, and `selectedIcon`, with the same host/ref
types as the corresponding Button slots. There is no content slot. Appearance
is `subtle`; size comes from Toolbar. Shape follows the current icon-only
Button default (`circle`). These decisions must be documented and typed,
not achieved by silently overwriting conflicting public props.

The adapter omits appearance, size, shape, content, iconPosition, children,
focusable, tabIndex, native role, and navigation-descriptor overrides from its
exposed surface. Owned checked/disabled accessibility state is merged after
unrelated caller state, as in Button. Conflicting root-slot semantic overrides
are unsupported too. Use outside Toolbar is rejected with the same explicit
diagnostic policy, not an implicit standalone Button mode. A compatible root
`as` replacement must have exactly one native focus/activation target and no
interactive descendants. Slots preserve native events and refs.

Native naming/hiding aliases that bypass required labels or hide descendants
are excluded. ToolbarButton also excludes native checked/disabled aliases and
checked/disabled entries in caller accessibility state; use `selected` and
`disabled`. Unrelated state such as `busy` remains supported.

**TBR-003:** Reuse Button's state/style/render stages and its one native target;
retain caller-owned `selected`, exactly-once activation, decorative icons,
and disabled-over-pressed-over-hovered precedence. Toolbar never synthesizes
presses, toggles, or accessibility actions.

### Separators and customization

A supported Divider has `vertical={true}`, `label={null}`, and no icon.
Its current default label is not suitable here. Toolbar does not rewrite it
or take over its native ref. It stretches across the row's measured cross
axis and never registers a navigation target.

User root and child styles are applied last. Width, margins, and container
constraints can be customized without changing semantic ownership. Changes
that reverse child order, introduce multiple rows, override effective
direction, hide registered commands, or introduce nested focus targets
invalidate this navigation contract and require development diagnostics.
They are not a route to undocumented vertical or overflow support.

**TBR-004:** Preserve command and separator order, forward user style and
handlers, and exclude separators and conditional placeholders from the
keyboard inventory.

## Navigation and refs

There is one Toolbar-local key owner and no production FocusZone import.
The private context supplies membership, active entry identity, navigation
callbacks, and target registration to ToolbarButton. Registration order alone
does not define visual order; the validated child inventory does.

Exactly one eligible command is keyboard-focusable when the scope has an
eligible command. Disabled commands remain accessible but are skipped.
Initial entry is the first eligible command. Confirmed native self-focus,
including eligible pointer or accessibility focus, updates the entry identity.
The last eligible active identity is retained on exit. An all-disabled scope
has no command tab stop; an empty scope is diagnosed but renders safely.

ArrowLeft/ArrowRight follow physical row direction. In LTR, Right advances
through child order; in RTL, Left advances. Home/End address the first/last
eligible identity in logical child order. Arrows wrap across the ends,
including across separators. A single eligible command remains active without
a redundant focus request. Up/Down, modifiers, Tab/Shift+Tab, Enter/Space,
Escape, editing shortcuts, and composition events are not owned by Toolbar.

**TBR-005:** Maintain one eligible entry point, skip disabled commands, and
support logical Home/End plus direction-correct wrapping horizontal arrows.

**TBR-006:** Native Tab/Shift+Tab enter and exit the scope without a trap, an
extra root stop, or selection/activation side effects. Reentry uses the
retained eligible identity.

Eligibility changes commit before a layout-effect `requestFocus('keyboard')`.
The active tab stop, pending destination, and last confirmed self-focused
target are distinct. A request is confirmed only by the target's native
focus event/snapshot, not a void `focus()` return or an updated React value.
Superseding navigation, Tab exit, self-blur out of the scope, disabling,
detachment, replacement, and unmount cancel stale requests. No fixed delay,
unbounded retry loop, assumed-success fallback, or renderer-tag registry is
part of this contract.

**TBR-007:** Register current ref-backed Framework Base FocusTargets with
generation-aware cleanup, commit eligibility before requesting, and distinguish
requested/confirmed/cancelled/unavailable outcomes. Warn with the value and
actual failure status when a requested destination is missing or unsupported.

The public Toolbar View ref never becomes a child ref. ToolbarButton's public
Pressable ref and Button's internal `focusTargetRef` compose through Framework
Base's slot runtime. Support object refs, callbacks returning React 19 cleanup,
null detach, compatible slot replacement, and development setup/cleanup cycles.
An older cleanup cannot unregister a newer target with the same value.

**TBR-008:** Preserve both public roots, user callback cleanup, and exactly one
live registered target per identity without a new merge-ref helper.

On removal or disable, retain an eligible active identity or choose the first
remaining eligible command. Do not activate or select it. This implementation
repairs the next tab entry but does **not** promise imperative restoration
after removal: current public target APIs do not prove active-window ownership
or the external destination. Never steal outside focus on cleanup.

**TBR-009:** Handle reorder, removal, disable, identity change, replacement, and
all-disabled transitions deterministically; cancel stale work and never turn
entry-point repair into an unconditional native focus request.

## Platform behavior

The root supplies the native toolbar role and its purpose label while keeping
individual command and separator semantics available. It must not flatten
the accessible subtree into one actionable element. The exact AX/UIA
projection is a native acceptance gate, not established by the role string.

**TBR-010:** Preserve toolbar naming and child role/name/state/action exposure
on each claimed endpoint. Do not manufacture item-count announcements,
orientation announcements, or a toggle action absent from the leaf contract.

**TBR-011:** Bind row gap to the FURN tokens in `spec/tokens.yaml`; keep root
surface, typography, elevation, and motion unowned. Delegate separator stroke
and command interaction/focus visuals to their existing components, with
immutable theme-only style caches and user styles last.

## Divergences from Flex

The immutable Flex input is normative for design requirements. Current Button,
TabList, Framework Base, desktop native sources, and their recorded native
results support feasibility and compatibility; they are not a second
unversioned normative design source. No fresh Toolbar native result exists.
The coordinator verified Marketplace/X3 identities and no release differences
before pre-code approval. Those immutable identities are preserved.

The coordinator approved the following adaptation boundaries. Native
projection remains unknown until endpoint evidence exists:

- `toolbar-explicit-button-adapter` (adapted): ToolbarButton provides a bounded
  registration boundary without changing Button or interpreting arbitrary
  children. The coordinator approved this API and the invalid-scope
  rejection/diagnostic policy.
- `toolbar-current-button-selection` (adapted): selected ToolbarButton reuses
  the existing externally driven Button contract; it does not require or
  introduce a separate ToggleButton API. Revisit after #4215/#4247 alignment.
- `toolbar-native-target-navigation` (adapted): native focusability and
  confirmed ref targets replace browser tab-index machinery. RTL behavior
  is a declared native adaptation where the consulted source is silent.
- `toolbar-removal-entry-repair` (adapted): removal repairs entry state without
  promising safe cross-window native restoration.
- `toolbar-native-accessibility-projection` (unknown): role, group preservation,
  and announcements require AX/UIA evidence. Web item-count and orientation
  announcements are not assumed portable.
- `toolbar-native-focus-visuals` (adapted): retain the current shared child
  policy, native on Windows/macOS and custom on Win32. Do not revive #4248's
  older all-custom ring requirement.
- `toolbar-no-overflow` (not applicable): none of the five consulted Toolbar
  files requires overflow or a Menu. The first contract has no automatic
  hiding, measurement priority, scroll host, or popup trigger. A future overflow
  proposal must declare the actual Menu dependency if it uses Menu.
- `toolbar-desktop-only` (deferred): mobile qualification and source admission
  are not included in this contract.

**TBR-012:** Keep unsupported custom/nested/editable composition, vertical
layout, overflow, and mobile capabilities explicit; never omit a newly required
dependency merely to keep work concurrent.

## Required and optional capabilities

Named grouping, both sizes, eligible-entry coordination, RTL-aware arrows,
Home/End, wrapping, native Tab exit, stable refs, and external action ownership
are required. Separators, selected presentation, selected-icon replacement,
caller events/styles, and compatible native-root replacement are optional
consumer features with mandatory correctness when used. Automatic overflow,
arbitrary custom targets, nested collections, editors, vertical layout, and
mobile qualification are excluded rather than optional undocumented modes.
Native projection and key-transport failures block the affected readiness
claim; they cannot disable a required behavior silently.

## Conformance

All paths below are component-relative and **exist**. Source metadata records
their requirement associations. Tests and executable native stories are
authored but were not run here; file existence is not an execution result.
Pre-code review approved
the bounded adapter, current externally selected Button semantics, explicit
invalid-scope diagnostics, horizontal/wrapping policy, and entry-only removal
repair. Its implementation is authored; execution remains deferred.

| Requirement | Realized evidence files                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| TBR-001     | `useToolbar.ts`, `toolbar.test.tsx`, `toolbar.types.test.tsx`                                                          |
| TBR-002     | `toolbar.types.ts`, `useToolbar.ts`, `toolbar.types.test.tsx`, `toolbar.test.tsx`                                      |
| TBR-003     | `toolbar-button.types.ts`, `useToolbarButton.ts`, `renderToolbarButton.tsx`, `toolbar.test.tsx`, `toolbar.stories.tsx` |
| TBR-004     | `renderToolbar.tsx`, `toolbar.test.tsx`, `toolbar.stories.tsx`                                                         |
| TBR-005     | `useToolbar.ts`, `toolbar.test.tsx`, `toolbar.stories.tsx`                                                             |
| TBR-006     | `toolbar.test.tsx`, `toolbar.stories.tsx`, `spec/native-evidence.md`                                                   |
| TBR-007     | `ToolbarContext.ts`, `useToolbar.ts`, `useToolbarButton.ts`, `toolbar.test.tsx`, `spec/native-evidence.md`             |
| TBR-008     | `renderToolbar.tsx`, `renderToolbarButton.tsx`, `toolbar.test.tsx`, `toolbar.types.test.tsx`                           |
| TBR-009     | `useToolbar.ts`, `toolbar.test.tsx`, `toolbar.stories.tsx`                                                             |
| TBR-010     | `useToolbar.ts`, `toolbar.test.tsx`, `toolbar.stories.tsx`, `spec/native-evidence.md`                                  |
| TBR-011     | `toolbar.styles.ts`, `useToolbarStyles.ts`, `useToolbarButtonStyles.ts`, `toolbar.test.tsx`, `toolbar.stories.tsx`     |
| TBR-012     | `toolbar.types.ts`, `toolbar.types.test.tsx`, `toolbar.test.tsx`, `spec/usage.md`                                      |

`spec/native-evidence.md` explicitly records NOT RUN on all three endpoints.
Package/root validation, exact public exports, story-project inclusion,
reporting, and native instances belong to the coordinator. Scoped formatting
and syntax parsing are not substitutes for their lint/build/test/native gates.

No new toolbar-level state-dependent visual subtree is introduced. Runtime
style comparisons verify both gap bindings, child size delegation, minimum
targets, user precedence, and absence of root surface styling instead of a
redundant full-tree snapshot. Button's existing visual-state coverage remains
the reference for the unchanged child pipeline.
