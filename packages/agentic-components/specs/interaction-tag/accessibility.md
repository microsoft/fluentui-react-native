---
component: Interaction Tag
platform: react-native (Windows, macOS)
---

# Interaction Tag Accessibility (React Native — Windows & macOS)

## Spec

### ARIA role

The Interaction Tag is composed of two interactive elements within a non-interactive container:

- **Container** — `<div>` with no interactive role. Serves as the visual wrapper only.
- **Primary action area** — `<button>`. Owns the accessible name (from the label text or `aria-label` for Icon only layout).
- **Secondary action (dismiss)** — `<button>` with `aria-label` describing the dismiss intent (e.g., "Remove {tag name}").

> **Why two buttons, not one:** Tag uses a single `<button>` because its only action is dismiss. Interaction Tag has two distinct actions — each must be a separate focusable element so keyboard and assistive technology users can target them independently.

### Required attributes

| Attribute | Required when |
|-----------|--------------|
| `aria-label` on primary action | Icon only layout — must describe the entity and action intent (e.g., "View Angie's profile") |
| `aria-label` on secondary action | Always — must describe the dismiss intent (e.g., "Remove Angie") |
| `aria-disabled="true"` | Disabled state when the tag should remain in the tab order but be non-interactive |

### WCAG

| Criterion | Requirement |
|-----------|-------------|
| 1.4.3 — Contrast (Minimum) | All text and icon colors must meet 4.5:1 against their rest background for both styles — Secondary (`neutral-primary` on `neutral-subtle`) and Primary (`neutral-onloud` on `brand-heavy`). The divider must remain visible on each surface (`stroke-neutral-soft` on Secondary, `stroke-neutral-onloud` on Primary). Verify disabled tokens — intentionally below full contrast but should remain legible. |
| 2.1.1 — Keyboard | Both the primary action and secondary dismiss action must be operable via Enter and Space. |
| 2.4.7 — Focus Visible | Each interactive area must show a visible focus ring independently. The dual-outline focus ring (from `flex-system:styling`) satisfies this. |
| 2.5.8 — Target Size (Minimum, AA) | Each interactive area must meet 24×24px minimum. The secondary action at Small size is the tightest — verify icon + padding meets the minimum. |
| 4.1.2 — Name, Role, Value | Each button must expose its accessible name (label text or `aria-label`) and role (`button`). |

### Screen reader

- **Icon and text layout:** Screen reader announces the primary action as `"{Label text}, button"`. Secondary action announces as `"Remove {Label text}, button"`.
- **Icon only layout:** Screen reader announces the primary action using `aria-label` (e.g., `"View Angie's profile, button"`). Secondary action announces as `"Remove Angie, button"`.
- **Disabled state:** Screen reader announces `"dimmed"` or `"unavailable"` per platform conventions.

---

## Usage

- **Icon-only labels:** Icon only Interaction Tags require `aria-label` on the primary action describing the entity and action intent. Never label with the icon's shape.
- **Avatar leading content:** When an Avatar is the leading content, the accessible name should still come from the label text or `aria-label` — the avatar image is decorative (`aria-hidden="true"` or empty `alt`).
- **Dismiss intent must be specific:** The secondary action's `aria-label` should include the tag's identity (e.g., "Remove Engineering" not just "Remove" or "Dismiss"). This ensures unique labels when multiple tags appear in a group.
- **Zoom behavior (200%/400%):** At 200% zoom, Interaction Tags should reflow within their container. At 400%, tags may stack vertically. Both interactive areas must remain operable and the focus ring must remain visible at all zoom levels.
- **Voice access:** Users should be able to activate either action by saying the visible label. Ensure the primary action's accessible name matches the visible label text. The dismiss button should be targetable by "click Remove {name}".
