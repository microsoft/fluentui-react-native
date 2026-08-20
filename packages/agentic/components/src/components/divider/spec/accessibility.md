---
component: Divider
platform: react-native (Windows, macOS)
---

# Divider Accessibility (React Native — Windows & macOS)

## Spec

- **ARIA role:** `separator`.
- **Required attributes:**
  - When Vertical=True, keep the divider semantic as a separator and ensure the host accessibility API can distinguish the orientation if available.
  - When the Divider contains a visible label, the separator should reference the label via `accessibilityLabel` so assistive technology can announce the section boundary context.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** The separator role communicates that a thematic break exists between content groups.
  - **1.4.3 — Contrast (Minimum):** The label text (`foregroundNeutralSecondary`) on the page surface must meet 4.5:1 contrast. The line itself (`strokeNeutralSubtle`) is decorative and not subject to minimum contrast, but should remain perceptible.
  - **1.4.11 — Non-text Contrast:** The divider line must have at least 3:1 contrast against the adjacent background if it conveys meaningful boundaries (not purely decorative).
- **Keyboard:** Not applicable — Divider is not focusable.
- **Screen reader:** Announces "separator" with label text if present. Decorative dividers may be hidden from accessibility when the separation is already communicated by heading structure.

---

## Usage

- **Semantic markup:** Use the separator role on the root. Purely visual views without a semantic role are inaccessible.
- **Orientation attribute:** When Vertical=True, keep the host accessibility tree aligned with the vertical layout.
- **Decorative dividers:** When the separation is already communicated by heading structure, hide the divider from accessibility to reduce screen reader verbosity.
