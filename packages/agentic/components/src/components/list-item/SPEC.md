---
name: list-item
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# ListItem

## Scope

ListItem is a pressable row with optional supporting text, leading visual
content, a trailing container, and a parent-owned selection presentation. It
does not implement collection navigation, selection coordination, or a
separate action model for trailing content.

## Public contract

`content` defaults to `"List item"`. `size` defaults to `medium`,
`selectionMode` to `none`, `secondaryContentPosition` to `right`, `disabled`
and `selected` to `false`. The root accepts owned React Native `Pressable`
props; its caller style is applied last.

The public slots are `root`, required `content`, and optional
`secondaryContent`, `icon`, `selectedIcon`, `avatar`, and `trailing`.
`selectionIndicator` and the hidden content reservation are state-only slots.
The rendered root contains the persistent FocusVisual, the selection glyph,
then CompoundItemLayout. The layout renders avatar before the active icon,
the layout-stable content, optional secondary content, and optional trailing
content. A selected `selectedIcon` replaces `icon`; avatar takes precedence
over either icon.

`selected` is externally owned. Pressing the root forwards `onPress` but never
changes it. `selectionMode` chooses no glyph, a radio-like glyph, or a
checkbox-like glyph. A selected multiple-selection row deliberately omits its
row fill. Disabled rows also omit selection fill; other selected rows reserve
semibold content width and show the selected fill.

### Requirements

- **LIT-001:** Defaults, public slots, and owned Pressable props are resolved
  as declared.
- **LIT-002:** Render order includes only supplied public content and preserves
  the selected-icon and avatar precedence rules.
- **LIT-003:** Selection remains caller-owned, and each selection mode renders
  its documented presentational indicator and selected visual treatment.
- **LIT-004:** Disabled, hover, press, focus, accessibility, and user-style
  behavior remain coherent on the root.
- **LIT-005:** Size and secondary-content-position mappings preserve the
  documented React Native layout behavior.

## Platform behavior

On Windows and macOS, the root is a React Native `Pressable`, defaulting to
the `button` accessibility role. It merges a caller's accessibility state with
`disabled` and `selected`, is accessible by default, and is focusable unless
disabled. Native press, pointer hover, and focus events drive the resolved
state. The component keeps a dual-ring FocusVisual mounted and only exposes it
while enabled and focused.

There is no internal keyboard roving, list position announcement, virtualized
item metadata, or selection change handling. A surrounding list may provide
those behaviors through its own React Native composition.

## Divergences from Flex

- `list-item-native-selection-indicators` (**accepted**): FURN renders the
  single- and multi-select indicators as inaccessible text glyphs rather than
  composing Radio or Checkbox controls.
- `list-item-native-role` (**accepted**): FURN gives the standalone row a
  button role by default and publishes `accessibilityState.selected`; it does
  not derive container-specific item semantics.

## Conformance

| Requirement | Evidence                                                             |
| ----------- | -------------------------------------------------------------------- |
| LIT-001     | `list-item.types.ts`, `useListItem.ts`, `list-item.types.test.ts`    |
| LIT-002     | `renderListItem.tsx`, `useListItem.ts`, `list-item.test.tsx`         |
| LIT-003     | `useListItem.ts`, `list-item.styles.ts`, `list-item.test.tsx`        |
| LIT-004     | `useListItem.ts`, `useListItemStyles.ts`, `list-item.test.tsx`       |
| LIT-005     | `list-item.styles.ts`, `list-item.stories.tsx`, `list-item.test.tsx` |
