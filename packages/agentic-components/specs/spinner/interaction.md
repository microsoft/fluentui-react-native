---
component: Spinner
platform: react-native (Windows, macOS)
---

# Spinner Interaction (React Native — Windows & macOS)

## Keyboard navigation

None — Spinner is not focusable and not part of the tab order. It is a non-interactive progress indicator.

## Focus management

None — Spinner does not receive or manage focus. When the loading state ends and real content replaces the spinner, ensure focus is not stranded inside an unmounting subtree. Manage focus on the parent container that owns the loading region, not on the spinner itself. If the user was focused inside the region pre-load and the swap destroys their focus target, return focus to a stable parent landmark rather than letting it fall to `<body>`.

## Animation

- **Default — continuous rotation:** The Indicator arc rotates 360° around the shared center on an infinite loop. Cycle duration ≈1500ms with linear or ease-in-out easing so the motion reads as a steady spin rather than a pulse. The loop must be continuous; do not pause between cycles.
- **Synchronization:** When multiple spinners appear together, their cycles must share a single timeline. Use a shared `animation-duration` and `animation-delay: 0s` on all instances within a logical group; do not stagger by index — staggered rotations read as unintended noise rather than as a coordinated loading state.
- **End of loading:** The animation stops at the moment the spinner is unmounted in favor of real content. Do not wind down or fade — the swap is instant.

## Indicator arc — SVG implementation

The 25% visible-arc rule from SKILL.md Anatomy is a constant — it must hold at every size variant from 16px through 44px. When implementing the Spinner as an SVG `<circle>` with `stroke-dasharray`, **normalize the dash cycle to the path length** so the visible fraction stays constant regardless of the circle's circumference.

- Set `pathLength="100"` on the indicator `<circle>` element.
- Set `stroke-dasharray="25 75"` — 25 units visible + 75 units gap, both interpreted as percentages of `pathLength` rather than as absolute distances.
- Combine with `vector-effect="non-scaling-stroke"` so the CSS stroke-width renders at the spec'd pixel value regardless of `viewBox` scaling.

```html
<circle class="spinner__indicator" cx="16" cy="16" r="14" pathLength="100" vector-effect="non-scaling-stroke" />
```

```css
.spinner__indicator {
  stroke-dasharray: 25 75;
  stroke-linecap: round;
}
```

> **Why this matters:** Without `pathLength` normalization, a fixed-pixel `stroke-dasharray` only matches the circumference at exactly one diameter. At every other size the dash cycle wraps the path imperfectly — smaller diameters render a shortened arc, larger diameters render two visible arc segments. `pathLength="100"` collapses all per-size dasharray math into a single declaration that holds at every size.

> **Reduced motion:** Under the OS reduce-motion setting, the rotation does not run. The Indicator arc renders at its starting angle as a static arc. Presence and an ARIA live region carry the loading semantics; no alternative animation (no fade, no pulse) is substituted. This matches the `motion` block in `tokens.yaml`.

## Responsive behavior

Spinner diameters are fixed pixels per size variant. At 200% / 400% platform zoom the spinner grows proportionally via the platform's zoom transform — not via layout reflow. Do not pin the spinner to a CSS width that the user cannot zoom; rely on the size variant.
