---
component: Divider
---

# Divider Usage

## When to Use

- To visually separate distinct content groups within a surface when spacing and typographic hierarchy alone are insufficient.
- To break a long vertical list or form into logical sections with optional section labels.
- To create a vertical boundary between side-by-side content regions (e.g., panel edges, column separators).
- To add a labeled section break where the label provides contextual orientation (e.g., "Or", a date, a category name).

### When NOT to Use

- Do not use a Divider purely for decoration — if the content groups are already visually distinct through spacing, background color, or type hierarchy, a Divider adds clutter.
- Do not use a Divider between every item in a list — prefer spacing. Reserve Dividers for grouping boundaries.
- Do not use a Divider as an interactive element — it has no states, no focus behavior, and no interactive role.

---

## Behavior

- **Never use a Divider when spacing alone communicates the boundary.** A Divider is explicit visual reinforcement — if gap tokens or typographic hierarchy already separate content, adding a Divider creates visual noise.
- **Never use a Divider as an interactive element.** It has no states, no focus behavior, and no click/tap behavior. If you need a clickable separator, use a different pattern.
- **Always use semantic separator markup.** Do not implement Dividers as purely visual `<div>` elements without semantic markup — the platform's separator primitive must be used so assistive technology can announce the thematic break.
- **Always let the Divider stretch to fill its parent container.** Do not set a fixed width or height on the Divider itself — the parent layout controls extent.
- **Use the Content slot visibility to toggle between labeled and plain dividers.** Do not hide the label by setting it to an empty string — toggle the Content slot or Text boolean instead.

---

## Content

- **Never place long-form text in the label slot.** Divider labels are short navigational cues — a word or brief phrase. If you need more than a few words, use a heading instead.
- **Always use the functional type ramp for labels.** Dividers are UI chrome — the content ramp is reserved for editorial and AI-generated content.
