---
name: rating-display
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# RatingDisplay

## Scope

A noninteractive summary of a score, optionally including the number of ratings. It is neither a disabled slider
nor an invitation to submit a new score.

## Public contract

| Prop                    | Default                                              | Purpose                                                                                                                                            |
| ----------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value / max`           | required finite score / 5                            | A score within the named scale. The numeric text preserves the supplied precision; visual half-star rounding does not change the underlying score. |
| `layout / size`         | `default` / `medium`                                 | default shows the star sequence; compact uses a single star and a numeric value. Small, medium and large affect visuals, not the scale.            |
| `count / formatSummary` | absent / localized summary required when informative | Optional nonnegative count; distinguish no count from zero ratings. When equivalent surrounding text names the result, mark the visual decorative. |

### Slots and ownership

A View/ref contains private presentational star(s), optional formatted count and value text. There is one
semantic summary, or none if the parent already provides it. There are no edit callbacks.

Related contracts used by this design: [RatingItem](../rating-item/SPEC.md), [Text](../text/SPEC.md).

### Data and callbacks

`formatSummary(value, max, count?)` supplies the localized standalone summary. Set `decorative` when equivalent
text is already supplied by the parent. Omitted count renders no count slot; count zero is deliberate content.
Supply `formatNumber` to share an application locale with `formatSummary`. By default the visible result uses
device number formatting where available and plain numeric text otherwise. Negative zero is displayed and reported as zero.
Use a positive safe integer `max`, a finite in-range `value` and an optional nonnegative safe-integer `count`.
An invalid score or scale renders nothing; an invalid count is omitted. Scales above 100 use compact artwork
to bound the visual sequence without changing the displayed value. The component accepts
neither `onValueChange` nor a disabled/editable flag.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **RTD-001:** Require meaningful result data rather than shipping example values as default product content.
- **RTD-002:** Paint the correct full/half/empty representation in default mode; compact presentation and rounding never replace the human-readable numeric value.
- **RTD-003:** Update count and value from props without focus transfer, motion or an automatic score-change announcement.
- **RTD-004:** Expose one static summary and no set-value, increment or press action; hide redundant star and text nodes.

## Platform behavior

A host may expose an informative image or a text summary. Judge the result by one localized readable value and
the absence of adjustable semantics, not an identical native class name.

## Divergences from Flex

- `read-only-rating-summary` — **accepted.** Use a static information target rather than an inoperable copy of Rating; omit redundant semantics in an already named parent.

## Conformance

Compare compact and default summaries for a fractional average and count zero; inspect the native tree for
exactly one summary and no slider actions.

The [requirement evidence](spec/source.json) identifies the source, tests and story. Native accessibility traversal
is not yet qualified on Windows Fabric, Office Win32, macOS Fabric or macOS Paper.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
