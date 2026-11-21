---
name: badge
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Badge

## Scope

Badge is a non-interactive React Native indicator for a compact status, count, or category. It owns visual appearance, color, size, shape, and icon/text composition. It does not provide an action, focus target, positioning overlay, disabled state, or a status-management model.

## Public contract

Status layouts `iconAndText` (default) and `iconOnly` use `tint` (default) or `outline`. `counter` and `dot` use only `filled`, inferred when omitted; status content and icon props are excluded for notifications. `color` defaults to `informative` and accepts `danger`, `success`, `warning`, or `informative`. `size` defaults to `medium` and accepts `small` or `medium`. `shape` defaults to `circular`; `rounded` is supported except on dots.

`root` is required. In `iconAndText`, `content` defaults to “Badge”, `leadingIconVisible` defaults to `true`, and `trailingIconVisible` defaults to `false`. Callers can replace the status-specific leading icon; it is always visible in `iconOnly`. Enabling the trailing icon renders only a supplied trailing slot. A `counter` requires caller-supplied `count` (number or preformatted string); it is at least 16/20 units wide and expands for longer labels. A `dot` has no content, measures 6/8 units, and has a contrast boundary.

Status order is leading icon, content, then trailing icon. Tint paints a semantic soft fill over a neutral-nearer backing surface; Outline uses semantic stroke; Filled uses semantic loud fill and, for counts, on-loud text. The root is never focusable. Caller visuals follow the resolved token defaults.

### Requirements

- **BDG-001:** Expose the documented finite variant axes, defaults, and discriminated status/counter/dot layouts.
- **BDG-002:** Render only visible slots in leading-icon, content, trailing-icon order, including slot defaults and icon-only exclusion.
- **BDG-003:** Map appearance, color, size, shape, typography, and icon dimensions to the documented FURN bindings and apply user root style last.
- **BDG-004:** Keep badges decorative by default, allow named standalone status badges, and keep notification meaning on the host rather than adding a redundant accessibility target.
- **BDG-005:** Remain non-interactive and leave host placement, activation, and state meaning to the containing component.

## Platform behavior

Badge uses a nonfocusable React Native `View`. A named status Badge requests image role; a notification Badge and all decorative descendants are hidden. Badge implements no press, keyboard, hover, focus, or disabled behavior. Placement belongs to the host.

## Divergences from Flex

- `badge-host-owned-notification-accessibility` — **accepted.** Counter and Dot are always decorative in FURN. Their host supplies the accessible notification meaning rather than giving the visual marker its own accessible node.

## Conformance

Unit and type evidence covers layout, defaults, and prop ownership. Native contrast, sizing and host notification announcements still require renderer evidence.

| Requirement | Evidence                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| BDG-001     | `badge.types.ts`, `useBadge.ts`, `badge.types.test.ts`, `badge.stories.tsx` |
| BDG-002     | `useBadge.ts`, `renderBadge.tsx`, `badge.test.tsx`                          |
| BDG-003     | `badge.styles.ts`, `useBadgeStyles.ts`, `badge.test.tsx`                    |
| BDG-004     | `useBadge.ts`, `useBadgeStyles.ts`, `badge.test.tsx`                        |
| BDG-005     | `badge.types.ts`, `useBadge.ts`, `badge.stories.tsx`                        |
