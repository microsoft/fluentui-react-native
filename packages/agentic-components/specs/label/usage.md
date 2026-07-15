---
component: Label
---

# Label Usage

## When to Use

- To name a form control (Input, Checkbox, Switch, Tag input, etc.) with a persistent, programmatically associated text element.
- To communicate that a form control is required, via the trailing asterisk slot.
- **Not for prose or descriptions.** Label looks like body text but carries a programmatic association to its control that plain text does not. Use Label whenever the text names a form control; use body text for prose, descriptions, or content that is not a control name.
- **Not for grouping multiple controls.** Section headings introduce regions of content; Labels introduce single controls. If multiple controls share a heading, use a heading element for the section and individual Labels per control.

---

## Behavior

- **Always pair Label with a form control.** A standalone Label with no associated control is meaningless — there is nothing to name. If you need uncoupled text, use body text or a heading.
- **Mirror Disabled with the associated control.** When the associated control is disabled, set Label to Disabled too. A Rest Label next to a Disabled control reads as a labeling bug and creates a perception that the control could be activated.
- **Required and Disabled compose.** A field can be Required + Disabled (the field is required when re-enabled, but currently unavailable). In that combination, the asterisk drops danger color and inherits disabled foreground — the asterisk is not a state indicator on its own.
- **Required indicator is a marker, not a message.** The asterisk signals required state but does not explain it. If a form has any required fields, include a key elsewhere on the surface (e.g. "\* indicates required field") or use natural-language indication in helper text — do not rely on the asterisk alone for users who may not recognize the convention.
- **Supplemental context belongs elsewhere.** Label names its associated control — it is not the place to attach optional explanatory affordances. Surface supplemental context through helper text, a description, or a separate InfoLabel composition when one is available.

---

## Layout

- **Position above the associated control by default.** Top-aligned labels scan faster than left-aligned ones and avoid the line-length problems of left-aligned labels with long strings. Left-aligned labels are acceptable in dense settings pages where horizontal real estate is plentiful and label lengths are predictable.
- **Pair Label size with the associated control size 1:1.** Medium Input → Medium Label, Small Input → Small Label, Large Input → Large Label. Mismatched sizes break the visual hierarchy of the field.
- **Pick Weight by role, not by taste.** Use Regular (default) when Label sits inline next to a self-contained control (Checkbox, Switch, Radio) where the label reads as accompanying text and should sit at body weight. Use Strong when Label is the headline of a Field — above an Input, Select, or other valued control — so it reads heavier than the value inside the control. Do not mix weights within a single Field group.
- **One Label per control.** Do not combine multiple control names into a single Label. If two controls share semantic purpose (first name + last name), use a section heading above them and separate Labels for each.

---

## Content

- **Sentence case, no trailing punctuation.** "Email address" not "Email Address" and not "Email address:". The colon is a legacy form convention that adds visual noise without clarifying meaning; sentence case matches the rest of the Fluent text system.
- **Concise nouns, not prompts.** "Email address" not "Please enter your email address". The Label names the control; the placeholder or helper text provides instruction if needed.
- **Avoid abbreviations unless they are domain-standard.** "Phone number" not "Phone no." Domain-standard abbreviations ("ZIP code", "ID") are acceptable when the audience expects them.
- **Match the visible label to the accessible name.** If the visible Label says "Email address", the programmatic accessible name must use that same string — never substitute a shortened form like "Email" for the accessible name while showing "Email address" visually (or vice versa).
