---
name: rating
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Rating

## Scope

A single adjustable subjective score. An unset rating and an explicit score of zero can have the same artwork
but must not share a reported value or meaning.

## Public contract

| Proposed prop                                 | Default                                                   | Purpose                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `max / step / size`                           | 5 / 0.5 / `medium`                                        | 1–100 whole stars, step 0.5 or 1, and small, medium or large. The numeric scale is not a count of radio positions. |
| `value / defaultValue / onValueChange`        | uncontrolled, unset                                       | A bounded numeric score or null for no rating. Supplying null is controlled; omission is not.                      |
| `accessibilityLabel / formatValue / disabled` | required name / localized score or no-rating text / false | The group owns the value, name and adjustments. When required, validation is owned by the form.                    |

### Slots and ownership

One adjustable root/ref with RatingItem visuals. Hover preview belongs to the parent and is separate from the
committed score. One focus ring surrounds the control, not the most recently hovered star.

Related contracts used by this design: [RatingItem](../rating-item/SPEC.md), [Slider](../slider/SPEC.md), [Field](../field/SPEC.md).

### Data and callbacks

Use `value: number | null` with `onValueChange(next)`; `undefined` is the absence of a controlled value. A valid
half-step score such as 3.5 means 3.5 out of the declared maximum, never position 7 in a list of 10. The
callback receives no hover-only score.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **RTG-001:** Track unset separately from zero. Clamp committed scores to the bounds and resolve to the configured step without changing a controlled prop.
- **RTG-002:** Hover previews until leave; pointer release commits. Arrows adjust, Home/End choose numeric bounds and Delete/Backspace or the clear key returns to unset.
- **RTG-003:** A prospective half star follows logical start even in RTL. Hovering cannot change the accessible committed score or produce an onValueChange.
- **RTG-004:** Expose one writable native range with localized fractional and unset descriptions. Verify actual adjustment, not a list of doubled half-step radio positions.

## Platform behavior

The AppKit preview exposes one RangeTarget with no numeric value when unset; supply a locale-aware `formatValue`
for both null and numeric scores. The renderer never receives the hover preview as its accessibility value.
The isolated Windows Fabric preview uses the native-core RangeValue peer: it retains exact half scores and
distinguishes an unset score from zero. The public component entry point and default Windows story catalog
remain gated pending physical-input and visual qualification. Office Win32 has no matching provider.

## Divergences from Flex

- `single-adjustable-rating` — **accepted.** The entire score is one control; individual stars remain presentational rather than radio options.
- `rating-adjustment-proof` — **deferred.** Verify writable fractional values and a distinguishable unset state with native assistive technologies.

## Conformance

Start unset, choose zero, preview 3.5, commit it, clear, then set a fraction through assistive adjustment.
Observe names, values and exactly one callback per change.

The [source evidence](spec/source.json) separates the AppKit preview from outstanding endpoint qualification.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
