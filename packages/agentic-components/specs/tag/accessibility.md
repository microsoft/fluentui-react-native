---
component: Tag
platform: react-native (Windows, macOS)
---

# Tag Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `button` on the tag element.
- **Required attributes:**
  - `aria-label` — required on Icon only layout; must describe the tag category, not the icon (e.g., "Remove Engineering filter", not "X icon"). For Icon and text layout, the label text serves as the accessible name; supplement with an `aria-label` if the dismiss intent is not clear from context (e.g., "Dismiss {tag name}").
  - `aria-disabled="true"` — use on disabled tags that should remain in the tab order. Use native `disabled` when the tag should be excluded from interaction entirely.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** All text and icon colors must meet 4.5:1 against their background at rest. This applies to both styles — Primary (`neutral-onloud` on `brand-heavy`) and Secondary (`brand-primary` on `brand-soft`). Verify disabled tokens — intentionally below full contrast but should remain legible.
  - **2.1.1 — Keyboard:** Enter and Space must trigger dismiss.
  - **2.4.7 — Focus Visible:** Focus ring must be visible in all non-disabled states.
  - **2.5.8 — Target Size (Minimum, AA):** Minimum interactive target is 24×24px. Small Icon only meets the minimum boundary.

---

## Usage

- **Icon-only labels:** Icon only Tags require `aria-label` describing the tag's category and dismiss intent (e.g., "Remove Engineering filter"). Never label with the icon's shape.
