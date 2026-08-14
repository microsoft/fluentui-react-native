---
component: Input
platform: react-native (Windows, macOS)
---

# Input Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus to and from the input.
- **Typing** — enters text when focused. All printable characters are accepted.
- **Escape** — implementation-dependent; may clear the field or blur focus depending on context.
- No arrow key navigation between inputs — each Input is a single focusable element.

## Focus management

Focus follows standard platform behavior for `<input>` elements. Input does **not** use the standard dual-outline focus ring described in `flex-system:styling` — instead, the boundary stroke itself serves as the focus indicator. On focus, both styles swap their stroke to `--gnrc-color-stroke-neutral-heavy` — Outline as a full border, Underline as the bottom edge.

Hover and pressed are resolved state values, not base states of their own — they ride on top of whichever base is active. When the input is focused and hovered, the inline Focus hover value from `tokens.yaml` shifts the Focus stroke, not the Rest stroke. In CSS, write `:focus-visible` before `:hover` and `:active` so the hover/pressed value wins via cascade order.

## Animation

State transitions (Rest → Hover, Rest → Focus) are platform-driven color transitions on the stroke. Duration and easing reference motion tokens once defined; until then, keep transitions short (≤150ms) with standard ease-in-out so the focus shift does not lag perceptibly behind the caret appearance.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant. No scale, translate, or opacity animation is used on Input.
