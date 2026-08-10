# ComponentsV2

`@fluentui/react-native-components-v2` contains React Native controls whose public APIs align with Fluent UI React web controls.

## Button

The `Button` builds on FURN `ButtonV1` and supports the Fluent UI React appearances:

- `primary`
- `secondary` (default)
- `outline`
- `subtle`
- `transparent`

It also supports `disabledFocusable`, which preserves keyboard focus while suppressing invocation and using disabled styling.

## Checkbox

The `Checkbox` matches Fluent UI React's tri-state API and stories. It supports controlled and uncontrolled checked,
unchecked, and mixed values; medium and large sizes; square and circular indicators; labels before or after the
indicator; wrapping labels; required and disabled states; native accessibility; and Web-parity pointer and keyboard
interaction.

## Carousel

The `Carousel` provides controlled and uncontrolled navigation, circular looping, slide and fade animations,
interruption-safe transitions, swipe interaction, autoplay controls, reduced-motion behavior, direct indicators,
image-preview navigation, announcements, and flat or elevated appearances.

## Fluent catalog preview

`FluentCatalogPreview` renders the native example for a Fluent UI React component and Storybook mode.
It reuses FURN controls where an implementation exists and uses Fluent-styled React Native
compositions for web components that do not yet have a FURN package. The generated React Native
catalog uses this facade to keep its component pages and mode names synchronized with the Fluent UI
React Storybook.
