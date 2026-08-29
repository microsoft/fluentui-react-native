---
name: tag
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Tag

## Scope

Tag is a compact labeling element that represents a keyword, a category, or an
applied filter, and offers a single dismiss action. It renders one `Pressable`
containing an optional leading icon, a text label, and a trailing dismiss glyph.

The whole tag is one target: there is no separate dismiss sub-control and no
region of the tag that does something different. Tag has no selected or checked
state, is not a toggle, is not a button for arbitrary actions, and is not a
menu trigger. It does not remove itself, does not animate in or out, and owns no
list or group behavior.

## Public contract

### Props and defaults

| Prop         | Type                        | Default       | Contract                                                                                  |
| ------------ | --------------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `appearance` | `primary \| secondary`      | `secondary`   | Selects the background and foreground color family.                                       |
| `layout`     | `iconAndText \| iconOnly`   | `iconAndText` | `iconOnly` suppresses the label and forces the circular radius.                           |
| `size`       | `small \| medium`           | `medium`      | Selects padding, text style, and both icon sizes.                                         |
| `shape`      | `rounded \| circular`       | `rounded`     | Selects the corner radius in the icon-and-text layout. Ignored in the icon-only layout.   |
| `dismiss`    | `boolean`                   | `true`        | Controls whether the trailing dismiss glyph is drawn. It does not add or remove behavior. |
| `disabled`   | `boolean`                   | `false`       | Blocks presses, removes the tag from the tab order, and selects the disabled colors.      |
| `onPress`    | `PressableProps['onPress']` | none          | The only signal a tag emits, and the hook a caller uses to remove it.                     |
| `style`      | `StyleProp<ViewStyle>`      | none          | Applied after the resolved root styles.                                                   |

**TAG-001:** Resolve `appearance`, `layout`, `size`, `shape`, `dismiss`, and
`disabled` to the documented defaults and expose the remaining owned pressable
props on the root.

### Slots and anatomy

| Slot          | Type        | Rendered                    | Contract                                                                                             |
| ------------- | ----------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `root`        | `Pressable` | always                      | The single hit area and the only accessible element.                                                 |
| `leadingIcon` | `Icon`      | only when supplied          | Categorical glyph before the label.                                                                  |
| `content`     | `Text`      | by default in `iconAndText` | Defaults to the text `Tag text`; pass `null` to suppress it; never rendered in the icon-only layout. |
| `dismissIcon` | `Icon`      | by default                  | Defaults to the shared dismiss glyph; suppressed when `dismiss` is `false` or the slot is `null`.    |

Render order inside the root is: focus visual, leading icon, content, dismiss
icon.

**TAG-002:** Render the label by default with the placeholder text, drop it in
the icon-only layout, render the leading icon only when one is supplied, and
render the default dismiss glyph unless `dismiss` is `false` or the slot is
suppressed.

**TAG-003:** Render the focus visual, the leading icon, the content, and the
dismiss icon in that order.

### State ownership

Tag owns nothing beyond hover, press, and focus, which come from the shared
pressable state. It has no selection, no internal dismissed state, and no
lifecycle: a dismissed tag disappears only because the caller stops rendering
it in response to `onPress`.

**TAG-004:** Present exactly one interactive element. The icons are decorative
and non-accessible, the dismiss glyph is not separately pressable, and the
component never removes itself.

**TAG-005:** Resolve the background from appearance together with disabled,
pressed, and hovered state, and resolve the foreground from appearance and
disabled only, so the label and icon color do not shift on hover or press.

**TAG-006:** Resolve the corner radius, padding, and gap from size, layout, and
shape together, and use the circular radius for every icon-only tag regardless
of `shape`.

**TAG-007:** Size the leading and dismiss icons from `size`, keeping the dismiss
glyph one step smaller than the leading glyph, and paint both with the resolved
foreground.

**TAG-008:** Expose the root as a button with the disabled state merged over
caller-supplied state, keep a disabled tag out of the tab order, and require an
accessible name for icon-only tags.

**TAG-009:** Show the two-ring focus visual while the root is focused and not
disabled, following the resolved corner radius.

## Platform behavior

Windows and macOS behave identically. The root is focusable while enabled and
leaves the tab order while disabled. Enter and Space activate the focused tag
through the shared pressable behavior and produce the same `onPress` a pointer
press produces.

On Windows the root maps to a UI Automation button that exposes its disabled
state; Narrator reads the name and the control type, and the decorative icons
contribute nothing. On macOS it maps to the equivalent button element for
VoiceOver. Because the tag is a single element on both platforms, there is no
way to reach the dismiss glyph on its own.

Hover and press change the background only. The foreground is deliberately held
constant across those states so the label does not flicker while the pointer
moves across a row of tags.

## Divergences from Flex

| ID                            | Disposition | React Native contract                                                                                                                                                                                                                                                                        | Follow-up                                                                                                                                          |
| ----------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag-small-circular-padding`  | Deferred    | A small icon-and-text tag with the circular shape uses the icon-only padding step on both axes and no gap, instead of the wider horizontal padding and the standard gap that the same size uses with the rounded shape. Flex makes small icon-and-text padding and gap independent of shape. | The style table needs the small circular branch corrected to the small rounded values. That is a runtime change and is out of scope for this spec. |
| `tag-dismiss-is-caller-owned` | Accepted    | `dismiss` only draws the glyph. Activating a tag reports `onPress`; the caller removes the tag from its own data. Flex describes activation as dismissing the tag.                                                                                                                           | None. Removing itself is not something a controlled React Native component can do.                                                                 |
| `tag-appearance-prop-name`    | Accepted    | The color family axis is named `appearance` with the values `primary` and `secondary`, matching the other components in this package. Flex names the axis differently while using the same two values.                                                                                       | None.                                                                                                                                              |
| `tag-no-state-transition`     | Accepted    | Hover, press, and disabled color changes are applied immediately with no transition. Flex calls for a short eased color transition.                                                                                                                                                          | Needs motion tokens and an animated color layer on the root before it can be adopted.                                                              |

## Conformance

| Requirement | Evidence                                                         |
| ----------- | ---------------------------------------------------------------- |
| TAG-001     | `tag.types.ts`, `useTag.ts`, `tag.types.test.ts`, `tag.test.tsx` |
| TAG-002     | `useTag.ts`, `tag.test.tsx`                                      |
| TAG-003     | `renderTag.tsx`, `tag.test.tsx`                                  |
| TAG-004     | `useTag.ts`, `useTagStyles.ts`, `renderTag.tsx`, `tag.test.tsx`  |
| TAG-005     | `tag.styles.ts`, `useTagStyles.ts`, `tag.test.tsx`               |
| TAG-006     | `tag.styles.ts`, `tag.stories.tsx`                               |
| TAG-007     | `tag.styles.ts`, `useTagStyles.ts`, `tag.test.tsx`               |
| TAG-008     | `useTag.ts`, `tag.test.tsx`                                      |
| TAG-009     | `useTagStyles.ts`, `tag.test.tsx`                                |
