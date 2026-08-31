---
component: RadioGroup
---

# RadioGroup Usage

## When to Use

- To present a small, fixed set of mutually exclusive options (two to five) and have someone pick exactly one.
- In forms, settings panels, and preference lists where every option should be visible at a glance and the choice takes effect after a submission step.
- When the options need a shared, programmatically-associated label that names the question being answered.

### vs Radio

Radio is the single-option molecular control — it's never used on its own. RadioGroup is the container that gives a set of Radios their shared label, their orientation, and their single-select coordination. Author UIs in terms of RadioGroup; reach for Radio only when you need to introspect or address a specific child option.

### vs Checkbox

RadioGroup restricts a set to exactly one selected option — choices are mutually exclusive. A group of Checkboxes allows zero, one, or many selections within the set. Use RadioGroup when only one answer is valid; use Checkbox (or a group of Checkboxes) when options are independent.

### vs Dropdown / Combobox

RadioGroup keeps every option visible so they can be compared side-by-side. A dropdown hides its options behind a trigger. Use RadioGroup when the option count is small (two to five) and comparison matters; switch to a dropdown when the option count exceeds five, when the options are well-known to the audience (country, currency), or when vertical space is the binding constraint.

---

## Behavior

- **Always contain two to five Radios.** A single Radio cannot be deselected once chosen, so a one-option group offers no real choice. Six or more options strain side-by-side comparison — use a dropdown or a list pattern instead. The two-to-five window is the band where RadioGroup is the right answer.
- **Always include a Legend.** RadioGroup must announce what is being chosen. The Legend can be visually hidden when surrounding context (a section heading, a form field label) makes it redundant, but it must always be programmatically associated with the group — otherwise assistive technology can announce "selected, not selected, not selected" without communicating what's being selected between.
- **Coordinate selection so exactly one Radio is Selected at a time.** When someone selects an option, deselect the previously selected sibling automatically. Two simultaneously-Selected Radios in the same group is invalid state, the same way zero-Selected is only valid before any choice has been made.
- **Never re-purpose Disabled to mean Unselected.** Disabled means the option is unavailable in this context. Unselected means the option exists and no one has picked it yet.
- **Disable options at the Radio level, not the group.** RadioGroup has no group-level Disabled state — when the whole group is unavailable, set each child Radio to Disabled. Per-Radio Disabled is also the right tool when only some options are unavailable.
- **Never apply a background fill or stroke to the RadioGroup surface.** RadioGroup is a transparent layout-and-coordination wrapper — visual weight comes from the Radio children and the Legend, not the container.

---

## Layout

- **Use Vertical orientation by default.** A vertical column makes options scannable and comparable, and the column reads naturally as a list of alternatives.
- **Reach for Horizontal only when option labels are short and space is tight.** Use Horizontal for two- or three-option groups whose labels are one or two words each (yes/no, low/medium/high). Long labels in a horizontal row create irregular hit targets and force horizontal scanning, both of which slow recognition.
- **Keep the Legend immediately above the options.** The Legend-to-options gap is tighter than the gap between this group and the next surrounding section — that hierarchy is what signals "this label belongs to this group."
- **Never separate Radios in the same group across distant sections.** Members of one RadioGroup must be visually adjacent — splitting them by an intervening heading, paragraph, or unrelated control breaks the ability to perceive the mutual exclusivity.
- **Never add per-Radio padding between options.** The gap between options is controlled by the `options-gap` token on the RadioGroup container; each Radio already includes transparent touch-target padding, so the visible breathing room is the sum of both.

---

## Content

- **Write the Legend as a short noun phrase or a direct question.** "Plan", "Notification frequency", "Choose your plan", "How often do you want to be notified?" all work. Avoid full sentences with trailing punctuation unless the Legend genuinely is a sentence.
- **Use sentence case for the Legend.** Capitalize the first word; don't use title case.
- **Match the Legend's grammar to the option grammar.** If the Legend is a question, write options as direct answers ("Daily", "Weekly", "Never"). If the Legend is a noun phrase, write options as parallel noun phrases. Mixing grammatical structures across the Legend and options reads as inconsistent.
- **Defer per-option label rules to Radio.** Length, parallelism, and sentence-case rules for the option labels themselves live in `flex-components:radio` usage — RadioGroup does not duplicate them.
