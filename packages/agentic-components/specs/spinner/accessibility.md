---
component: Spinner
platform: react-native (Windows, macOS)
---

# Spinner Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** `progressbar` in the indeterminate pattern — set `role="progressbar"` and omit `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. Indeterminate progress is conveyed by the absence of value attributes plus an accessible name. Alternative pattern: wrap the spinner in an `aria-busy="true"` region and rely on the container for state. Choose one pattern per region — combining both produces duplicate announcements.

  **`role="progressbar"` pattern** — the spinner itself carries the role and accessible name:

  ```html
  <span class="spinner" role="progressbar" aria-label="Loading messages">
    <svg …>…</svg>
  </span>
  ```

  **`aria-busy` container pattern** — the container carries the loading semantics and the spinner is decorative:

  ```html
  <div aria-busy="true" aria-live="polite" aria-label="Loading user profile">
    <span class="spinner" aria-hidden="true">
      <svg …>…</svg>
    </span>
  </div>
  ```

- **Required attributes:**
  - `aria-label` — required on the spinner itself when no visible label sits adjacent. Describe what is loading ("Loading messages"), not the indicator ("Spinner").
  - `aria-labelledby` — preferred over `aria-label` when an adjacent visible label exists; point at that label's element so the visible text and the screen-reader announcement stay in sync.
  - `aria-busy="true"` — when wrapping a region with a spinner, set this on the container so assistive technology suppresses the inner content while loading. Remove (or set `"false"`) when content arrives.
- **WCAG:**
  - **1.4.11 — Non-text Contrast:** Track (`--gnrc-color-stroke-neutral-subtle`) and indicator (`--gnrc-color-stroke-neutral-loud`) must each meet the 3:1 ratio against their surrounding surface. The indicator carries the loading meaning; the track must remain perceptible enough to read as the spinner's diameter rather than as page chrome.
  - **2.2.2 — Pause, Stop, Hide:** The rotation is continuous and may exceed five seconds. The WCAG exemption for essential indeterminate loading typically applies, but the OS reduce-motion setting must still disable the rotation entirely — see `interaction.md`.
  - **2.3.3 — Animation from Interactions (AAA):** Spinner motion is not interaction-triggered, but the principle applies — provide a reduced-motion fallback so users sensitive to motion are not exposed to a continuous loop they did not opt into.
  - **4.1.2 — Name, Role, Value:** The loading state must be programmatically determinable. Either `role="progressbar"` with an accessible name, or an `aria-busy` container plus a live region, satisfies this criterion. The visual rotation alone does not.
- **Screen reader:** With `role="progressbar"` and an accessible name, the spinner is announced once on first encounter ("Loading messages, busy"). For longer or important loads, pair the spinner with a sibling `aria-live="polite"` region announcing a short status string ("Loading…" / "Content loaded") — the spinner alone provides no completion announcement. Do not duplicate the spinner's name in the live region's text; the announcements then collide.

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Live regions:** Use one `aria-live="polite"` region per logical loading group, not one per spinner. Excessive live regions cause overlapping announcements that desensitize users to the pattern. Never use `aria-live="assertive"` for spinners — a load is not urgent.
- **Focus lifecycle:** Do not move focus to a spinner — there is nothing to interact with. When loading completes and content swaps in, focus should remain where the user placed it. If the user was focused inside the region pre-load and the swap destroys their focus target, return focus to a stable parent landmark rather than letting it fall to `<body>`.
- **Reduced motion:** Honor the OS reduce-motion setting as described in `tokens.yaml` and `interaction.md`. The static arc plus ARIA semantics carry the loading state; do not substitute a slow rotation or pulsing fallback — both still trigger motion sensitivity.
- **Zoom:** Spinner diameters are fixed pixels per size variant. At 200% / 400% zoom the spinner grows proportionally via platform zoom rather than layout reflow. Ensure the spinner remains within its host region at zoomed scales — do not pin it to a position that clips outside the viewport.
- **Combinations:** A spinner inside an `aria-busy` container plus an additional `role="progressbar"` produces duplicate announcements — pick one pattern. A spinner inside a focus-trapped modal must not be the trap's initial focusable target; place it as content, not as the initial focus.
