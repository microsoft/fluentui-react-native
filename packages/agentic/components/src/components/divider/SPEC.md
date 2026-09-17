---
name: divider
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Divider

## Scope

Divider is a non-interactive separator. It draws a line segment, optional
content in the middle of that line, and a second line segment, along either the
horizontal or the vertical axis. Content is an optional icon followed by an
optional label.

Divider is never focusable and never activates. It owns no collapsing,
expanding, resizing, or drag behavior, and it is not a section heading. It
stretches along its parent's primary axis and does not define its own extent.

## Public contract

### Props and defaults

| Prop       | Type                     | Default                 | Contract                                                                    |
| ---------- | ------------------------ | ----------------------- | --------------------------------------------------------------------------- |
| `layout`   | `center \| start \| end` | `center`                | Positions the content between the two line segments.                        |
| `vertical` | `boolean`                | `false`                 | Selects the axis the line and content lay out along.                        |
| `label`    | slot for `Text`          | renders the text `Text` | The label content. `null` removes the label.                                |
| `icon`     | slot for `Icon`          | absent                  | A leading icon inside the content container. `null` or omission removes it. |

The root accepts the owned `ViewProps` surface except `role`, the legacy
`accessibilityRole`, and `focusable`, which the component owns. A caller `style` is applied after the
token-derived root styles.

`label` and `icon` are slots: they accept shorthand children, a props object,
or an `as` replacement component. The label renders by default, so omitting it
produces the default text rather than a bare line.

### Slots and anatomy

The render order is the leading line, the content container when it is present,
and the trailing line. Inside the content container the icon renders before the
label.

| Slot              | Rendered when                | Contract                                                                             |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `root`            | always                       | A `View` that carries separator semantics, axis direction, and cross-axis centering. |
| Leading line      | always                       | A flexible line segment. It becomes a fixed stub for `layout="start"`.               |
| Content container | `label` or `icon` is present | A non-accessible row holding the icon and label with internal gap and padding.       |
| `icon`            | supplied and not `null`      | Sized and colored by the component and hidden from the accessibility tree.           |
| `label`           | not `null`                   | Wraps and centers rather than truncating.                                            |
| Trailing line     | always                       | A flexible line segment. It becomes a fixed stub for `layout="end"`.                 |

Setting both `label` and `icon` to `null` collapses the content container so
the two line segments meet, producing a plain rule.

### Requirements

- **DIV-001:** Resolve the documented defaults, render the label by default,
  and keep the supported native root props while owning role and focusability.
- **DIV-002:** Render the documented order, collapse the content container only
  when both `label` and `icon` are absent, and honor an `as` replacement for
  either content slot.
- **DIV-003:** Give the leading line a fixed stub for `layout="start"` and the
  trailing line a fixed stub for `layout="end"`, and let both grow otherwise.
- **DIV-004:** Switch the root direction, the line's measured axis, and the
  content padding axis from `vertical`, keeping the content horizontally
  written in both orientations.
- **DIV-005:** Expose separator semantics that are not focusable, name the
  separator from the label text when no caller name is supplied, and hide the
  icon and label from the accessibility tree.
- **DIV-006:** Resolve line, content, and label values from theme tokens and
  apply the caller `style` last.

## Platform behavior

Windows and macOS render the same structure. The root sets `focusable={false}`
and the component attaches no press, hover, or focus handlers, so Divider never
appears in the tab order or takes focus on either platform.

There is no focus visual, no interaction state, and no animation, so hover,
press, and reduced-motion settings have no effect on the rendered output.

Both platforms measure the line along one axis only: a horizontal Divider fixes
the line height and lets width grow, and a vertical Divider fixes the line
width and lets height grow. In the vertical orientation the icon and label
still lay out horizontally; no rotation or vertical text mode is applied.

## Divergences from Flex

| ID                                 | Disposition    | React Native contract                                                                                                                                                                                   | Follow-up                                                                                               |
| ---------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `divider-orientation-semantics`    | Not applicable | React Native's separator role carries no orientation value, so a vertical Divider is announced the same way as a horizontal one. Flex requires an explicit orientation declaration.                     | None available at the platform level. Convey column grouping through the surrounding structure instead. |
| `divider-content-visibility-model` | Accepted       | There is no single content-visibility switch. The content container collapses only when both `label` and `icon` resolve to absent, and `label` must be explicitly `null` because it renders by default. | None. The slot-level control matches the rest of the React Native component surface.                    |
| `divider-size-axis`                | Deferred       | The React Native contract has no size axis. Flex's mobile surface exposes a size axis that varies the vertical space around the line.                                                                   | Requires a reviewed public API addition and a spacing token mapping.                                    |
| `divider-line-thickness`           | Resolved       | The line is a filled rectangle whose measured axis is bound to `strokeWidth.thin`, matching the Flex thin-stroke contract.                                                                              | Implemented in `useDividerStyles.ts` and covered by orientation tests.                                  |

## Conformance

| Requirement | Evidence                                                                         |
| ----------- | -------------------------------------------------------------------------------- |
| DIV-001     | `divider.types.ts`, `useDivider.ts`, `divider.types.test.ts`, `divider.test.tsx` |
| DIV-002     | `renderDivider.tsx`, `useDivider.ts`, `divider.test.tsx`, `divider.stories.tsx`  |
| DIV-003     | `divider.styles.ts`, `useDividerStyles.ts`, `divider.test.tsx`                   |
| DIV-004     | `divider.styles.ts`, `divider.test.tsx`, `divider.stories.tsx`                   |
| DIV-005     | `useDivider.ts`, `useDividerStyles.ts`, `divider.test.tsx`                       |
| DIV-006     | `divider.styles.ts`, `useDividerStyles.ts`, `divider.test.tsx`                   |
