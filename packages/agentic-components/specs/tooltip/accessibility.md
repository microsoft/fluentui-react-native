---
component: Tooltip
platform: react-native (Windows, macOS)
---

# Tooltip Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `tooltip` on the tooltip container element.
- **Required attributes:**
  - `id` on the tooltip container — referenced by the trigger's `aria-describedby`.
  - `aria-describedby="{tooltipId}"` on the trigger element — associates the tooltip description with the trigger for screen readers.
  - Tooltip must **not** contain interactive elements — `role="tooltip"` regions are not part of the tab order.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Label text on the surface background must meet 4.5:1. `foreground-neutral-primary` against `surface-neutral-nearer` is designed to satisfy this.
  - **1.4.13 — Content on Hover or Focus:** Tooltip must be **persistent** (remains visible for the entire duration of hover or focus — not dismissed on a timer), **dismissible** via `Escape` without moving pointer or focus, and **hoverable** (pointer can move over the tooltip without it hiding — supports users with screen magnification who need to reach the tooltip to read it).
  - **2.1.1 — Keyboard:** Tooltip must appear when its trigger receives keyboard focus.
  - **2.4.7 — Focus Visible:** Focus is managed on the trigger, not the tooltip. Ensure trigger's own focus ring is visible when tooltip is shown.
- **Screen reader:** The tooltip text is read as a description of the trigger via `aria-describedby`. Screen readers announce it after the control's name and role. Do not duplicate the tooltip text in the trigger's accessible name.

---

## Usage

- **Trigger association:** Always associate the tooltip with its trigger via `aria-describedby`. Without this link, screen reader users receive no tooltip content.
