---
name: spin-button
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# SpinButton

## Scope

A numeric editor with step actions. The editable text can be temporarily incomplete or invalid without changing
the committed number. Stepping is not string concatenation or a substitute for a valid numeric provider.

## Public contract

| Proposed prop                          | Default                                  | Purpose                                                                                                                |
| -------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value / defaultValue / onValueChange` | uncontrolled, initially 0 when permitted | Finite committed number. Use a valid in-range initial value; prop changes do not echo requests.                        |
| `min / max / step / largeStep`         | unbounded / unbounded / 1 / absent       | Finite bounds when provided, positive finite steps; no wrap at a boundary. Reject reversed bounds.                     |
| `parse / format`                       | required matching locale policy          | A paired text-to-number and number-to-text policy. Do not format away a trailing decimal or minus sign during editing. |
| `variant / size / disabled / readOnly` | `outline` / `medium` / false / false     | Input-style presentation. Read-only keeps text selectable but blocks adjustments; disabled also disables step targets. |

### Slots and ownership

Structural root/ref, one AppKit text editor and native increment/decrement affordances with localized
pointer help. The editor is the single sequential stop and owns native value-changing operations. Field can
render the associated error; the icon is never its only explanation.

Related contracts used by this design: [Input](../input/SPEC.md), [Field](../field/SPEC.md), [Tooltip](../tooltip/SPEC.md).

### Data and callbacks

`parse(text): number | null` and `format(value): string` form one locale policy. `onValueChange(next, { reason
})` distinguishes typed commit, increment, decrement and assistive set. Reaching an existing bound is a no-op.
Keep error text and the last committed numeric accessible value separate until correction.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SPBNU-001:** Enter or completed editing parses once. Leave malformed or out-of-range text visible with an error; do not change the committed number. Escape restores the last committed representation.
- **SPBNU-002:** Arrows and pointer steppers use regular step. Page keys use largeStep only when configured. Clamp steps at bounds, suppress unchanged requests and preserve editor focus.
- **SPBNU-003:** Resolve the editor chrome through Input and keep step affordance states independent. A disabled bound direction cannot look or act available.
- **SPBNU-004:** Expose name, committed value, bounds and actual adjustable actions. Verify UIA value setting/read-back and macOS AX adjustment independently from keyboard input.

## Platform behavior

The AppKit preview uses the native SpinEditor and tokenized Input-like chrome. Windows and Win32 are not
admitted: the generic RN Windows 0.81.38 provider does not deliver the requested SetValue number.

## Divergences from Flex

- `numeric-draft-buffer` — **accepted.** Keep a native text buffer and a separate number, rather than delegating locale parsing or invalid-text recovery to browser behavior.
- `spin-provider-value` — **deferred.** Read/write assistive provider transport and independent read-only state require endpoint evidence.

## Conformance

Try a localized decimal, an incomplete sign, invalid text and a step at the maximum. Then invoke a native set to
a nonadjacent value and verify both callback and resulting value.

The [source evidence](spec/source.json) separates the AppKit preview from outstanding endpoint qualification.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
