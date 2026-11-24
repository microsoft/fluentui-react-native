---
name: color-area
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ColorArea

## Scope

A two-dimensional color-selection surface: horizontal position edits saturation, vertical position edits
brightness at a caller-supplied hue. One visual thumb represents two independently meaningful numbers.

## Public contract

| Proposed prop                   | Default                                     | Purpose                                                                                                                                                             |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hue / value / defaultValue`    | hue required / uncontrolled coordinate pair | Use degrees for hue and a pair of saturation and brightness percentages in [0,100]. Initialize at zeroes if no pair is provided. Keep opacity outside this surface. |
| `onValueChange / onValueCommit` | absent                                      | Report a coherent coordinate pair; do not publish intermediate half-updated pairs during one gesture.                                                               |
| `shape / accessibilityLabel`    | `rectangular` / named color position        | rectangular or rounded. Provide localized coordinate labels and value formatting; never rely on color names to disambiguate the axes.                               |

### Slots and ownership

A sized View ref hosts the runtime field, contrast boundary and one overlaid thumb. Physical keyboard entry may
use one target for both axes; accessibility must offer two independently adjustable values. Exact entry can be
composed using Field.

Related contracts used by this design: [Field](../field/SPEC.md).

### Data and callbacks

`value` is `{ saturation: number; brightness: number }` at a given hue. `onValueChange(next, { channel })`
identifies a single-coordinate adjustment or a two-dimensional pointer change; report the whole pair. The
exact-entry owner supplies localized numeric labels, not a freeform accessibility description for a read-only
image.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **CAR-001:** Horizontal movement changes saturation, vertical movement brightness. Clamp pointer coordinates at the surface and apply the same bounds to keys and native adjustment.
- **CAR-002:** Set either coordinate without modifying the other or the caller's hue. Update the thumb, readout and both accessible values from the same pair.
- **CAR-003:** Preserve the real gradient and sample under high contrast; verify boundary contrast and a visible thumb near both white and black. System focus treatment is separate.
- **CAR-004:** Prefer one keyboard stop controlling both axes and two named settable accessible channels. If that is not expressible, expose two ordinary named adjustable controls as an explicit fallback.

## Platform behavior

A single RangeValue object cannot encode two independently settable values. Validate exact per-channel UIA/AX
adjustment and read-back before admitting either presentation. Exact text entry is an additional path, not proof
of accessible dragging.

## Divergences from Flex

- `two-channel-native-fallback` — **accepted.** Permit two operable native adjustments instead of copying the web's focus structure or exposing only a combined spoken string.
- `native-color-surface-contrast` — **deferred.** Verify runtime gradients, thumb edge visibility and the boundary on actual neutral/high-contrast surfaces.

## Conformance

Adjust each coordinate through native accessibility while keeping the other fixed, then compare the visual
position and typed value at all four corners, including high contrast.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
