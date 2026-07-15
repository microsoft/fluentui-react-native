---
component: Switch
platform: react-native (Windows, macOS)
---

# Switch Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `switch` — placed on the switch element (track + thumb + tappable padding), not on an outer wrapper that includes labels. The role and interaction surface must be scoped to the switch, excluding the label.
- **Required attributes:** `aria-checked` (true/false), `aria-label` or visible label association via `aria-labelledby`
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** Track and thumb must meet 3:1 against adjacent surface.
  - **2.1.1 — Keyboard:** Space and Enter must toggle the checked state.
  - **4.1.2 — Name, Role, Value:** Role and checked state must be programmatically determinable.

---

## Usage

- **Accessible name:** When a visible label is not present, provide `aria-label` or link an associated label via `aria-labelledby`. A switch with no accessible name is inaccessible.
- **Hover / pressed pairing:** Always pair hover with pressed. There are no hover-only interactions in this system.
