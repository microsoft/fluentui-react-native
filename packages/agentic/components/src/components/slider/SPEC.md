---
name: slider
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Slider

## Scope

A bounded numeric selector with one thumb or an ordered lower/upper pair. A range is not one control announcing
a string containing two numbers: both endpoints must be independently writable.

## Public contract

| Proposed prop                                 | Default                                        | Purpose                                                                                                                                                 |
| --------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode / orientation / size`                   | `single` / `horizontal` / `medium`             | single or range, horizontal or vertical, and small, medium or large. Mode fixes the value shape for an instance.                                        |
| `min / max / step`                            | 0 / 100 / 1                                    | Finite ordered bounds and positive finite step. Quantize relative to min and clamp at the allowed endpoint.                                             |
| `value / defaultValue / onValueChange`        | uncontrolled, midpoint or middle half          | A number in single mode, ordered pair in range mode. Report value plus the active thumb; onValueCommit reports completion separately from live changes. |
| `accessibilityLabel / thumbLabels / disabled` | required name / required pair in range / false | Provide distinct lower and upper names. Optional value formatter, visible labels and marks do not add adjustable stops.                                 |

### Slots and ownership

Structural root/ref, rail, filled interval and one or two native adjustable targets. Optional endpoint/quantity
labels and marks are private presentation, not additional values. Overlap changes paint order, never thumb
identity or Tab order.

Related contracts used by this design: [Field](../field/SPEC.md).

### Data and callbacks

In `single` mode the value is a number; in `range` mode it is a readonly `[lower, upper]` pair.
`onValueChange(next, { thumb })` and `onValueCommit(next, { thumb })` use `single`, `lower` or `upper`, never an
index inferred from the currently higher painted thumb. An unchanged clamped request is not a second change.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SLD-001:** Maintain fixed thumb identities; the other endpoint constrains movement. Validate bounds/step and never produce a crossed interval or a nonfinite value.
- **SLD-002:** A rail press picks the nearest thumb; ties use the last adjusted thumb (lower initially). Drag previews changes, release commits, cancellation requests restoration of the previous committed value.
- **SLD-003:** Separate the visible thumb from its hit area, preserve focus visibility when thumbs coincide and orient min/max logically in horizontal RTL.
- **SLD-004:** Each thumb exposes its own range, current number, name and direct adjustment. Verify setting a specific nonadjacent number and reading it back, not merely observing a new value after a click.

## Platform behavior

Generic Windows Fabric numeric metadata can expose a range while its SetValue dispatch omits the requested
number. Use a qualified native provider or gate that mode. Confirm increment/decrement or value-setting on the
actual AppKit target, including the upper thumb.

## Divergences from Flex

- `range-provider-transport` — **deferred.** Do not advertise editable range support from accessible value reads alone.
- `native-thumb-identities` — **accepted.** Represent the two native targets explicitly; keep lower then upper order even when both occupy the same position.

## Conformance

Bring both thumbs together, select the rail at a tie, then adjust the upper target with UIA or AX. Inspect
ordering, callback identity, cancel behavior and RTL direction.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
