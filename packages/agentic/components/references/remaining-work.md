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
    than inferring them from clicks or state reads;
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

## Components without a local contract

These components had staged specs that were removed under
[#4252](https://github.com/microsoft/fluentui-react-native/issues/4252) (see
[legacy staged specs](contracts.md#legacy-staged-specs)). Their feasibility and blockers were recorded on 2026-08-28.
Several dependencies have landed since, including Popover, Menu, MenuItem, Divider, Tab, and Radio, so re-evaluate each
row against the current package before drafting its contract.

| Component       | Issue                                                                   | Recorded RN feasibility        | Recorded blocker or dependency                                                   | Re-evaluation decision                                                     |
| --------------- | ----------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Breadcrumb      | [#4219](https://github.com/microsoft/fluentui-react-native/issues/4219) | Partial; blocked               | Popover, Menu, and Tooltip surfaces are absent                                   | Define or provide the overlay/menu stack                                   |
| Drawer          | [#4223](https://github.com/microsoft/fluentui-react-native/issues/4223) | Partial; blocked as authored   | Arbitrary-child focus trap and return-focus lifecycle                            | Define a supported native focus-management path                            |
| InfoLabel       | [#4226](https://github.com/microsoft/fluentui-react-native/issues/4226) | Blocked                        | Popover anchoring, dismissal, focus, and trigger accessibility                   | Unblock the shared overlay contract                                        |
| Interaction Tag | [#4227](https://github.com/microsoft/fluentui-react-native/issues/4227) | Feasible in principle; blocked | Avatar/Tag contracts and public package wiring                                   | Re-evaluate against implemented Avatar and Tag, then decide export scope   |
| Label           | [#4228](https://github.com/microsoft/fluentui-react-native/issues/4228) | Blocked as authored            | HTML label/control association has no pure RN equivalent                         | Choose an RN association or visual-only contract                           |
| Link            | [#4229](https://github.com/microsoft/fluentui-react-native/issues/4229) | Partial; blocked as authored   | Web navigation semantics and unsupported underline geometry                      | Explicitly accept an RN text-link approximation or retarget                |
| List            | [#4230](https://github.com/microsoft/fluentui-react-native/issues/4230) | Feasible in principle; blocked | ListItem row, focus, and accessibility contract                                  | Reuse implemented ListItem and define collection focus and accessibility   |
| MessageBar      | [#4233](https://github.com/microsoft/fluentui-react-native/issues/4233) | Partial; blocked               | Cross-platform Fluent status-icon source                                         | Provide canonical status-icon assets                                       |
| RadioGroup      | [#4237](https://github.com/microsoft/fluentui-react-native/issues/4237) | Feasible in principle; blocked | Radio child and label/legend composition                                         | Reuse implemented Radio and decide group labeling and navigation           |
| Scrollbar       | [#4238](https://github.com/microsoft/fluentui-react-native/issues/4238) | Blocked                        | Scroll metrics, tokenized thumb control, and drag interaction need a native host | Define a scroll-source API and platform scrollbar bridge                   |
| Textarea        | [#4245](https://github.com/microsoft/fluentui-react-native/issues/4245) | Blocked as authored            | HTML textarea semantics and CSS resize behavior                                  | Make the product/API choice described below                                |
| Toolbar         | [#4248](https://github.com/microsoft/fluentui-react-native/issues/4248) | Partial; blocked               | Roving focus needs focusable Button refs; Divider was absent                     | Reuse implemented Divider and define imperative focus for toolbar children |
| Tooltip         | [#4249](https://github.com/microsoft/fluentui-react-native/issues/4249) | Blocked as authored            | Anchor/overlay host and trigger-coupled accessibility                            | Establish overlay infrastructure or retarget the contract                  |

**Done when:** each component has a reviewed local contract and implementation, or its issue records a decision not to
provide it.

## Textarea API decision

- **Issue:** [#4245](https://github.com/microsoft/fluentui-react-native/issues/4245)
- **Outcome:** a product and API decision for Textarea.
- **Current state:** CSS `resize` and HTML `<textarea>` semantics do not map to a pure React Native `TextInput`.
- **Done when:** the issue chooses between a platform-native React Native approximation, with no resize-handle parity
  with the documented Windows and macOS behavior, and a web or CSS-specific component.
