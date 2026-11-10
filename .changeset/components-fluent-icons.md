---
'@fluentui-react-native/components': minor
---

Default icons are now Fluent SVG icons instead of Unicode placeholder glyphs. Checkbox, Accordion, Avatar, Badge,
Dropdown, ListItem, ListboxItem, MenuButton, MenuItem, ProgressBar, and Tag draw the Fluent Checkmark, Chevron, Dismiss,
Person, Circle, Radio button, Checkbox, Subtract, and status icons, using the nearest optical size for each slot. The
icons are generated ahead of time from `@fluentui/svg-icons` by a temporary local codegen (`yarn gen:icons`) and
committed, with `yarn check:icons` failing when they go stale, until `@fluentui/react-native-icons/codegen` replaces it
once it is published.

Breaking: `CheckboxIndicator` accepts only `SvgIconSource` values for `checkedIconSource` and `indeterminateIconSource`;
wrap a font glyph in a small component that renders `<Icon {...props} fontSource={...} />`.
`ListItemState.selectionGlyph` is replaced by `selectionIndicatorSource`, and the `selectionIndicator` slot is an `Icon`
rather than a `Text`.
