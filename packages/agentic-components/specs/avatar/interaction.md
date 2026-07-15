---
component: Avatar
platform: react-native (Windows, macOS)
---

# Avatar Interaction (React Native — Windows & macOS)

## Keyboard navigation

None — Avatar is not focusable and is not part of the tab order. If the surrounding context (a person chip, a card, a list row) is interactive, that wrapper element owns the tab stop and keyboard handlers.

## Focus management

None — Avatar does not receive or manage focus and has no focus ring. Wrappers that make the avatar interactive must render their own focus ring on the wrapper, not on the avatar container.

## Activity ring rendering

The activity ring is rendered with CSS `outline` and `outline-offset` on the container, not as an additional layout element:

- The transparent `outline-offset` creates a true gap between the container edge and the brand stroke, revealing whatever surface sits beneath the avatar. Do not fake the offset with a background-colored ring — it would not match a custom surface color.
- Both the offset and stroke width scale with the Size axis (thin at sizes 16–40, thicker at 56 and 120). Refer to `tokens.yaml` for the exact `--gnrc-stroke-width-*` assignments per size.
- Because `outline` is painted outside the box and excluded from layout flow, toggling the activity ring never reflows neighboring content — even at size 120 where the ring is thickest.

## Initials vertical centering

The Initials text node requires a `line-height: 1` override at all sizes. Apply on whichever selector targets the Initials text node — the value is the contract, not the classname. See `tokens.yaml` (`typography.initials-line-height-override`) for the authoritative value and rationale.

## Animation

None — Avatar has no state transitions. There is no Hover, Pressed, Focus, or Disabled animation on the component itself. If the avatar is wrapped in an interactive control, the wrapper owns its own state animations.

> **Reduced motion:** Because Avatar has no animation, no reduce-motion accommodation is required on the component.

## Responsive behavior

Avatar maintains a fixed diameter per size — it does not flex, stretch, or compress with its parent container. Layouts that need a different visual scale should pick a different Size variant rather than applying CSS to resize a single instance.
