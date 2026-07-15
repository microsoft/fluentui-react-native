---
component: Card
platform: react-native (Windows, macOS)
---

# Card Interaction (React Native — Windows & macOS)

Card has two interaction profiles. **Static** cards are non-interactive grouping containers — they are not in the tab order and have no keyboard behavior of their own; only the controls inside their slots are focusable. **Interactive** cards expose the whole surface as a single activation/navigation target. The rules below apply to interactive cards unless noted.

## Keyboard navigation

- **Tab / Shift+Tab** — moves to the card's activation target (interactive cards only), then into the slot controls. The card surface is **one tab stop**; it does not trap Tab.
- **Enter** — activates the card's primary target (navigate / open). Use Enter when the card behaves as a link.
- **Space** — activates the card's primary target when it behaves as a button, or toggles **Selected** on a selectable card. (Choose one model — link vs button/toggle — and use the matching key; see `accessibility.md`.)
- **Nested controls keep their own keys.** Nested action buttons are independent tab stops with their own Enter/Space activation. Tabbing reaches them after the card surface; activating a nested Button must not also trigger the card.

> A static card registers **no** key bindings — remove it from the tab order entirely (no `tabindex`). Only its slotted controls are focusable.

## Focus management

- Interactive cards take focus on the **surface** element and render the universal dual-outline focus ring, which inherits the surface border radius. See `flex-system:styling` for the focus ring.
- **Focus order follows visual order:** card surface → Header controls → Footer controls, matching the card's top-to-bottom (or, for Direction=Horizontal, leading-to-trailing) layout.
- The card does **not** trap focus and is not a composite (roving-tabindex) widget — each interactive element inside is its own tab stop. The card surface and its nested controls are siblings in tab order, not parent-managed.
- Avoid making a card clickable when it contains multiple equally-weighted controls; overlapping a surface click target with independently focusable children is the most common source of "I can't tab to the button" and "clicking the button also opened the card" bugs.

## Animation

Static cards have no animation. Interactive cards may use a fast color fade (≤150ms, ease-in-out) only when a product implementation supplies card-owned hover/press styling; the current `tokens.yaml` does not author component-owned hover/pressed color tokens. Any lift uses a short elevation transition. Selecting a card transitions to the Selected fill/stroke as an instant or fast color change — Selected is a discrete token assignment.

> **Reduced motion:** Under the OS reduce-motion setting, suppress any scale/translate and any elevation transition. A color-only rest→hover change is acceptable but should be instant (0ms). Content must never depend on the animation to be understood.
