---
id: components.remaining-work
kind: instruction-reference
owner_paths:
  - packages/agentic/components
---

# Remaining work

Open work for the agentic component catalog. Completed work is removed rather than marked done; implemented behavior
is documented in the owning reference, component contract, or the repository focus references (`focus.common`,
`focus.windows-win32`, and `focus.macos`).

## ToggleButton and the Button migration

The [ToggleButton contract](../src/components/toggle-button/SPEC.md) implements a separate Subtle control. Check
native Toggle delivery, checked state and high-contrast selection on each desktop endpoint before claiming parity.
The [consumer migration](../src/components/toggle-button/spec/usage.md) requires an explicit decision for
non-Subtle and square callers.

## Flex 1.7 endpoint gates

- Require a verifiable native popup relationship for Menu, MenuButton and Dropdown, not only an expanded property
  or a hint. Qualify Dropdown's invalid-state projection and associated error text separately.
- Qualify Popover's natural boundary exit before changing its current Tab cycle. Qualify Dropdown and MenuButton
  continuation per renderer; Office Win32 does not yet support forward continuation from these popups.
- Author and review PresenceBadge before enabling visible presence in Avatar. The identity marker and its activity ring
  do not stand in for presence.

## Desktop focus qualification

- **Issues:** [#4274](https://github.com/microsoft/fluentui-react-native/issues/4274); popup-family restoration in
  [#4377](https://github.com/microsoft/fluentui-react-native/issues/4377) and modal scopes in
  [#4379](https://github.com/microsoft/fluentui-react-native/issues/4379).
- **Outcome:** native focus delivery, activation, accessibility, and focus visuals are qualified on Office Win32,
  React Native Windows Fabric, and macOS, using V1 Win32 as the behavioral reference for both Windows endpoints.
- **Current state:** the shared focus foundation is implemented (Framework Base focus targets, design root input
  modality, `useFocusVisuals`, and `applyFocusRingStyles`), and the focus-ring components use it. macOS Fabric and
  Paper run the shared `desktop-focus` cases without skips. The last recorded Windows Fabric and Win32 runs covered the
  earlier 18-case catalog (C-FOCUS-015), before the follow-up activation and modality repairs.
- **Open gates:**
  - rerun the current `desktop-focus` cases on Windows Fabric and Win32 with real input and zero skips;
  - invoke UIA `TogglePattern.Toggle` and `SelectionItemPattern.Select`, and macOS AX custom actions, natively rather
    than inferring them from clicks or state reads (the Desktop Driver now lists macOS AX custom actions through
    `getProperty('accessibilityActions')`: Fabric publishes `Toggle` and `Select`, while Paper publishes nothing until
    the declaration carries a `label`, C-A11Y-007; invocation is still open);
  - qualify Narrator on both Windows endpoints and VoiceOver on macOS;
  - resolve or explicitly accept the native state announcement gaps: Win32 editors report UIA `IsEnabled` when
    noneditable (C-FOCUS-015), and RNmacOS Fabric does not project disabled or selected state without the
    repository-local patch (C-A11Y-005; see `@fluentui-react-native/native-core/references/remaining-work.md`);
  - compare paired V1 and agentic scenes for Button, Checkbox, Switch, Radio, Tab navigation, and popup opening and
    dismissal, with AppKit-specific click, key-phase, keyboard-setting, field-editor, and key-window variants on macOS;
  - qualify visual parity of native and custom rings across filled and transparent backgrounds, rounded, square, and
    circular targets, high contrast, display scaling, clipped ancestors, and selected or disabled states, then make
    an explicit decision on the Win32 custom-ring default, including Button primary and menu hover behavior.
- **Native services:** add a native focus or window observation service only after a qualification run identifies a
  signal that existing renderer APIs cannot supply. It belongs in `@fluentui-react-native/native-core` (R-NATIVE-001),
  needs two real consumers, and must not replace correct selection sequencing, ref cleanup, or visual policy.
- **Done when:** each endpoint has non-skipped native evidence that focus enters and leaves scenes correctly, pointer
  and keyboard activation fire exactly once, keyboard modality updates an already-focused ring without a rerender,
  disabled and removed targets neither activate nor keep phantom focus, collection focus matches committed selection,
  popups restore focus by dismissal reason, and theme or high-contrast changes keep stable identities.

## Tooltip native routing

Before exporting the [Tooltip wrapper](../src/components/tooltip/SPEC.md) for
[#4249](https://github.com/microsoft/fluentui-react-native/issues/4249), qualify trigger help, keyboard dismissal
and persistence on macOS Paper/Fabric and Windows Fabric. Compare Office Win32's view prop with `RCTTooltip`
before deciding whether to extract its legacy binding. The wrapper is not yet exported.

## Form contracts awaiting review

Review [Field](../src/components/field/SPEC.md) ([#4225](https://github.com/microsoft/fluentui-react-native/issues/4225))
and [InfoLabel](../src/components/info-label/SPEC.md) ([#4226](https://github.com/microsoft/fluentui-react-native/issues/4226))
against the implemented [Label](../src/components/label/SPEC.md). Keep native label relationships separate from
matching names and pointer delegation. Discoverable errors, single announcements, help-popup association, and
boundary focus continuation remain open.

## Rating artwork qualification

Verify [RatingItem](../src/components/rating-item/SPEC.md) half-star clipping in both directions at nonintegral
display scales. Confirm that individual stars do not expose native accessibility targets, and that
[RatingDisplay](../src/components/rating-display/SPEC.md) exposes one static summary (none when decorative)
with no native adjustment or press action, on Windows Fabric and Office Win32.

## Command qualification

On the Windows endpoints, verify [CompoundButton](../src/components/compound-button/SPEC.md) native activation,
focus continuation, one useful UIA description and wrapping. Verify [DestructiveButton](../src/components/destructive-button/SPEC.md)
native focus and exactly-once command invocation on those endpoints; qualify its high-contrast presentation
separately on all desktop renderers. VoiceOver and Narrator speech are separate checks.

## AvatarGroup qualification and stack layout

Verify the [AvatarGroup](../src/components/avatar-group/SPEC.md) standalone summary and nested suppression on both
Windows endpoints, and Tab traversal and overflow at enlarged text sizes on each desktop endpoint. Do not admit
stack layout until transparent cutouts over nonuniform native surfaces are qualified.

## Second-wave native gates

- Verify [PresenceBadge](../src/components/presence-badge/SPEC.md) and [Persona](../src/components/persona/SPEC.md)
  host focus during a status update and high-contrast artwork; Avatar itself still has no presence slot.
- Verify native [Swatch](../src/components/swatch/SPEC.md) Select and constrained contrast independent of
  SwatchPicker's unimplemented collection navigation.
- Verify [InteractionTag](../src/components/interaction-tag/SPEC.md) focus when the owner removes a tag and
  [SplitButton](../src/components/split-button/SPEC.md) owner-relative popup exit, focus return and native association.
- Verify [Textarea](../src/components/textarea/SPEC.md) multiline copy, IME, and native read-only and disabled state.
  RNmacOS Fabric can drop multiline naming and automation IDs on remount; qualify that path independently of
  the value-bearing backed editor. Verify that native Tab enters the backed editor rather than its scroll host.
- Verify [MessageBar](../src/components/message-bar/SPEC.md) and [TeachingPopover](../src/components/teaching-popover/SPEC.md)
  screen-reader speech separately from their named content and actions. TeachingPopover still needs popup boundary
  and step-change focus qualification.
- Keep [Drawer](../src/components/drawer/SPEC.md) inline. Modal and alert isolation remain gated on
  [#4379](https://github.com/microsoft/fluentui-react-native/issues/4379).

## Catalog draft review order

The [source report](../spec-source-report.json) distinguishes **missing contracts** from **missing implementations**.
Review the following drafts in dependency order. Entries in the same wave are independently reviewable against the
earlier contracts. A relationship can reuse semantics without requiring the composed component to share its renderer.

| Wave                        | Drafts to review                                                                                                                                                                                                                                                                                                                                                                                           | What the next wave needs                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1: Identity and commands    | [Link](../src/components/link/SPEC.md)                                                                                                                                                                                                                                                                                                                                                                     | Destination semantics and native text-range focus.                                                      |
| 1: Forms and values         | [SearchBox](../src/components/search-box/SPEC.md), [Select](../src/components/select/SPEC.md), [Combobox](../src/components/combobox/SPEC.md), [Scrollbar](../src/components/scrollbar/SPEC.md), [SpinButton](../src/components/spin-button/SPEC.md), [Slider](../src/components/slider/SPEC.md), [ColorArea](../src/components/color-area/SPEC.md), [ColorSlider](../src/components/color-slider/SPEC.md) | Real editor/scroll/picker owners and independent writable values.                                       |
| 1: Feedback and collections | [RadioGroup](../src/components/radio-group/SPEC.md), [Toolbar](../src/components/toolbar/SPEC.md), [List](../src/components/list/SPEC.md), [TreeItem](../src/components/tree-item/SPEC.md)                                                                                                                                                                                                                 | Native focus boundaries, stable row identities and independent actions.                                 |
| 2: First compositions       | [TagPicker](../src/components/tag-picker/SPEC.md), [Rating](../src/components/rating/SPEC.md), [SwatchPicker](../src/components/swatch-picker/SPEC.md), [Dialog](../src/components/dialog/SPEC.md), [Toast](../src/components/toast/SPEC.md), [NavItem](../src/components/nav-item/SPEC.md), [Breadcrumb](../src/components/breadcrumb/SPEC.md), [Tree](../src/components/tree/SPEC.md)                    | In particular, resolve Dialog's mode-specific isolation and NavItem's destination/disclosure ownership. |
| 3: Composite surfaces       | [ColorPicker](../src/components/color-picker/SPEC.md)                                                                                                                                                                                                                                                                                                                                                      | Synchronize exact and continuous color edits.                                                           |
| 4: Application navigation   | [Nav](../src/components/nav/SPEC.md), [SimpleNav](../src/components/simple-nav/SPEC.md)                                                                                                                                                                                                                                                                                                                    | Qualify route ownership, hidden/rail focus recovery and overlay isolation with an actual shell.         |

Do not infer release readiness from catalog coverage. The main cross-component gates are native picker and range
actions, editor-preserving active-option announcements, modal input and accessibility isolation, nested/virtualized
collection focus, and rediscoverable field errors. Each contract identifies its own required evidence and deliberate
web divergences; draft-only parts are not public exports.
