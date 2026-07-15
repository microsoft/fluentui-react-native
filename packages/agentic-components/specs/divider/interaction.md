---
component: Divider
platform: react-native (Windows, macOS)
---

# Divider Interaction (React Native — Windows & macOS)

## Keyboard navigation

None — Divider is not focusable and not part of the tab order.

## Focus management

None — Divider does not receive or manage focus. It has no focus ring.

## Orientation and content flow

- **Horizontal (Vertical=False):** Root container is `flex-row`. Lines are 1px tall, flex-grow horizontally. Content padding is applied on the horizontal axis.
- **Vertical (Vertical=True):** Root container is `flex-column`. Lines are 1px wide, flex-grow vertically. Content padding is applied on the vertical axis. Label and icon text remain horizontal — do not rotate or apply `writing-mode` changes to the content slot.

## Cross-axis alignment

In both orientations, the line segments and the content slot share a common cross-axis center so the line passes through the geometric midpoint of the label. In horizontal orientation this is vertical centering; in vertical orientation this is horizontal centering. The 1px line must not collapse to the leading edge — it stays visually anchored to the label.

## Responsive behavior

Divider stretches to fill its parent container along its primary axis. It does not define a fixed width or height — the parent layout determines extent.
