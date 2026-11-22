---
name: color-slider
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ColorSlider

## Scope

An adjustable rail for one color channel. Hue is a position on a color spectrum; alpha is opacity for a supplied
color. Neither is a generic theme-colored progress indicator.

## Public contract

| Proposed prop                          | Default                                     | Purpose                                                                                                                  |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `channel / orientation`                | `hue` / `horizontal`                        | hue or alpha; horizontal or vertical. Hue uses degrees from 0 to 360; alpha uses percent from 0 to 100.                  |
| `value / defaultValue / onValueChange` | uncontrolled, 0 hue or 100 alpha            | One finite channel value. Clamp adjustments and report the channel value, not a derived opaque color.                    |
| `sampleColor / accessibilityLabel`     | required for alpha / localized channel name | Alpha needs the actual sample to show transparency. Supply a name and unit-aware value text independent of the gradient. |

### Slots and ownership

View ref, clipped gradient rail and protruding thumb in an unclipped wrapper. One adjustable target covers the
rail; the thumb never becomes another Tab stop. Distinguish a transparent sample from a white one.

### Data and callbacks

A hue rail reports degrees and an alpha rail reports percent; neither silently converts the public value to a
fraction. `onValueChange(next)` tracks adjustment; `onValueCommit(next)` settles it. Round only to the
documented input step, not to the nearest color name.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **CSL-001:** Choose bounds and unit by channel; changing alpha leaves hue and RGB with the caller. Report live changes and completed drag distinctly.
- **CSL-002:** Handle arrows along the run direction, coarse stepping and endpoints; ignore perpendicular arrows. A rail click or drag follows the same direction/value map.
- **CSL-003:** Keep the thumb visible at both ends and show transparency against a contrasting base; do not replace the chosen color with a high-contrast system accent.
- **CSL-004:** Expose one named writable range in native units. Confirm changes from accessibility reach the callback with the requested number and persist in read-back.

## Platform behavior

A generic Fabric range action with no numeric payload cannot implement arbitrary hue or alpha assignment.
Preserve host-specific adjustment conventions and withhold unqualified modes; a functioning keyboard rail is
insufficient.

## Divergences from Flex

- `channel-provider-gate` — **deferred.** Verify exact native adjustment separately for degrees and percent, including distinct endpoint positions with the same red hue.

## Conformance

Set 0, an interior value and maximum through UIA/AX; verify the callback argument, accessible units,
orientation, and unclipped thumb at the extremes.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
