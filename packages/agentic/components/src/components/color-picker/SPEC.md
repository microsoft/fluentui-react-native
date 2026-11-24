---
name: color-picker
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ColorPicker

## Scope

An editor for an arbitrary color. The area, channel rails, preview and typed fields describe one committed
color, while each active text editor may temporarily contain invalid or incomplete input.

## Public contract

| Proposed prop                                   | Default                            | Purpose                                                                                                                                                           |
| ----------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value / defaultValue / onColorChange`          | uncontrolled unless value supplied | An explicit RGBA value: RGB bytes and alpha fraction [0,1]. Invalid controlled values are diagnostics, not instructions to discard opacity. Default opaque black. |
| `orientation / shape`                           | `horizontal` / `rectangular`       | horizontal or vertical arrangement; rectangular or rounded area. Reflow to fit available container width without changing value.                                  |
| `alphaEnabled / fieldsVisible / previewVisible` | true / true / true                 | Expose hue plus area and optional opacity and exact fields. A color-entry workflow must retain an accessible exact-entry route if it hides the built-in fields.   |
| `savedColors / onSaveColor`                     | absent / absent                    | Optional caller-owned palette of at most eight slots. Adding a color requests storage; the picker does not persist palette data between sessions.                 |

### Slots and ownership

Structural View ref contains ColorArea, hue rail, optional alpha rail, labeled Hex and channel fields, optional
preview and saved-color actions. Reuse Field/Input and numeric editor behavior. The preview is not another
adjustment target.

Related contracts used by this design: [ColorArea](../color-area/SPEC.md), [ColorSlider](../color-slider/SPEC.md), [SpinButton](../spin-button/SPEC.md), [Field](../field/SPEC.md), [Input](../input/SPEC.md), [SwatchPicker](../swatch-picker/SPEC.md), [Button](../button/SPEC.md).

### Data and callbacks

The model is `{ red: number; green: number; blue: number; alpha: number }`. `onColorChange(next, { source })`
identifies area, hue, opacity, typed entry or saved slot. Typed RGB uses bytes, typed opacity uses percent, and
their conversion must round-trip to the alpha fraction. On a successful hex commit display canonical `#rrggbb`;
changing it leaves opacity untouched. Selecting an occupied saved slot loads its stored RGBA; an empty slot
never fabricates a color.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **CPK-001:** Commit changes atomically across all views. Preserve an editor's invalid draft and the last usable color; Escape reverts the draft. Prop synchronization must not echo a user change.
- **CPK-002:** Accept an exact six-digit RGB hex value on commit without altering alpha. RGB bytes and opacity have independent bounds. Do not reformat partially composed input on every key.
- **CPK-003:** Show actual sample colors, including alpha over a distinguishable backing. Keep controls and focus indicators visible in contrast modes without recoloring the specimen.
- **CPK-004:** Keep saturation, brightness, hue and optional opacity independently adjustable and named; expose precise text entry. Qualify actual set/read operations and the approved two-control area fallback.

## Platform behavior

Use each child's validated native behavior; an accessible editor does not qualify a broken range provider. Gate
unsupported range compositions on each endpoint rather than masking them with a single focusable color preview.

## Divergences from Flex

- `color-editor-single-owner` — **accepted.** Compose native channels and exact edit buffers around one color instead of treating independent browser inputs as sources of truth.
- `color-picker-child-gates` — **deferred.** A parent is not qualified until its exposed area/rail actions and fallback paths work; mark absent optional parts explicitly.

## Conformance

Edit hex while alpha is 35%, cancel an invalid channel draft, then adjust saturation alone through native
accessibility and save a slot. Check round-trip value, focus and one owner notification.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
