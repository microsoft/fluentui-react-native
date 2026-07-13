---
name: menu-button
platform: react-native (Windows, macOS)
description: Molecular button that opens a Menu of action options. Composes a Button-styled trigger (always-present trailing chevron with Label and Leading icon BOOLEAN slot toggles) with a Menu overlay. Forwards Button's Style, Size, and State axes; collapses Button's Layout axis into the two slot Booleans on a single chrome set; exposes Open (false/true) coupled to State=Pressed. Triggers actions, not selections — selection lives in Dropdown.
argument-hint: "[variant axis or behavior question, e.g. 'Open=true tokens' or 'icon-only chevron behavior']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | molecular |
| Component | MenuButton |

This spec covers the MenuButton component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. MenuButton is a Button trigger plus a Menu overlay — actions, not selection. The most common misuse is reaching for MenuButton when Dropdown is correct; the distinction is whether the trigger opens a list of *actions* (MenuButton) or commits a *value* (Dropdown). See `usage.md` § vs Dropdown for the full differentiation.

---

# MenuButton

## Spec

### Dependencies

- **Button** (`flex-components:button`) — trigger chrome. MenuButton's trigger forwards Button's Style, Size, and State axes and inherits all of Button's container tokens (background, foreground, stroke, radius, padding, typography). Button's Layout axis is collapsed into two BOOLEAN slot toggles — `Label` and `Leading icon` — on a single chrome set; see § Slots. The Selected axis is not consumed.
- **Menu** (`flex-components:menu`) — overlay surface. Provides the popover container, MenuItem children, focus management on open, and dismissal on item activation. MenuButton attaches Menu to the trigger and drives the Open axis; all menu-internal tokens and behavior are inherited.

---

### Anatomy

1. **Trigger** — interactive `<button>` styled with Button's chrome. Owns Style/Size/State per the forwarded axes. The only directly-focusable element in MenuButton's Closed state.
2. **Leading icon slot** — Fluent Iconography instance preceding the label. Toggled by the `Leading icon` BOOLEAN (default `false`). Matches Button's icon size per Size axis.
3. **Label** — text node bound to the trigger's `Label string` property. Toggled by the `Label` BOOLEAN (default `true`). Suppressing both Label and Leading icon leaves a chevron-only trigger — Figma allows it, but designers should keep at least one slot on.
4. **Trailing chevron** — Fluent Iconography ChevronDown instance. Always present regardless of slot Booleans — never suppressed and not exposed as a swappable property. Static across Open — does not rotate or swap when the Menu mounts. Renders at the label's foreground color tier (currentColor). Size matches the Size axis.
5. **Menu surface** — `flex-components:menu` instance, anchored to the trigger and mounted when Open=true (which is valid only on the Pressed row). Provides surface fill, stroke, radius, shadow, elevation, and item layout. **The Menu surface never renders MenuItem Style=Section Header rows** — MenuButton's contract is a flat list of actions, and subheaders add visual noise to that read; composers should compose only Style=List Item rows inside the Menu.
6. **Menu items** — `flex-components:menu-item` instances composed inside the Menu's Content Slot at the call site. MenuButton does not expose item content as Figma properties.

| Slot | Required | Default |
|------|----------|---------|
| Trigger | Yes | — |
| Leading icon slot | When `Leading icon=true` | Hidden (default `false`) |
| Label | When `Label=true` | "Label" (default `true`) |
| Trailing chevron | Yes (always) | ChevronDown (not swappable) |
| Menu surface | Yes (Pressed × Open=true only; no Section Header rows) | — |
| Menu items | Yes (Pressed × Open=true only) | — |

> **No Selected axis:** MenuButton triggers a Menu of actions, not a toggle. If a control needs both menu-opening and a toggled state, model the toggle separately (often as a sibling Button) rather than overloading the trigger.

---

### Variants

Variant properties are ordered in the design tool: **Style → Size → State → Open**. `Label` and `Leading icon` are BOOLEAN component properties, not variant axes — see § Slots above.

#### Slots

