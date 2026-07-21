---
component: Interaction Tag
---

# Interaction Tag Usage

## When to Use

- To represent a person, category, or entity that the user can interact with — clicking the primary area performs a context-dependent action (e.g., opening a person card, navigating to a profile, showing details in a popover).
- In filter bars or tag lists where tags need both a primary action (inspect/navigate) and a secondary dismiss action (remove the filter).
- When tags represent people and clicking should reveal more information (person card, email, presence status).

### vs Tag

Tag is a single-action dismiss-only element — clicking anywhere removes it. Use Tag when the tag's only interaction is removal. Use Interaction Tag when the tag needs a primary action (open, navigate, inspect) in addition to or independent of dismiss.

### vs Button

Button triggers a discrete action or toggles a toolbar state. Interaction Tag represents content (a person, keyword, or filter) that can be inspected or removed. Use Interaction Tag when the element _is_ content with associated actions; use Button when the element _performs_ an action.

---

## Behavior

- **Primary action must directly relate to the tagged object.** Don't include actions that may be irrelevant or disruptive to the task at hand (e.g., don't open an unrelated settings panel from a person tag).
- **Don't use media together with icon on one Interaction Tag.** Leading content is either an icon OR an Avatar, never both — mixing creates visual noise and unclear hierarchy.
- **Dismiss removes the tag from the collection.** The secondary action always removes the Interaction Tag — it does not toggle, hide, or perform any other action.

> **Icon style:** All icons (leading and dismiss) use the **Regular** style. There is no Filled icon variant. Avatar instances use the appropriate size variant (16px for Small, 20px for Medium).

---

## Style

- **Secondary is the default.** Use it as the standard interactive tag, suitable for most scenarios — including dense filter bars where heavy fills would add too much weight.
- **Use Primary for high-emphasis tags** where the interactive tag is central to the scenario.
- **Don't mix Style as a semantic signal.** Primary vs Secondary communicates emphasis only, not category, status, or selection.
- **Align Style with neighboring Tags.** When Interaction Tags and Tags share a context, match their Style so the surfaces read as one family.

---

## Layout

- **Never mix icon sizes across sizes.** Small tags use 16px icons/avatars; Medium tags use 20px icons/avatars.
- **Align with Tag sizing.** When Interaction Tags appear alongside regular Tags in the same context (e.g., a mixed filter bar), use matching sizes so they share the same visual baseline.
- **Don't use Interaction Tag as a standalone action trigger.** If the element has no associated content identity (no person, category, or keyword it represents), use Button instead.
- **Limit leading content to one type.** A single Interaction Tag shows either an icon or an Avatar — never combine both because the small container cannot clearly communicate dual visual identities.

---

## Content

- **Label text should identify the tagged entity.** Use the person's name, the category label, or the keyword — not an action verb.
- **Keep labels concise.** One to three words. Truncate with ellipsis if the label exceeds the available width.
- **Sentence case.** Capitalize only the first word and proper nouns.
- **No trailing punctuation.** Labels are noun phrases, not sentences.

---

## Shape

- **Rounded is the default.** Use the size-based rounded-rect radius for standard interactive tags.
- **Use Circular for pill-shaped tags** when a softer, more compact look fits — e.g., contact chips or person pills. Circular applies `radius-circular` even with a visible label.
- **Icon only is always circular** regardless of the Shape setting.
