---
component: MenuButton
---

# MenuButton Usage

## When to Use

- To group multiple related actions behind a single trigger — "Insert", "Sort by", "New".
- When the trigger is — or stands in for — a **primary call to action**. Because the trigger carries full Button chrome (including Style=Primary), a MenuButton can be the main action of an experience while still fanning out to a short list of choices. This is the line against a bare kebab: a kebab is for low-weight overflow, never the primary action.
- When several related actions would crowd a surface if shown inline but still belong to one contextual command.
- As a create/add affordance — a leading "+" with the trailing chevron — that opens a short list of things to create (Layout=Icon only, or paired with a "New" label).

### When NOT to Use

- **Do not use for a single action.** If the trigger has one outcome, use a plain Button — the chevron implies "there is more" and is misleading without options behind it.
- **Do not use for value selection.** Picking one of N values is Dropdown's job. MenuButton's items fire actions; Dropdown's rows commit values.
- **Do not use for navigation between pages.** If "selecting" a row should change the route, use a nav component or link list, not a Menu.
- **Do not reach for it just to host an overflow menu.** A bare "More actions" / kebab affordance is *not* a primary call to action, so it doesn't need Button chrome — open a standalone Menu from a plain kebab icon instead. Reserve MenuButton for triggers that should read as a button and can stand in for a primary CTA. See § vs Menu (standalone).

### vs Button

Button fires one action. MenuButton opens a list of actions. The visible difference is the trailing chevron — it signals "activation opens something" rather than "activation does something". If you find yourself adding a popover to a Button, you want a MenuButton.

### vs Dropdown

Both pair a trigger with a popover containing a list. Dropdown commits *values* — rows behave as toggles, and Single mode closes on activation while updating the trigger's displayed value. MenuButton fires *actions* — rows execute and dismiss, and the trigger's label never changes to reflect "the chosen action". If the trigger should show the current state after activation, it's a Dropdown; if the trigger keeps its own label and the rows do work, it's a MenuButton. (The ARIA distinction between the two row models lives in `accessibility.md`.)

### vs Menu (standalone)

**MenuButton can surface a primary call to action; a standalone Menu generally cannot.** Because the trigger carries full Button chrome — including Style=Primary — a MenuButton can stand in for an equivalent primary CTA and act as the main action of an experience. A Menu opened from a non-button trigger (an icon, a right-click context, a keyboard shortcut) offers actions, but those actions are generally *not* the main action in an experience — the trigger is incidental, so it doesn't carry the visual weight that marks a primary CTA. Overflow is the textbook case: a "More actions" kebab is never the main action, so a bare icon opening a standalone Menu carries it — reaching for MenuButton's Button chrome there is overkill.

Menu can also be opened from a non-button trigger (an icon, a right-click context, a keyboard shortcut). MenuButton is the standard packaging when the trigger is a button-shaped affordance. Use Menu directly when the trigger is something other than a button-styled control; use MenuButton when the trigger should read as a button with the visual chrome (Style, Size, State) that implies.

---

## Behavior

- **The trigger's label never changes to reflect the chosen action.** Unlike Dropdown, MenuButton's label is the *category* of actions, not the last one taken. "Insert" stays "Insert" after the user picks "Insert image".
- **Always dismiss the Menu when an item is activated.** Action menus close on selection — persistent menus after an action confuse the interaction model. Submenus follow Menu's own rules.
- **Do not nest MenuButtons inside a MenuButton's item row.** A row that opens another action menu is a submenu — model it as a MenuItem with `has-submenu`, not as a nested MenuButton. Menu owns the submenu pattern.
- **Prefer hiding unavailable actions over rendering them Disabled.** Disabled items add noise without adding information. The exception: when the user needs to know the action *exists* but isn't currently allowed (permissions, state-dependent gating), Disabled with a tooltip explaining why is the right call.

---

## Layout

- **Match Style to siblings.** A MenuButton in a row of Secondary Buttons should be Secondary; a Subtle MenuButton next to Outline Buttons reads as a different control tier. Pick the Style from the surrounding context, not in isolation.
- **Match Size to the form's density tier.** Don't mix Medium Buttons with a Small MenuButton — pick a tier per surface.
- **Place at the end of action groups.** When a command bar mixes plain Buttons and a MenuButton, the MenuButton typically sits at the end of the group, gathering its related actions behind one trigger.
- **Give the Menu room to extend.** Menu width follows its widest MenuItem (not the trigger), so a trigger placed near the viewport edge may produce a Menu that flips or clips. Allow horizontal room below the trigger when laying out the surface.

---

## Content

- **Label is a noun or short verb phrase describing the category of actions.** "Insert", "Sort", "New" — not "Insert image" (that's the item, not the trigger).
- **Item labels skip the category prefix.** When the trigger label is a category like "New", the menu items should name the thing directly — "Message", "Event" — not "New message", "New event". The category is already implied by the trigger; repeating it doubles the cognitive load and clutters the list.
- **A single-action verb on the trigger means the affordance is wrong.** "Save", "Delete" read as Button labels; if you reach for one, you want a Button, not a MenuButton.
- **Trigger label conventions otherwise follow Button** — sentence case, functional type ramp. See `flex-components:button` § Content.
- **Item content lives in MenuItem** — see `flex-components:menu-item` for label, secondary content, icon, and chevron conventions.
