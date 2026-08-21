---
component: InfoLabel
---

# InfoLabel Usage

## When to Use

- To name a form control whose meaning is not self-evident from the label alone — when a definition, example, or rule needs to be one click away without crowding the form.
- To attach supplemental context (formatting requirements, examples, links to documentation) to a single control without consuming permanent space on the surface.
- To replace inline "(?)" or "Learn more" links that would otherwise compete with the label or the control's helper text.
- **Not as a generic icon + label pattern.** If the trailing element is decorative or static (a leading icon, a status dot, a tag), use Label and place the icon separately.
- **Not for required-field indication on its own.** Required state is a property of Label (the asterisk slot), not the InfoLabel trigger. The two compose, but the trigger must always open supplemental info, not signal required.

### vs Label

Label names a form control with persistent, programmatically associated text. InfoLabel is a Label with an extra affordance — a trigger that opens a Popover with supplemental help. Use Label whenever no supplemental info is needed; reach for InfoLabel only when there is real content to surface in the Popover. An InfoLabel with an empty or trivial Popover is worse than a plain Label — it adds a tab stop and an icon for no payoff.

### vs Tooltip on Label

Tooltip is non-interactive plain text that appears on hover or focus and disappears on blur. InfoLabel opens a Popover on click, persists until dismissed, and may contain interactive content (links, formatted text, examples). Use a Tooltip when the supplemental content is short, read-only, and only needed momentarily. Use InfoLabel when the content is structured, contains a link, or the user is likely to dwell on it.

### vs Helper text under the field

Helper text is always visible beneath the control and is the right place for short, always-relevant guidance ("Use 8+ characters"). InfoLabel hides longer or optional context behind a trigger — appropriate when the explanation is dense (a definition, an example sentence, a policy link) and would crowd the form if shown inline. Use both together when needed: short helper text inline, longer context in the InfoLabel Popover.

### When NOT to Use

- Do not use InfoLabel to surface critical or required information. If the user must read it to complete the field, it belongs in helper text, a MessageBar, or a Dialog — not behind a trigger.
- Do not use InfoLabel on every label in a form. The trigger is an attention magnet; overusing it dulls its signal and adds visual clutter to the form. Reserve it for the controls that genuinely need it.
- Do not use InfoLabel as a navigation pattern. The Popover is for explaining the field at hand, not for branching the user to other tasks.

---

## Behavior

- **Mirror Disabled with the associated control.** When the associated control is disabled, set InfoLabel to Disabled too — the Label foreground shifts to disabled and the trigger becomes inactive. A Rest InfoLabel next to a Disabled control reads as a labeling bug and implies the supplemental info is actionable when the field is not.
- **Required and Disabled compose.** A Required + Disabled InfoLabel keeps the asterisk visible but in disabled foreground (per Label's rules). Required does not affect the trigger.
- **Open is one Popover at a time.** Closing one InfoLabel's Popover by opening another's is acceptable; rendering two open Popovers anchored to the same Field is not. Implementations should track the open InfoLabel at the surface or page level and dismiss any prior open instance when a new trigger is activated.
- **The Popover content is supplemental, not authoritative.** Do not duplicate the visible label inside the Popover, and do not put the form control's value or validation state there. The Popover explains the field; the field carries the data.
- **The trigger is not a tooltip target.** If sighted users need a short label for the trigger (e.g. "More information about email address"), use the trigger's `aria-label` and pair with a real Tooltip on the trigger if the surface convention is to tooltip icon-only buttons. The Popover is the destination of the click, not the substitute for the trigger's accessible name.

---

## Layout

- **Position the trigger after the Label text and Required asterisk, before any value or control.** The reading order is Label text → Required asterisk (when present, inside the Label) → trigger → control below. The trigger is part of the labeling cluster; it does not sit beside the control's input area.
- **Pair InfoLabel size with the associated control size 1:1.** Medium Input → Medium InfoLabel → Medium Label inside. Mismatched sizes break the visual hierarchy of the field.
- **Pick Weight by role, not by taste.** Use Regular when InfoLabel sits inline next to a self-contained control (Checkbox, Switch, Radio). Use Strong when InfoLabel is the headline of a Field — above an Input or Select. The rule is identical to Label's; InfoLabel adds no exception.
- **One InfoLabel per Field.** Do not pair two info triggers with a single control. If a control has more than one dimension of explanation, consolidate them inside the Popover content; the trigger is the single entry point.
- **Position the Popover to avoid covering the control.** When the Field is below the InfoLabel (Strong weight, Field layout), prefer placing the Popover above or to the side of the trigger so it does not obscure the Input the user is about to fill. Popover's runtime positioning logic handles viewport edges; the layout choice is which direction to prefer.

---

## Content

- **Sentence case, no trailing punctuation on the label string.** Same as Label — "Email address", not "Email Address" or "Email address:".
- **Popover content is full prose, not a label.** Inside the Popover, use full sentences, definite articles, and terminal punctuation. The Popover is a passage of explanation, not a second label.
- **Keep the Popover short and scannable.** Two to three sentences is the comfortable upper bound for most form contexts. If the explanation is longer, link out to documentation from inside the Popover rather than scrolling inside a small floating surface.
- **Link out for procedural content.** If the supplemental info is a how-to or a multi-step process, include a link inside the Popover ("Learn how to format phone numbers") rather than walking through the procedure in the Popover itself.
- **Match the visible label to the accessible name.** Same rule as Label — the visible label string is the accessible name; do not substitute a shorter form for assistive technology.
