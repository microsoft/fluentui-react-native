---
component: Scrollbar
platform: react-native (Windows, macOS)
---

# Scrollbar Interaction (React Native — Windows & macOS)

## Keyboard navigation

The Scrollbar inherits the platform's native scroll handling — there are no component-specific key bindings. When focus is inside the scroll container, the following standard keys apply:

- **Arrow Up / Arrow Down** — Scroll one line vertically.
- **Arrow Left / Arrow Right** — Scroll one column horizontally.
- **Page Up / Page Down** — Scroll one viewport length.
- **Home / End** — Scroll to the start / end of the content.
- **Space / Shift+Space** — Scroll one viewport down / up (when the container is a document-level scroller).

> Do not bind these keys explicitly on the Scrollbar. They are handled by the platform when the scrollable container has keyboard focus.

## Focus management

The Scrollbar thumb itself is not focusable. Focus belongs to the scrollable container or to interactive descendants within it. The thumb does not receive the universal dual-outline focus ring documented in `flex-system:styling` — the focus indicator instead surfaces on the content owner (the focused element inside the container).

If the parent scroll container is itself focusable (e.g., a `tabindex="0"` region that captures arrow keys), the focus ring is applied to the container per the universal pattern, not to the thumb.

## Show / hide

| Trigger                                      | Behavior                                         |
| -------------------------------------------- | ------------------------------------------------ |
| Scroll event on the container                | Thumb fades in over the next paint frame.        |
| Pointer enters the container or thumb        | Thumb fades in.                                  |
| Pointer leaves the container and scroll idle | Thumb fades out after the idle delay.            |
| Content length ≤ viewport length             | Thumb is removed from the DOM (not just hidden). |
| Container loses focus and scroll idle        | Thumb fades out.                                 |

## Animation

The thumb opacity transitions over a short interval when entering or leaving the visible state. Geometry changes (position, length) update instantly with the scroll frame — no easing, no interpolation — so the thumb tracks one-to-one with the content.

> **Reduced motion:** Under the OS reduce-motion setting, the opacity transition is removed. The thumb appears and disappears instantly, matching the `motion` block in `tokens.yaml`.

## Implementation paths

Two paths can deliver the Show / hide and Animation behavior above. The trade-off is visual fidelity against avoiding JS.

### JS-driven overlay thumb (full fidelity)

Hide the native scrollbar on the viewport (`scrollbar-width: none` for Firefox, `::-webkit-scrollbar { display: none }` for Chromium and Safari, `-ms-overflow-style: none` for legacy Edge) and paint an `aria-hidden` thumb element positioned absolutely over a `position: relative` wrapper. JS measures the viewport (`clientHeight / scrollHeight` for length, `scrollTop` / `scrollLeft` for position) on `scroll` and `ResizeObserver` events and toggles a `data-show` attribute on the wrapper to drive a CSS opacity transition. Clear `data-show` after a short idle delay (~700ms). Bind `pointerdown` on the thumb for drag-to-scroll. The platform keeps ownership of scroll, wheel, keyboard, and the accessibility tree.

This is the only path that delivers all four visual rules — `--gnrc-color-foreground-neutral-tertiary` foreground, `--gnrc-border-radius-circular` radius, 2px short axis, 4px inset — and the full Show / hide table (including the "fade out after idle" row).

Reference: `site/Content/components/generated/scrollbar/demo.html`.

### CSS-only with `scrollbar-color` (no JS)

When JS is not available, use the standardized `scrollbar-width` and `scrollbar-color` properties and transition `scrollbar-color`:

```css
.scroll-container {
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 200ms ease;
}
.scroll-container:hover,
.scroll-container:focus-within {
  scrollbar-color: var(--gnrc-color-foreground-neutral-tertiary) transparent;
}
```

Behavior by platform:

- **Chromium and Safari on macOS:** the platform honors the user's "Show scroll bars: Automatically based on mouse or trackpad" preference and overlays the scrollbar over content. The transition fades the thumb between transparent and tertiary when the pointer enters/leaves the container or focus moves in/out.
- **Chromium on Windows:** the thin scrollbar lane is rendered persistently inside its gutter. The color transition still drives a fade on hover/focus, but the gutter remains visible.
- **Firefox:** identical to Chromium on the same platform — `scrollbar-color` has been supported there the longest.

Trade-offs against the JS path:

- `scrollbar-width: thin` is platform-rendered (≈8px on macOS, ≈12px on Windows). The 2px short axis is not reachable.
- The thumb shape, radius, and inset are platform-rendered. `--gnrc-border-radius-circular` and the 4px inset cannot be applied.
- The fade trigger is `:hover` and `:focus-within` only. CSS has no event for "scroll start" or "scroll idle", so the "fades out N ms after the last scroll" row of the Show / hide table is not reproducible — the thumb only hides when the pointer leaves the container and focus moves elsewhere.

Use this path when a no-JS constraint outweighs visual fidelity.

> **Do not style `::-webkit-scrollbar` to achieve a fade.** Setting any thumb property (`background-color`, `border-radius`, `border`) on `::-webkit-scrollbar-thumb` opts the container out of Chromium's OS overlay behavior — the styled scrollbar then renders persistently regardless of OS preference. `opacity` and `opacity` transitions do not apply reliably to scrollbar pseudo-elements, so they cannot recover the lost auto-hide. The two viable strategies are the JS overlay above or the `scrollbar-color` transition; styling `::-webkit-scrollbar` is the trap they exist to avoid.

## Dragging the thumb

- **Pointerdown on the thumb** captures the pointer and begins drag-to-scroll. The container's scroll offset is updated in proportion to the pointer's delta along the thumb's long axis.
- **Pointerup** or **Pointercancel** releases the capture and returns the thumb to its idle (rest) appearance.
- The thumb's 2px thickness does not change during drag — there are no interaction-state visual shifts.
- Drag-to-scroll is pointer-only — there is no keyboard equivalent for grabbing the thumb itself. This is acceptable because the underlying scroll is fully keyboard-reachable via § Keyboard navigation; never gate critical interactions behind thumb-drag alone.

## Wheel and trackpad input

The Scrollbar reflects but does not handle wheel events. The platform's scroll machinery owns wheel-to-offset translation; the thumb position is recomputed from the resulting `scrollTop` / `scrollLeft` value each frame.
