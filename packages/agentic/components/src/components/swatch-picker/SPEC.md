---
name: swatch-picker
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# SwatchPicker

## Scope

A single selection among discrete named samples. Wrapping from one row into a grid changes movement geometry,
not the semantic model or selected value.

## Public contract

| Proposed prop                          | Default                       | Purpose                                                                                                       |
| -------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `items`                                | required                      | Stable unique values, accessible names and color or image sources. Disabled entries remain in the data model. |
| `value / defaultValue / onValueChange` | uncontrolled, none            | Selected key. User selection requests one next value; controlled mode waits for the caller to update it.      |
| `layout / shape / size`                | `row` / `circular` / `medium` | row or grid, circular or square, small/medium/large. Use one content mode per picker.                         |
| `accessibilityLabel`                   | required group name           | Name the collection separately from its individual finishes or colors.                                        |

### Slots and ownership

Structural View ref contains a logical collection of Swatches. Group owns roving entry and one-of-many
selection; each child owns its native hit area and readable sample. No grid-cell role just because rows wrap.

Related contracts used by this design: [Swatch](../swatch/SPEC.md), [RadioGroup](../radio-group/SPEC.md).

### Data and callbacks

Items share the Swatch key/name/sample contract. `onValueChange(key)` reports one choice from the ordered data.
Horizontal arrows wrap in reading order; grid Up/Down use the measured column and the nearest enabled tile in
the next row, skipping wholly disabled rows. Row/grid reflow does not emit a selection change.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SWP-001:** Select at most one enabled value and request no change when reactivating it. Data reorder preserves selection by key, not index.
- **SWP-002:** Tab enters the selected enabled item or first eligible one. Directional movement follows row/grid geometry and logical direction; pointer release outside cancels.
- **SWP-003:** Propagate sample shape, size and content mode consistently; do not replace real fills with selection colors.
- **SWP-004:** Expose one named choice group with checked state, names and positions. Check focus and selection after reflow or removal of the focused sample.

## Platform behavior

Use native or confirmed ref-based radio-style navigation; do not create an extra focusable collection wrapper.
Windows and AppKit tab preferences can differ but each sample must remain reachable by assistive selection.

## Divergences from Flex

- `one-model-for-both-layouts` — **accepted.** Use a single-choice group for both row and grid instead of switching accessibility roles on a layout change.

## Conformance

Resize a grid while the last tile is selected, remove or disable the focused option, and check row/column
movement, one group entry, RTL and controlled rejection.

The [requirement evidence](spec/source.json) records implementation and authored coverage. Native action, reflow,
removal, and focus/selection convergence evidence remain separate per host.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
