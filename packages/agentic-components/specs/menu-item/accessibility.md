---
component: MenuItem
platform: react-native (Windows, macOS)
---

# MenuItem Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `menuitem` (default), `menuitemcheckbox` (when Multiselect is true), or `menuitemradio` (when single-select via Checkmark). Section Header uses `presentation` or `separator` — it is not an interactive element.
- **Required attributes:**
  - `aria-checked="true|false"` — required on `menuitemcheckbox` and `menuitemradio` roles when selection state is exposed.
  - `aria-disabled="true"` — on disabled items that should remain announced by screen readers.
  - `aria-haspopup="menu"` — required when the item has a Chevron indicating a submenu.
  - `aria-expanded="true|false"` — required alongside `aria-haspopup` when the submenu is open.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** All text and icon foreground must meet 4.5:1 against their background at rest. Verify disabled tokens — intentionally below full contrast but should remain legible.
  - **2.1.1 — Keyboard:** Enter and Space must activate the item.
  - **2.4.7 — Focus Visible:** Focus ring must be visible on all non-disabled List Items.
  - **2.5.8 — Target Size (Minimum, AA):** Minimum interactive target height is 40px (met by the default item height).
- **Screen reader:** Announces label, role, and state (checked/unchecked for selection, disabled when applicable, "has submenu" when Chevron is present).

---

## Usage

- **Correct ARIA role per selection pattern:** Use `menuitemradio` for single-select with Checkmark; `menuitemcheckbox` for Multiselect; `menuitem` for non-selectable actions.
- **Section Header navigation:** Section Headers must not appear in the tab sequence or arrow key cycle — they are non-interactive labels.
