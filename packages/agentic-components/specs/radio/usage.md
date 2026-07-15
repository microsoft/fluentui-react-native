---
component: Radio
---

# Radio Usage

## When to Use

- To let people select exactly one option from a small, fixed set of mutually exclusive choices.
- In forms, settings, and preference panels where the available options are visible at a glance and benefit from being compared side-by-side.
- When the choice requires a submission step before the selection takes effect.

### vs Checkbox

Radio restricts a group to exactly one selected option — choices are mutually exclusive. Checkbox allows zero, one, or many selections within a group. Use Radio when only one answer is valid; use Checkbox when options are independent.

### vs Switch

Radio is a deferred-action selection within a group of options — changes typically take effect after a submission step. Switch is a single immediate-effect toggle for a binary on/off setting. Use Radio when someone is choosing between alternatives; use Switch when someone is turning one thing on or off live.

---

## Behavior

- **Always place Radios inside a RadioGroup of two to five.** A single Radio cannot be unselected by the person using it, and Radio depends on its parent for selection coordination, accessible group name, and focus coordination — see `flex-components:radio-group`. If only one option is meaningful, use Checkbox or Switch instead.
- **Always include a label.** Radio cannot be rendered without a visible label — the composed `flex-components:label` sub-component is a required part of the anatomy, not an optional slot. The label is what tells someone what they are selecting; the indicator alone is not enough.
- **Never use Radio for immediate-effect choices.** Radio implies a deferred action with a submission step. For live toggles, use Switch; for filter-style selection that applies on click, consider Tag or a segmented control pattern.
- **Never override the label foreground shift.** The secondary-to-primary label color change between Unselected and Selected is intentional — it de-emphasizes non-active options and draws attention to the chosen one.
- **Never use Disabled to represent Unselected.** Disabled means the option is unavailable in this context. Unselected means the option exists and can be chosen.
- **Allow one Radio to be Selected at any time within a RadioGroup.** Selecting another Radio in the same RadioGroup must deselect the previously selected one — never let two Radios in the same RadioGroup be Selected simultaneously. (This coordination is owned by RadioGroup, not by individual Radios.)

---

## Layout

- **Group-level layout is owned by RadioGroup.** Orientation (Vertical/Horizontal), inter-option spacing, and group-cohesion rules live in `flex-components:radio-group` — see its `usage.md` Layout section. Radio itself owns only the indicator-to-label spacing rule below.
- **Never add padding between the indicator and label.** The `gap` token controls indicator-to-label spacing. Padding belongs on the label wrapper's outer edges (horizontal end and vertical) — not on the start edge adjacent to the indicator.

---

## Content

- **Write labels as short, parallel noun phrases or sentences.** Each option in a group should follow the same grammatical structure so the choices read as comparable alternatives.
- **Use sentence case.** Capitalize the first word; do not use title case or all caps.
- **Avoid trailing punctuation** unless the label is a full sentence.
- **Keep labels concise.** If an option needs more explanation, use the secondary text slot to provide a brief description beneath the label. Keep the secondary text to one or two short sentences — if more context is needed, consider a tooltip or external help link instead.
