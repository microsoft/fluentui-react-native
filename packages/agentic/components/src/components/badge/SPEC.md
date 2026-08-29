---
name: badge
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Badge

## Scope

Badge is a non-interactive React Native indicator for a compact status, count, or category. It owns visual appearance, color, size, shape, and icon/text composition. It does not provide an action, focus target, positioning overlay, disabled state, or a status-management model.

## Public contract

`appearance` defaults to `tint`; `color` defaults to `brand`; `size` defaults to `medium`; `shape` defaults to `circular`; and `layout` defaults to `iconAndText`. Appearance accepts `tint` or `outline`; color accepts `brand`, `danger`, `success`, `warning`, or `informative`; size accepts `small` or `medium`; shape accepts `circular` or `rounded`.

`root` is required. In `iconAndText` layout, `content`, `leadingIcon`, and `trailingIcon` are optional slots. Content renders by default as “Badge” unless explicitly `null`. `leadingIconVisible` defaults to `true`, and the leading slot defaults to the selected-circle icon. `trailingIconVisible` defaults to `false`; enabling it renders only a supplied trailing slot. In `iconOnly` layout, `leadingIcon` is required by the public type, it is always visible, and text/trailing icon props are excluded.

Rendering order is leading icon, content, then trailing icon, omitting unavailable slots. The root is non-focusable. Resolved state stores the variant values, slot-presence facts, visibility booleans, icon-only state, theme state, and user style. User root style follows structural, layout, appearance, and color styles.

### Requirements

- **BDG-001:** Expose the documented finite variant axes, defaults, and discriminated `iconOnly` prop shape.
- **BDG-002:** Render only visible slots in leading-icon, content, trailing-icon order, including slot defaults and icon-only exclusion.
- **BDG-003:** Map appearance, color, size, shape, typography, and icon dimensions to the documented FURN bindings and apply user root style last.
- **BDG-004:** Keep normal badges out of the accessibility tree, expose a labeled badge as an image, and warn when an icon-only badge has no accessible name.
- **BDG-005:** Remain non-interactive and leave host placement, activation, and state meaning to the containing component.

## Platform behavior

Badge uses a React Native `View` and is never focusable on Windows or macOS. A badge with `accessibilityLabel` or a referenced accessible label is exposed with image role; otherwise its default root and descendants are hidden from accessibility. Icon slots are always decorative.

Windows maps an informative badge to a UI Automation image; macOS maps it to an AX image. Neither platform receives press, keyboard, hover, focus, or disabled behavior from this component. Positioning is normal React Native layout unless a parent supplies placement through its own layout or a user style.

## Divergences from Flex

No material behavioral divergence was identified. The source evidence’s web accessibility concepts are adapted to React Native accessibility props and platform accessibility APIs.

## Conformance

| Requirement | Evidence                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| BDG-001     | `badge.types.ts`, `useBadge.ts`, `badge.types.test.ts`, `badge.stories.tsx` |
| BDG-002     | `useBadge.ts`, `renderBadge.tsx`, `badge.test.tsx`                          |
| BDG-003     | `badge.styles.ts`, `useBadgeStyles.ts`, `badge.test.tsx`                    |
| BDG-004     | `useBadge.ts`, `useBadgeStyles.ts`, `badge.test.tsx`                        |
| BDG-005     | `badge.types.ts`, `useBadge.ts`, `badge.stories.tsx`                        |
