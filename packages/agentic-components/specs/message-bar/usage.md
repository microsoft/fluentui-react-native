---
component: MessageBar
---

# MessageBar Usage

## When to Use

- To surface the outcome of a user action across the full page or section (e.g., form submission error, successful save, warning about unsaved changes).
- To communicate a persistent system state that requires the user's attention.
- When the feedback is actionable and benefits from one or two inline responses adjacent to the message.

### When NOT to Use

- **Inline field validation** — use field-level error messages beneath the input.
- **Persistent help or instructional copy** — use hint text, a tooltip, or a callout.
- **Destructive confirmations** — use a Dialog.
- **Toasts and ephemeral notifications** — MessageBar is layout-anchored; use a Toast for floating notifications.

---

## Behavior

- **Never apply MessageBar to individual form fields.** It is a page- or section-level component.
- **Always match the status to the semantic meaning.** Never use Warning tokens to soften an Error message.
- **Never show more than two action buttons.** If more responses are needed, use a Dialog.
- **Always provide an accessible name on the dismiss button.** An × icon alone is not sufficient — the dismiss control must have a readable name for assistive technology.

---

## Layout

- **Never hardcode the container width.** The 800px in the design source is for layout purposes only; in code, fill the parent.

---

## Content

- **Write a clear, specific title.** Summarize the essential information in a short word or phrase so the message is scannable. Use sentence-style capitalization (capitalize only the first word).
- **Keep the message body to one or two short sentences.** Aim for ~100 characters per line and build on the title rather than repeating it; messages over two lines wrap and reduce scannability.
- **Avoid congratulatory language in success messages.** Don't use "success" or "successfully" — state what changed or became ready, with actionable detail relevant to the person.
- **Error and warning messages must include a link, a button, or both.** Use links for supplementary information; begin link text with an action verb like "Learn" or "Explore" followed by specifics about the destination.
- **Write button labels that respond to the title and message.** Prefer a single verb; add a noun when the verb alone is ambiguous ("Renew license", not "Renew"). Use sentence-style capitalization.

> Source: Fluent 2 — MessageBar usage (Content).
