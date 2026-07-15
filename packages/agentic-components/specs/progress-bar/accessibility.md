---
component: ProgressBar
platform: react-native (Windows, macOS)
---

# ProgressBar Accessibility (React Native — Windows & macOS)

## Spec

Build-time requirements that must be satisfied by the component implementation.

- **ARIA role:** `role="progressbar"`. Prefer the native `<progress>` element when no animation customization is required — it carries the role and value semantics intrinsically. Custom `<div role="progressbar">` is acceptable when CSS control of Indicator animation is needed (typical for Indeterminate).
- **Required attributes:**
  - `aria-valuemin="0"` and `aria-valuemax="100"` — required for **Determinate** and **Static**. Omit both for **Indeterminate**.
  - `aria-valuenow="{0–100}"` — required for **Determinate** and **Static**. Omit entirely for **Indeterminate** — the absence of `aria-valuenow` is the ARIA signal for indeterminate progress.
  - `aria-valuetext` — optional but recommended when the visible Value text is something other than a raw percentage ("3 of 10 files", "240 GB of 500 GB used"). Without this, screen readers announce the numeric `aria-valuenow` rather than the contextual phrase.
  - `aria-labelledby` — required, pointing at the Label node. The Label slot is always rendered (see `SKILL.md` § Anatomy and § Variants "Why the Label is required"), so the bar's accessible name comes from visible text in every case.
  - `aria-describedby` — optional. Use to associate supplementary text (an inline help message, an error explanation) with the bar.
  - `aria-busy="true"` — set on **Indeterminate** bars. Reinforces the "work in flight" semantic, especially when reduce-motion removes the visual animation.
  - **Status changes** (Neutral → Error / Success) — when the bar is associated with a status change that requires user awareness (e.g. a failed upload), announce the change via a live region (`role="status"` for Success, `role="alert"` for Error) on a sibling element, not on the progressbar itself. The progressbar role's announcement semantics are not designed to deliver outcome messages.
- **WCAG:**
  - **1.3.1 — Info and Relationships:** The progressbar role and its `aria-value*` attributes programmatically communicate progress. Visual progress alone (Indicator width) is insufficient — the values must be exposed to assistive technology.
  - **1.4.3 — Contrast (Minimum):** Label text (`--gnrc-color-foreground-neutral-primary`) and Value text (`--gnrc-color-foreground-neutral-secondary`) must meet 4.5:1 against the page surface. Validation icon foreground tokens carry semantic meaning and must also meet 3:1 minimum against the page surface.
  - **1.4.11 — Non-text Contrast:** The Track and Indicator pair is tuned for a soft, recessive visual and does **not** meet 3:1 against the page surface or between Track and Indicator on its own. The required Label (covered under 1.4.3 below) bridges this gap by naming the component and its state in text that does meet contrast — see `SKILL.md` § Variants "Why the Label is required". Consumers must not suppress the Label or rely on `aria-label` in place of the visible Label node.
  - **2.2.2 — Pause, Stop, Hide:** Indeterminate animation longer than 5 seconds must offer a mechanism to pause, stop, or hide it (typically a cancel button on the parent operation, not on the bar itself). The reduced-motion path (see `interaction.md`) satisfies this for users with the OS setting enabled, but a user-controllable affordance is still required for those without.
  - **2.3.3 — Animation from Interactions:** Determinate value-transition animation must be removable via the OS reduce-motion setting. Indeterminate's continuous loop must also be removable — see `interaction.md`.
  - **4.1.2 — Name, Role, Value:** Role is `progressbar`. Name comes from `aria-label` / `aria-labelledby`. Value is `aria-valuenow` (or the absence thereof, for Indeterminate). All three must be programmatically determinable.
- **Screen reader:**
  - **Determinate / Static:** Announces the label, the role ("progress bar"), and the current value — either the raw percentage from `aria-valuenow` or the `aria-valuetext` string when provided. Updates to `aria-valuenow` are announced politely by most screen readers; very frequent updates (every frame) should be throttled to once per ~10% step to avoid announcement spam.
  - **Indeterminate:** Announces the label, the role, and "busy" (from `aria-busy="true"` plus the absence of `aria-valuenow`). The screen reader does not announce ongoing progress; the user understands the operation is in flight but unmeasured.
  - **Status changes:** The progressbar itself does not announce Status transitions. Pair with a live region for outcome announcements (see `aria-busy` and status announcement notes above).

---

## Usage

Implementation-time considerations that cannot be solved at build. Cover only what applies.

- **Reduced motion:** Respect the OS reduce-motion setting per `interaction.md`. The Indeterminate visual loop must be removed and `aria-busy="true"` must carry the "in flight" semantic instead. Determinate value transitions become instant; the final value is still announced.
- **Value announcement throttling:** `aria-valuenow` updates that fire many times per second (e.g. byte-level upload progress) cause screen-reader announcement storms. Throttle DOM updates to ~10% increments or to no more than one announcement every ~500ms.
- **Indeterminate timeout and stuck-bar handling:** A bar that remains Indeterminate for an extended period appears stuck to all users, and is especially confusing for screen-reader users who cannot see the animation at all. If a backend has no progress signal, surface an estimated time or a cancel control in the surrounding UI — do not rely on the bar alone to communicate liveness.
- **Live regions for outcomes:** Status transitions (Error / Success) should be announced through a sibling live region, not the progressbar's own ARIA. `role="alert"` for Error (assertive), `role="status"` for Success (polite). Overusing `role="alert"` desensitizes users to genuine alerts.
- **Combinations with MessageBar:** When pairing a failed-status ProgressBar with an Error MessageBar, the MessageBar carries the page-level announcement (`role="alert"`); the bar's role stays `progressbar`. Avoid duplicating the failure announcement on both nodes — pick one source.
