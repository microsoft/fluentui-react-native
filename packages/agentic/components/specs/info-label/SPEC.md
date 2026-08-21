---
name: info-label
platform: react-native (Windows, macOS)
description: Composed form-field labeling element that pairs a Label with a trailing icon-only Subtle Button trigger that opens a Popover containing supplemental help, examples, or links. Covers two weights (Regular, Strong), three sizes, the Required asterisk slot, an Open toggle for the Popover, and a Disabled visual state that mirrors the associated control.
argument-hint: "[variant axis or behavior question, e.g. 'trigger sizing per Size' or 'aria-expanded pattern']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field     | Value     |
| --------- | --------- |
| Type      | composed  |
| Component | InfoLabel |

This spec covers the InfoLabel component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

InfoLabel is a Label with a trailing affordance for supplemental information — it is not a generic "icon + label" cluster. Reach for it only when a control needs more explanation than a Label or placeholder can convey, and the explanation is too long or too structured for a Tooltip. The most common misuse is using InfoLabel for any decorative icon next to a label — if the icon does not open a Popover with supplemental help, use Label and place the icon elsewhere. The second most common misuse is putting critical or required information inside the Popover; if a user must read it to complete the task, surface it inline (helper text, MessageBar), not behind a trigger.

Answer design questions directly — lead with rationale, then tokens. InfoLabel is a composition: it delegates all type, color, and gap behavior to the underlying Label, all trigger interaction and focus behavior to the underlying Button, and all surface and dismissal behavior to the underlying Popover. Its own concerns are the gap between Label and trigger, the trigger size mapping per InfoLabel Size, and the Open ↔ trigger `aria-expanded` relationship.

---

# InfoLabel

## Spec

## Dependencies

- **Label** (`flex-components:label`) — provides the visible label text, the Weight axis (Regular/Strong), the Size axis, the Required asterisk slot, and the Disabled foreground. InfoLabel forwards its Weight, Size, and State directly to this Label and exposes the Required boolean as a pass-through property.
- **Button** (`flex-components:button`) — supplies the trailing info trigger. InfoLabel uses **Subtle / Icon only**, with a per-Size child-button mapping (see `tokens.yaml → sizes`). Button owns all trigger states (Rest, Hover, Pressed, Focus, Disabled), the universal dual-outline focus ring, and the Enter/Space activation handling.
- **Popover** (`flex-components:popover`) — surface that opens on trigger activation. Popover owns the floating surface tokens (surface fill, radius, shadow, padding), the optional arrow, runtime positioning, light-dismiss, and Escape-to-close. InfoLabel does not override any Popover token; it only controls the Open boolean that toggles visibility.

---

### Anatomy

1. **Root** — horizontal auto-layout container (the labeling cluster). Owns the gap between the Label and the trigger Button. The Popover is a child of this root but is **absolutely positioned** outside the auto-layout flow — it does not contribute to the root's height or width.
2. **Label** — instance of the Label component. Carries the Weight, Size, State, and Required boolean.
3. **Info trigger** — instance of Button (Subtle, Icon only). Bound to the **Info icon** instance-swap (default: Fluent Iconography Info, Regular theme). Carries `aria-expanded`, `aria-controls`, and `aria-haspopup="dialog"` at the implementation layer.
4. **Popover** — instance of the Popover component. Rendered only when **Open=True**. Absolutely positioned **above** the trigger Button (not in the auto-layout flow below it). The Popover's arrow is centered on the trigger's horizontal midpoint. Its content slot is bound to the **Popover content** instance-swap.

| Slot               | Required             | Default                                                                                                                                                 |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label              | Yes                  | "Label"                                                                                                                                                 |
| Required indicator | No                   | Hidden — forwarded to the Label's Required boolean                                                                                                      |
| Info trigger       | Yes                  | Info icon (Regular)                                                                                                                                     |
| Popover content    | Yes (when Open=True) | Content placeholder                                                                                                                                     |
| Popover arrow      | No                   | Visible by default when Open=True — arrow points down toward the trigger, centered on the trigger's horizontal midpoint. Can be hidden by the consumer. |

