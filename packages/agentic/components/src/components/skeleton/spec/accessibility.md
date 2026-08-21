---
component: Skeleton
platform: react-native (Windows, macOS)
---

# Skeleton Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** None on the Bar itself. The Bar is decorative — the loading state must be communicated at the container level. The container that holds one or more skeletons should set `aria-busy="true"` while data is loading and remove it (or set it to `"false"`) when content arrives.
- **Required attributes:**
  - On the container: `aria-busy="true"` for the duration of the load. This is what assistive technology checks to announce loading state — not the individual bars.
  - On individual bars: `aria-hidden="true"` is appropriate when the bar sits inside an `aria-busy` container. The container's busy state subsumes the bars; announcing each bar separately is noise.
  - For larger or important loading regions, pair the skeleton group with a sibling `aria-live="polite"` region that announces a short status string ("Loading…" / "Content loaded") rather than relying on `aria-busy` alone. Do not stack multiple live regions for one load — one per region is enough.
  - When a skeleton wraps a future focusable element (a button or link that will exist once loaded), reserve an accessible name on the eventual focus target so the user's keyboard journey is not silently disrupted when content arrives mid-tab-cycle.
- **WCAG:**
  - **1.4.11 — Non-text Contrast:** The bar (`--gnrc-color-background-neutral-subtle`) must remain perceptible against the page background. The subtle weight is intentionally low contrast because the bar is decorative; if a skeleton is being used to convey a meaningful boundary (which it usually should not), the 3:1 threshold applies.
  - **2.2.2 — Pause, Stop, Hide:** The Wave animation runs for a typically short, indeterminate duration. The WCAG 5-second exemption generally applies, but the OS reduce-motion setting must still disable the animation entirely — see `interaction.md`.
  - **2.3.3 — Animation from Interactions (AAA):** The Skeleton's motion is not triggered by user interaction, but the same principle applies — provide a reduced-motion fallback so users sensitive to motion are not exposed to a continuous loop they did not opt into.
  - **4.1.2 — Name, Role, Value:** The loading state must be programmatically determinable via `aria-busy` (or an equivalent live region pattern). The bar's appearance alone does not satisfy this criterion.
- **Screen reader:** With `aria-busy="true"` on the container, supporting assistive technology may suppress reading the inner content during the busy period and announce the state on focus or change. When a live region is paired with the skeleton group, it announces the configured loading message politely.

---

## Usage

- **Live regions:** Use one `aria-live="polite"` region per logical loading group, not one per bar. Excessive live regions cause overlapping announcements that desensitize users to the pattern. Never use `aria-live="assertive"` for skeletons — loading state is not urgent.
- **Focus lifecycle:** Do not move focus to a skeleton — there is nothing to interact with. When loading completes and content swaps in, focus should remain where the user placed it. If the user was focused inside the region pre-load and the load destroys their focus target, return focus to a stable parent landmark rather than letting it fall to `<body>`.
- **Zoom:** Skeleton has no text content, so reflow concerns at 200% / 400% are limited to the bar dimensions tracking the surrounding container. Ensure the bar continues to size to its content target at zoomed scales rather than being pinned to a fixed pixel width.
- **Combinations:** Skeleton inside a modal or popover behaves correctly as long as the container manages `aria-busy` and the focus trap independently. A skeleton group with no `aria-busy` container is the most common implementation error — bars alone communicate nothing to assistive technology.
