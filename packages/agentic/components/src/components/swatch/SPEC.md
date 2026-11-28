---
name: swatch
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Swatch

## Scope

A named sample within a single-choice collection. Its fill is the actual color or image offered for selection,
not a theme accent substituted for that value.

## Public contract

| Proposed prop                | Default               | Purpose                                                                                                                                |
| ---------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `value / accessibilityLabel` | required              | Stable option key and localized value name, independent of the color notation or image URI.                                            |
| `sample`                     | required              | A discriminated color or image source. Gradients and textures may be supplied as images; failure to load never changes the option key. |
| `shape / size`               | `circular` / `medium` | circular or square; small, medium or large.                                                                                            |
| `selected / disabled`        | false / false         | Selection comes from the parent; activation requests the value once and never changes it privately.                                    |

### Slots and ownership

One Pressable root/ref has separate fill, boundary, selected indicator and optional disabled mark. The parent
assigns radio semantics and focus eligibility. None of the artwork participates in hit testing.

### Data and callbacks

A color sample is `{ kind: 'color'; color: ColorValue }`; an image sample is `{ kind: 'image'; source:
ImageSourcePropType }`. Both use the same parent key/label model. The collection receives the stable option key,
not a pixel, URI or color object used as identity.
`onSelect(value)` requests the owner change; `focusable` lets that owner decide Tab eligibility without disabling
the choice. Full collection navigation remains with the separately specified SwatchPicker.
Hover and press resolve the boundary's active stroke colors, never the product sample's fill.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SWT-001:** Require a stable value, one sample and a meaningful name even for transparent or visually identical samples.
- **SWT-002:** Project parent selection faithfully. A disabled swatch cannot request a selection or be chosen by pointer fallback.
- **SWT-003:** Keep the actual sample visible in contrast themes; vary boundary and selection mark without recoloring the product value.
- **SWT-004:** Report one named choice, checked state and disabled state through the group's native model. Do not expose a separate checkbox.

## Platform behavior

Check the indicator over white, black, transparent and photographic fills. If a particular image isn't
distinguishable at normal scale its text name remains available, not a generated color description.

## Divergences from Flex

- `group-bound-sample` — **accepted.** Selection and focus entry belong to the native group; the individual swatch has no uncontrolled mode.

## Conformance

Request an already-selected value and a disabled value, and inspect the selection indication on a transparent
sample in high contrast.

The [requirement evidence](spec/source.json) tracks runtime and native story coverage separately from collection navigation.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