> **Trigger is not a state of Label.** The info trigger is a separate, independently focusable element — not a decoration inside the Label. The Label's `for` attribute still points at the associated form control; the trigger has its own keyboard tab stop and `aria-controls` pointing at the Popover.

> **Popover does not affect the InfoLabel cluster's dimensions.** The Popover floats above the label–trigger row without pushing the cluster downward, and the arrow tracks the trigger's center regardless of label text length. Positioning, viewport-clamping, and flip behavior are managed at runtime by Popover's own positioning logic.

---

### Variants

Variant properties are ordered in the design tool: **Weight → Size → State**.

#### Weight

| Value                 | Description                             | When to Use                                                                                                                                           |
| --------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Regular (Default)** | Forwards to Label Regular — body weight | Inline-control labeling next to Checkbox, Switch, or Radio where the label reads as accompanying text                                                 |
| **Strong**            | Forwards to Label Strong — semibold     | Field labels above Input, Select, or other valued controls where the label needs semibold emphasis to differentiate from the value inside the control |

**Why mirror Label's Weight axis:** InfoLabel is a Label with an extra affordance — not a different labeling primitive. Mirroring Weight 1:1 keeps composition predictable: a Field built with Strong Label and Strong InfoLabel reads identically except for the trailing trigger.

#### Size

| Value                | Description                                  | When to Use                                                             |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| **Small**            | Label Small + Button Small Icon only Subtle  | Dense surfaces: toolbars, data-table inline labels, compact forms       |
| **Medium (Default)** | Label Medium + Button Small Icon only Subtle | Default for most form contexts                                          |
| **Large**            | Label Large + Button Medium Icon only Subtle | High-touch forms, settings pages, contexts requiring larger tap targets |

**Why Large uses Button Medium:** Small and Medium InfoLabel use Button Small (24×24, 16px icon) — the 24×24 target satisfies WCAG 2.5.8 and keeps the trigger compact relative to the label. Large steps up to Button Medium (32×32, 20px icon) so the trigger scales with the larger label text; a 16px icon beside Large body text reads as visually undersized.

#### State

| Value        | Description                                                                                         | When to Use                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Rest**     | Label foreground primary; trigger inherits Button Subtle states (Rest/Hover/Pressed/Focus)          | Default — associated control is interactive and supplemental info is available on demand |
| **Disabled** | Label foreground disabled; trigger inherits Button Disabled (no hover/pressed/focus, no activation) | Associated control is disabled — both Label and trigger mirror the disabled affordance   |

**Why InfoLabel does not author Hover/Pressed/Focus directly:** Those states belong to the trigger Button. The Label is non-interactive and the Popover surface is passive; only the Button is a tab stop. Authoring Hover/Pressed on InfoLabel would duplicate Button's state model and create a second source of truth.

#### Open (boolean property, not a variant axis)

`Open` is a **boolean component property** that controls Popover visibility — it is not a variant axis. When `Open=False` the Popover is hidden; when `Open=True` the Popover floats above the trigger with the arrow pointing down toward the trigger's center.

| Value               | Description                                                                         | When to Use                                                                |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **False (Default)** | Popover hidden; trigger carries `aria-expanded="false"`                             | Default — the user has not requested the supplemental info                 |
| **True**            | Popover visible, floating above the trigger; trigger carries `aria-expanded="true"` | The user has activated the trigger and is reading the supplemental content |

**When State=Disabled, Open should always be False.** The trigger cannot be activated when disabled, so the Popover should never be shown. The Figma property does not enforce this automatically — it is a design and implementation constraint.

**Why Open is a boolean property, not a variant axis:** Showing/hiding the Popover is a pure visibility toggle with no structural change to the labeling cluster. Encoding it as a variant would double the component set size (12 → 24 variants) without adding any token or layout information. Designers toggle `Open=true` on the canvas to preview the active state of a Field-with-help; the Popover floats above the cluster, arrow centered on the trigger, without affecting the cluster's footprint.

> **Required is a slot, not a state.** The Required asterisk visibility is controlled by a boolean property that forwards directly to the Label's Required boolean. Required composes independently of Weight, Size, State, and Open. When State=Disabled, the asterisk drops danger color and inherits disabled foreground per Label's own rules.
