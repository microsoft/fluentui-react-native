---
component: Scrollbar
platform: react-native (Windows, macOS)
---

# Scrollbar Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** None on the thumb. Prefer native overflow (`overflow: auto` / `overflow: scroll`) and the platform's built-in scrollbar pseudo-element (`::-webkit-scrollbar`) over a custom `role="scrollbar"` widget. A `role="scrollbar"` implementation requires authoring full keyboard handling, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` updates, and `aria-controls` wiring — native scroll is preferred because it inherits all of these for free.
- **Required attributes:**
  - When the scrollable container is itself focusable (a `tabindex="0"` reading region), `aria-label` or `aria-labelledby` must describe what is being scrolled (e.g., "Conversation history") so screen readers can announce the region on focus.
  - If a custom `role="scrollbar"` is unavoidable, the thumb element requires `aria-controls` (id of the scrolled region), `aria-orientation`, `aria-valuemin` (0), `aria-valuemax` (max scroll length), and `aria-valuenow` (current scroll offset) updated on every scroll frame.
- **WCAG:**
  - **1.4.3 — Contrast (Minimum):** The thumb's `--gnrc-color-foreground-neutral-tertiary` against the page surface must meet the 3:1 non-text contrast minimum (criterion 1.4.11 below). The 4.5:1 text threshold does not apply because the thumb is graphical.
  - **1.4.11 — Non-text Contrast:** The thumb is a meaningful UI component (it conveys scroll position) and must meet 3:1 contrast against the adjacent background. Verify against both light and dark mode surfaces.
  - **2.1.1 — Keyboard:** All scroll interactions must be reachable from the keyboard. Inheriting native scroll handling satisfies this by default; a custom scrollbar widget must wire the keys documented in `interaction.md` § Keyboard navigation explicitly.
  - **2.4.7 — Focus Visible:** Focus is owned by the scrolled content or container, not the thumb. The universal dual-outline focus ring (`flex-system:styling`) applies to the focused descendant. Do not suppress focus rings inside scroll containers.
  - **1.4.10 — Reflow:** Horizontal scroll on the body or page is a reflow violation. The Horizontal variant must only appear on local containers (tables, code blocks, image strips), never on document-level content.
- **Screen reader:** The thumb itself is not announced when native scroll is used. The scrolled content is announced as the user navigates within it. With `role="scrollbar"`, screen readers announce the thumb's current position as a percentage derived from `aria-valuenow` / `aria-valuemax`.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Zoom (200% / 400%):** The thumb scales with the page zoom factor. At 400% the thumb remains visible but a thicker thumb may improve discoverability — consider an opt-in thicker thumb for high-zoom environments, or rely on the OS's overlay scrollbar settings when the underlying surface honors them.
- **Focus lifecycle:** Focus does not enter the Scrollbar. When a user tabs into a scrollable region, focus lands on the container (if it is `tabindex="0"`) or on the first focusable descendant. Do not move focus to the thumb on scroll events.
- **Overlay scrollbar discoverability:** Because the thumb hides at rest, users who have not interacted with the container may not realize content overflows. When discoverability is critical (e.g., the bottom of a long form contains a Submit button), prefer reflowing the content or surfacing a persistent affordance — do not rely on the Scrollbar alone to communicate "there's more below."
- **Combinations with focus traps:** Inside a modal or dialog, the focus trap encompasses the scrolled content. The Scrollbar adds no additional focus stops and does not perturb the trap.
