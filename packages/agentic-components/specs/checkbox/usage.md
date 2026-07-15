---
component: Checkbox
---

# Checkbox Usage

## When to Use

- To let people select one or more options from a group.
- To toggle a single option on or off within a form that requires explicit submission.
- In settings panels, filters, and preference lists where multi-selection is expected.

### vs Switch

Checkbox requires a submission step (e.g. a save or apply button) before changes take effect. Switch triggers an immediate state change. Use Checkbox in forms and batch operations; use Switch for live toggles like enabling a feature.

### vs Radio

Radio restricts selection to exactly one option within a group. Checkbox allows zero, one, or many selections. Use Radio when options are mutually exclusive; use Checkbox when options are independent.

---

## Behavior

- **Always associate a label with the checkbox.** Every checkbox must have an identifiable name — whether a visible label or a programmatic association.
- **Never use Checkbox for immediate-effect toggles.** Checkbox implies a deferred action with a submission step. Use Switch for live toggles.
- **Always use the Indeterminate status for parent checkboxes in a group.** When some but not all children are checked, the parent must reflect the mixed state — do not show it as Checked or Unchecked.
- **Never override the label foreground shift.** The secondary-to-primary label color change between Unchecked and Checked is intentional — it de-emphasizes unselected options and draws attention to selected ones.
- **Never use Disabled to represent Unchecked.** Disabled means the control is unavailable. Unchecked means the option exists but is not selected.
- **Always apply the correct radius token per Style.** Standard uses `--gnrc-border-radius-base-100`; Circular uses `--gnrc-border-radius-circular`. Do not hardcode pixel values.

---

## Layout

- **Never add padding between the indicator and label.** The `gap` token controls indicator-to-label spacing. Padding belongs on the label wrapper's outer edges (horizontal end and vertical) — not on the start edge adjacent to the indicator.
