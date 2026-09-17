---
name: interaction-tag
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# InteractionTag

## Scope

InteractionTag is a compact labeling element that represents a person, a
category, or a keyword, and offers two separate actions on it: a primary action
that inspects or opens the thing the tag names, and a secondary action that
removes the tag.

It renders a non-interactive container holding two sibling `Pressable` regions
separated by a hairline divider. The leading region carries optional leading
media and the label; the trailing region carries the dismiss glyph. Each region
is its own hit target, its own tab stop, and its own hover, press, and focus
state.

This is the difference from [Tag](../tag/SPEC.md). A tag is one target whose
only action is removal, so the dismiss glyph there is decorative. An interaction
tag has two targets, so the dismiss glyph is a real control with its own name.

InteractionTag has no selected or checked state, is not a toggle, and owns no
list or group behavior. It never removes itself: dismissal is the caller
dropping it from its own data.

## Public contract

### Props and defaults

| Prop         | Type                      | Default       | Contract                                                                                          |
| ------------ | ------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `appearance` | `primary \| secondary`    | `secondary`   | Selects the background, foreground, and divider color family for both regions.                    |
| `layout`     | `iconAndText \| iconOnly` | `iconAndText` | `iconOnly` suppresses the label and forces the circular radius.                                   |
| `size`       | `small \| medium`         | `medium`      | Selects action padding, text style, and the leading, avatar, and dismiss glyph sizes.             |
| `shape`      | `rounded \| circular`     | `rounded`     | Selects the container corner radius in the icon-and-text layout. Ignored in the icon-only layout. |
| `disabled`   | `boolean`                 | `false`       | Blocks both regions, removes both from the tab order, and selects the disabled colors.            |
| `style`      | `StyleProp<ViewStyle>`    | none          | Applied to the container after the resolved container styles.                                     |

The container root is a `View`, so the remaining public props are the owned
`View` props, including `ref` and `testID`. The container has no press handling
of its own.

**ITAG-001:** Resolve `appearance`, `layout`, `size`, `shape`, and `disabled` to
the documented defaults and expose the remaining owned `View` props on the
container root.

### Slots and anatomy

| Slot            | Type        | Rendered                    | Contract                                                                                             |
| --------------- | ----------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `root`          | `View`      | always                      | The layout container. Not interactive and not an accessibility element.                              |
| `primaryAction` | `Pressable` | always                      | The leading hit target. Carries `onPress`, its own `ref`, and its own accessible name.               |
| `avatar`        | `Avatar`    | only when supplied          | Leading media for a person or entity. Mutually exclusive with `leadingIcon`.                         |
| `leadingIcon`   | `Icon`      | only when supplied          | Leading glyph for a category. Mutually exclusive with `avatar`.                                      |
| `content`       | `Text`      | by default in `iconAndText` | Defaults to the text `Tag text`; pass `null` to suppress it; never rendered in the icon-only layout. |
| `dismiss`       | `Pressable` | always                      | The trailing hit target. Carries `onPress`, its own `ref`, and its required accessible name.         |
| `dismissIcon`   | `Icon`      | by default                  | Defaults to the shared dismiss glyph; pass `null` to replace it with other dismiss content.          |

`primaryAction` and `dismiss` accept props objects only, not shorthand children,
because the component owns the children of both regions. The divider between
them is structural and is not public API.

**ITAG-002:** Present two independently focusable button regions inside one
non-interactive container. Each region owns its own press, hover, and focus
state and forwards its own handlers, so neither region reacts to the other.

**ITAG-003:** Render the primary action, then the divider, then the dismiss
action. Inside the primary action render the focus visual, the leading media,
and the content in that order; inside the dismiss action render the focus visual
and the dismiss glyph in that order.

**ITAG-004:** Accept a leading icon or an avatar, never both. The public props
reject the pair at compile time; when both arrive at runtime the avatar is
rendered, the icon is dropped, and development builds warn.

**ITAG-005:** Render the label by default with the placeholder text, drop it in
the icon-only layout, and render leading media only when it is supplied.

### State ownership

InteractionTag owns hover, press, and focus separately for each region. It has
no selection, no internal dismissed state, and no lifecycle. A single `disabled`
prop governs both regions together, because the two actions belong to one tag.

**ITAG-006:** Resolve each region's background from `appearance` together with
that region's own disabled, pressed, and hovered state, so hovering or pressing
one region never changes the other.

**ITAG-007:** Resolve the foreground from `appearance` and `disabled` only, and
share it between both regions, so the label and both glyphs hold their color
across rest, hover, and pressed.

**ITAG-008:** Resolve the container corner radius from `size`, `layout`, and
`shape` together, give each action that radius on its outer edge only, keep both
actions square against the divider, and use the circular radius for every
icon-only tag regardless of `shape`.

**ITAG-009:** Draw the divider as a full-bleed hairline between the two regions
whose color follows `appearance` and `disabled`, and keep it out of the
accessibility tree and out of hit testing.

