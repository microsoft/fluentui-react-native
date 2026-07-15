---
component: Accordion
---

# Accordion Usage

## When to Use

- To progressively disclose content in sections — FAQs, settings categories, reference details.
- When a surface has multiple content sections and screen space is limited.
- When most users will only need a subset of the available sections.

### When NOT to Use

- Never place content that is required to complete the current task inside an accordion.
- Do not use as a navigation pattern; use a nav component or tree instead.
- If only one section exists, use a plain content block — the expand/collapse affordance implies multiplicity.

---

## Behavior

- **Never place required content inside an accordion.** If completing the current task depends on the content, it must be visible by default.
- **Never use the Expanded axis to simulate a Selected state.** Expanded communicates content visibility, not persistent selection.
- **Never hardcode body content dimensions.** The Body panel must grow to fit its child component.

---

## Content

- **Always provide a meaningful title.** Generic labels like "More" or "Details" are insufficient for users to decide whether to expand.
