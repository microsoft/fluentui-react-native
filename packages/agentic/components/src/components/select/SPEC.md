---
name: select
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Select

## Scope

A compact single-choice field whose picker, option traversal and dismissal belong to the operating system. It is
not an alias for Dropdown; consumers needing programmable popups use Dropdown.

## Public contract

| Proposed prop                          | Default                              | Purpose                                                                                                                               |
| -------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                              | required                             | An ordered list of unique string values and localized labels with optional disabled entries. No arbitrary option renderer.            |
| `value / defaultValue / onValueChange` | uncontrolled, no selection           | A selected key or null; an accepted user choice requests its key once. Unmatched keys do not silently select the first enabled entry. |
| `placeholder / accessibilityLabel`     | absent / field name required         | Placeholder is display-only when empty. Bind Field's name, required state and error explanation to the native picker.                 |
| `variant / size / disabled / error`    | `outline` / `medium` / false / false | Request outline or underline and small, medium or large metrics where the host allows. Preserve native affordances over exact chrome. |

### Slots and ownership

Ref addresses the stable structural root; a single native picker owns keyboard focus, visible value, disclosure
glyph and the option surface. No public open flag, popup ref, item slots or multiselect mode.

Related contracts used by this design: [Field](../field/SPEC.md), [Input](../input/SPEC.md), [Dropdown](../dropdown/SPEC.md).

### Data and callbacks

Each option is `{ value: string; label: string; disabled?: boolean }`. Use `onValueChange(value: string)` on
native commit; clearing externally to `null` is distinct from picking an option with an empty-looking label. A
placeholder is not a hidden, user-selectable fake option.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SEL-001:** Only offer a host-backed single-value selector. Absence of a qualified host is a capability gap, not permission to instantiate Dropdown.
- **SEL-002:** Commit only an enabled, valid option from native selection. Cancellation and controlled prop synchronization send no selection change.
- **SEL-003:** Leave opening, type-ahead, dismissal and focus return with the native picker. Do not register duplicate arrow/Enter handlers.
- **SEL-004:** Read the selected value and role; open, select and cancel through native accessibility as well as the keyboard on the actual endpoint.

## Platform behavior

A Windows combo control and an AppKit pop-up button need not expose identical roles or key chords. No cross-host
picker is qualified by this draft. Gate each unsupported endpoint; a dependency installed elsewhere is not
evidence of integration.

## Divergences from Flex

- `host-picker-only` — **accepted.** Preserve platform choice behavior; neither an app-rendered menu nor a hidden Dropdown is an equivalent native picker.
- `selector-hosts` — **deferred.** Qualify a genuine provider and its form state/description support on each desktop host.

## Conformance

Open and cancel, then commit an enabled option and attempt a disabled one. Compare keyboard and assistive
invocation without dispatching synthetic open actions.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