**ITAG-010:** Size the leading glyph, the avatar, and the dismiss glyph from
`size`, keeping the dismiss glyph one step smaller than the leading glyph, and
keep each action at or above the twenty-four pixel minimum target box.

**ITAG-011:** Expose each region as a button with the disabled state merged over
caller-supplied state, keep both regions out of the tab order while disabled,
require an accessible name on the dismiss action, and require one on the primary
action in the icon-only layout.

**ITAG-012:** Show a two-ring focus visual inside a region while that region is
focused and not disabled, following that region's resolved outer corner radii.

**ITAG-013:** Forward the top-level `ref` to the container and each action
slot's own `ref` to that region's `Pressable`.

## Platform behavior

Windows and macOS behave identically. Tab moves through the primary action and
then the dismiss action, so one enabled interaction tag is two tab stops. Both
regions leave the tab order while disabled. Enter and Space activate the focused
region through the shared pressable behavior and produce the same `onPress` a
pointer press produces.

The two regions are siblings inside a plain container `View`, not nested
pressables. Nothing bubbles between them, so pressing the dismiss action never
also runs the primary action, and there is no press-responder competition to
resolve. The divider and both focus visuals are excluded from hit testing, so
the only two touchable surfaces on Windows Fabric are the two action regions
themselves.

Both focus visuals stay mounted and change only opacity, which keeps React
Native Windows Fabric from creating border visuals after mount. Neither region
uses the native focus ring or React Native `outline*` props.

Each action takes its outer corner radius from the logical corner properties, so
a right-to-left surface rounds the trailing region on the correct side without a
separate style.

On Windows each region maps to a UI Automation button that exposes its disabled
state; Narrator reads two controls per tag. On macOS each maps to the equivalent
button element for VoiceOver. The leading media, the divider, and the dismiss
glyph contribute nothing to either name.

## Divergences from Flex

| ID                                         | Disposition | React Native contract                                                                                                                                                                                  | Follow-up                                                                                |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `interaction-tag-appearance-prop-name`     | Accepted    | The color family axis is named `appearance` with the values `primary` and `secondary`, matching the other components in this package. Flex names the axis differently while using the same two values. | None.                                                                                    |
| `interaction-tag-leading-content-is-slots` | Accepted    | Leading media is two mutually exclusive optional slots that render only when supplied. Flex models it as two boolean toggles with the icon toggle on by default.                                       | None. A slot that renders a caller-supplied element cannot default to on.                |
| `interaction-tag-dismiss-is-caller-owned`  | Accepted    | The dismiss action reports `onPress`; the caller removes the tag from its own data. Flex describes the secondary action as removing the tag.                                                           | None. Removing itself is not something a controlled React Native component can do.       |
| `interaction-tag-single-disabled-axis`     | Accepted    | One `disabled` prop governs both regions. Flex documents a single State axis for the whole tag and does not describe disabling one region alone.                                                       | Revisit only if a scenario needs a live primary action beside a locked dismiss.          |
| `interaction-tag-no-state-transition`      | Accepted    | Hover, press, and disabled color changes are applied immediately with no transition. Flex calls for a short eased color transition.                                                                    | Needs motion tokens and an animated color layer on each region before it can be adopted. |

## Conformance

| Requirement | Evidence                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| ITAG-001    | `interaction-tag.types.ts`, `useInteractionTag.ts`, `interaction-tag.types.test.ts`, `interaction-tag.test.tsx` |
| ITAG-002    | `useInteractionTag.ts`, `renderInteractionTag.tsx`, `interaction-tag.test.tsx`, `interaction-tag.stories.tsx`   |
| ITAG-003    | `renderInteractionTag.tsx`, `interaction-tag.test.tsx`                                                          |
| ITAG-004    | `interaction-tag.types.ts`, `useInteractionTag.ts`, `interaction-tag.types.test.ts`, `interaction-tag.test.tsx` |
| ITAG-005    | `useInteractionTag.ts`, `interaction-tag.test.tsx`                                                              |
| ITAG-006    | `interaction-tag.styles.ts`, `useInteractionTagStyles.ts`, `interaction-tag.test.tsx`                           |
| ITAG-007    | `interaction-tag.styles.ts`, `useInteractionTagStyles.ts`, `interaction-tag.test.tsx`                           |
| ITAG-008    | `interaction-tag.styles.ts`, `interaction-tag.test.tsx`, `interaction-tag.stories.tsx`                          |
| ITAG-009    | `interaction-tag.styles.ts`, `useInteractionTag.ts`, `useInteractionTagStyles.ts`, `interaction-tag.test.tsx`   |
| ITAG-010    | `interaction-tag.styles.ts`, `useInteractionTagStyles.ts`, `interaction-tag.test.tsx`                           |
| ITAG-011    | `useInteractionTag.ts`, `interaction-tag.test.tsx`                                                              |
| ITAG-012    | `useInteractionTagStyles.ts`, `interaction-tag.test.tsx`, `interaction-tag.stories.tsx`                         |
| ITAG-013    | `useInteractionTag.ts`, `interaction-tag.types.test.ts`, `interaction-tag.test.tsx`                             |
