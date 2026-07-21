---
component: Menu
platform: react-native (Windows, macOS)
---

# Menu Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `menu` on the container element. For context menus, the trigger must have `aria-haspopup="menu"` and manage `aria-expanded`.
- **Required attributes:**
  - `role="menu"` — on the container.
  - `aria-labelledby` or `aria-label` — provides an accessible name for the menu (e.g., referencing the trigger button's text).
  - `id` — referenced by the trigger's `aria-controls`.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Container shadow must provide sufficient visual separation against the page background.
  - **2.1.1 — Keyboard:** Full arrow key, Enter, Space, Escape, and type-ahead support.
  - **2.4.7 — Focus Visible:** Focus ring must be visible on the currently focused item within the menu.
  - **2.4.3 — Focus Order:** Focus must move into the menu on open and return to the trigger on close.
- **Screen reader:** Announces menu role and accessible name on open. Navigating items announces each item's label, role, and state.

---

## Usage

- **Focus return:** Always return focus to the trigger on close. Losing focus after menu dismissal breaks keyboard navigation flow and violates WCAG 2.4.3.
- **Accessible name:** Always provide an accessible name via `aria-label` or `aria-labelledby`. A menu without a name is difficult for screen reader users to identify.
