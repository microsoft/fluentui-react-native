---
name: toggle-button
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ToggleButton

## Scope

A ToggleButton changes one persistent boolean option, such as whether text is bold. Unlike an action-only Button,
its unchecked state is meaningful even when the caller supplies no state prop. It does not own a group, selection
among peers, a popup, or navigation. This is a pre-implementation scaffold, not a package export.

## Public contract

- **TGB-001 - API and geometry.** Use one native `Pressable` root and forward the caller's ref to it. There is no
  `appearance` prop: the only appearance is Subtle. `size` is `small | medium | large` (default `medium`); `shape`
  is `rounded | circular` (default `rounded`, including icon-only). Adopt the refreshed Button's size-specific
  minimum heights 24/32/40, stroke-compensated padding, and icon sizes 16/20/20. These are minimum heights, not a
  one-line clamp. Do not inherit the legacy Button's implicit circle or square option.
- **TGB-002 - Selection.** `selected` is controlled when supplied, including `false`; otherwise `defaultSelected`
  seeds the value once (default `false`). An accepted activation requests `onSelectedChange(next: boolean)` once.
  A controlled value does not change until the caller supplies it. `disabled` defaults to `false` and suppresses
  every activation route, not the current value.
- **TGB-003 - Slots.** `content` selects the labeled layout. Render optional `leadingIcon`, content, then optional
  `trailingIcon`. `selectedLeadingIcon` and `selectedTrailingIcon` replace the respective normal icon while selected;
  an absent replacement retains its normal icon. Without content, require one named leading icon and do not accept
  either trailing slot. Do not manufacture icon artwork. Reserve the stronger label weight in both states so toggling
  does not reflow adjacent controls; the reservation is private and inaccessible.
- **TGB-004 - Visuals.** Reuse the refreshed Button's Subtle layout and unselected visuals. The
  [token companion](spec/tokens.json) defines the **selection-specific** bindings, not a second Button geometry
  table. Selected uses a soft neutral fill, primary neutral foreground and semibold label. Disabled selected uses
  disabled fill and foreground. Resolve disabled before pressed, hovered and rest; selection remains independent.
  Use the effective foreground for both icons unless overridden by the caller. Apply component defaults before
  theme overrides and caller visuals last. Selection and icon changes are immediate, including under reduced motion.
  Qualify an identifiable selected boundary in high contrast separately from focus.
- **TGB-005 - Semantics and input.** Expose one button with a stable accessible name and explicit boolean checked
  state. Pointer, Enter/Space and the platform Toggle action each request one transition. Forward native events on
  their respective paths; do not synthesize a press from an assistive action. Disabled is announced and not
  focusable. Follow the [shared focus policy](../../../references/higher-order-components.md#focus-visual-policy)
  on the actual root without moving focus on selection.
- **TGB-006 - Migration.** Keep the existing [Button](../button/SPEC.md) usable until ToggleButton is implemented,
  exported, qualified and a migration is available. The [migration examples](spec/usage.md) distinguish Subtle from
  non-Subtle callers and remove the old manual double-toggle risk. There is no silent replacement for Primary,
  Secondary, Outline, or square toggles.

## Platform behavior

Target Windows Fabric, Office Win32, and macOS Fabric and Paper. Button's existing native evidence informs the
design; it does not qualify ToggleButton. The [accessibility companion](spec/accessibility.md) identifies separate
UIA and AX checks, including where the current macOS button role has no verified checked-state read. No mobile
behavior or endpoint qualification is claimed.

## Divergences from Flex

- `toggle-button-release-appearance`: the locked 1.5 catalog includes four appearances. The owner chose the
  promoted 1.7 Subtle-only model. `flex-component` identifies the package lock; `flex-promoted` identifies the five
  directly verified promoted files governing this proposal. The promotion records Enterprise X3 commit
  `34d42dee014daed6fe4cd4580bb9e7d526a4cf63`; independent verification there and package-wide repinning remain
  outstanding. Do not substitute the GitHub.com mirror HEAD.
- `toggle-button-native-state`: expose the native button/checked and Toggle-action contract rather than a browser
  pressed attribute. Actual assistive announcement and invocation are release gates.
- `native-system-focus-visuals`: retain native rings on Windows/macOS and root-modality-aware custom focus on Win32.
  Icon-only naming is required; requiring a visible Tooltip is deferred separately from naming.

## Conformance

The interface, slot model and native adaptation have had owner review. The contract remains a draft pending source
reconciliation. Only the types and selected token definition are scaffolded; stage signatures are not runnable
components. Do not register a story or add a package export until a real implementation exists.

| Requirement      | Planned implementation and evidence                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TGB-001, TGB-003 | Type checks for both layouts, forbidden legacy props, native ref; runtime slot order, fallback, wrap and width reservation.                             |
| TGB-002          | Controlled rejection, uncontrolled toggles, prop changes without notification, disabled suppression, and callback counts.                               |
| TGB-004          | Test the JSON overlay independently and with refreshed Button. Check theme overrides, caller precedence, high contrast and reduced motion.              |
| TGB-005          | Test press and semantic action separately; qualify checked state, accessible name, focus, and one transition per actual input on each desktop endpoint. |
| TGB-006          | Exercise the controlled and uncontrolled replacement in a consumer; audit non-Subtle and square callers before removing legacy props.                   |