`Label` and `Leading icon` toggle the corresponding anatomy slots at instance time. The trigger commits to a single chrome set per Size (rounded rectangle, base radius, Button's Icon-and-text padding and gap) regardless of which slots are on — the same shape renders icon+label+chevron, label+chevron, or icon+chevron.

**Why no Layout axis (Button has one):** Button uses Layout=Icon and text vs Icon only to differentiate a rectangular text-trigger from a circular icon-only trigger. MenuButton's trailing chevron is always present, so the icon-only combination already has a second element next to the icon and reads as a horizontal pill rather than a circle. Modelling the slot toggles as Booleans instead of a Layout axis avoids multiplying every other axis by 3× while still covering the same three rendering combinations — icon+label+chevron, label+chevron, icon+chevron — at one-third the variant count.

**Why one chrome set:** The trigger uses Button's "Icon and text" padding, gap, and radius tokens across every Label/Leading icon combination — the icon-only combo therefore renders as a rounded rectangle rather than the circular pill Button uses for its own Icon-only Layout. The trade-off is intentional: a single set of structural tokens means consumers can flip Label and Leading icon at runtime without the surrounding layout having to re-flow around a changing trigger shape.

**Why the chevron is never suppressed:** The chevron is the affordance that distinguishes a MenuButton from a plain icon Button. Even when the chosen icon strongly implies "more actions" (kebab, more, settings), dropping the chevron blurs the affordance — users have no consistent visual cue that activation opens something rather than firing a single action. The chevron is the contract of MenuButton; the label and leading icon are optional context. Because it is structural, MenuButton does not expose the chevron as a swappable property — it should always be ChevronDown.

**Why the chevron is a primary affordance (not a hint):** MenuButton's chevron renders at the label's color tier — the same currentColor that the label uses — distinct from Dropdown's chevron, which is intentionally desaturated to defer to the value text. Dropdown's chevron is a hint that "more is below" the value; MenuButton's chevron *is* the affordance. Treating it as primary keeps the trigger reading as a single visual unit and prevents the chevron from feeling decorative.

#### Style

| Value | When to Use |
|-------|-------------|
| **Primary** | A MenuButton that owns the single loudest action on a surface — rare; most MenuButtons are not the primary CTA. |
| **Secondary** | Default for most MenuButtons — visually grounded without dominating. |
| **Outline** | Containment with minimal fill weight — often alongside a Primary action. |
| **Subtle** | Low-emphasis triggers that sit quietly within a surface, alongside other Subtle controls. |

**Why forward all four styles from Button:** The MenuButton trigger is visually a Button — there is no design reason for it to use a different chrome system. Forwarding Button's Style axis keeps MenuButton interchangeable with Button in command bars, toolbars, and form footers.

#### Size

| Value | When to Use |
|-------|-------------|
| **Small** | Dense surfaces: toolbars, inline controls, data-table rows. Pairs with 16 px icons. |
| **Medium** | Default. General-purpose across all surfaces. Pairs with 20 px icons. |
| **Large** | High-touch surfaces, prominent CTAs, or contexts requiring larger tap targets. Pairs with 20 px icons. |

**Why forward all three sizes from Button:** Same rationale as Style — MenuButtons sit next to Buttons in command bars and toolbars and must match their density. Menu width and item row size are not affected by trigger size — the Menu renders at its own density regardless.

#### State

| Value | Applies | Visual |
|-------|---------|--------|
| **Rest** | Closed only | Default Button chrome per Style |
| **Hover** | Closed only | Background and foreground use the inline hover values from `tokens.yaml` |
| **Pressed** | Closed **and Open** | Activation moment — Menu mounts when Open=true here |
| **Focused** | Closed only | Universal dual-outline focus ring per `flex-system:styling` |
| **Disabled** | Closed only | Button disabled tokens; trigger not activatable |

**Why State forwards from Button rather than from Input:** MenuButton's trigger is a Button (it fires an action — opening the Menu). It uses Button's full state model — background and foreground both participate in hover and pressed, and focus is the universal dual-outline ring. Dropdown's trigger borrows Input's chrome (stroke-only, stroke-swap focus) because Dropdown is a value picker dressed as a form field; MenuButton is an action trigger dressed as a button.

**Why Open=true is coupled to State=Pressed:** Opening the Menu is the activation outcome, so it lives on the row that owns activation. Modelling Open=true on Rest, Hover, or Focused would document a runtime state (menu still open while the trigger sits in its passive form) — which the CSS layer already drives. Pinning Open=true to Pressed keeps the Figma variant focused on the design state that owns the affordance: the click that surfaces the Menu. Runtime code still drives the actual open/close transition; the Pressed × Open=true cell is the documentable design moment.

#### Open

| Value | Description |
|-------|-------------|
| **false** | Trigger is shown; Menu is not mounted. Default. Valid in every State. |
| **true** | Trigger remains visible; Menu is mounted and positioned relative to the trigger; DOM focus moves into the Menu (to the first MenuItem). Trigger chevron does not rotate or swap. **Valid only when State=Pressed** — see State § Why Open=true is coupled to State=Pressed. |

**Why Open is a variant axis rather than purely runtime:** Open=true is a documentable design state — designers need to specify the Menu surface tokens and the row that receives initial DOM focus. Modelling it as a Figma variant makes the Open state explicit (anchored to Pressed); runtime code still drives the actual open/close transition.
