---
component: Avatar
---

# Avatar Usage

## When to Use

- To represent a person, group, bot, or entity in a UI context.
- In conversation threads, comments, and participant lists to identify contributors.
- In assignment fields, people pickers, and profile headers to show the associated person or entity.

### When NOT to Use

- Do not use Avatar as an interactive control. If the surrounding context requires interaction (e.g., opening a profile card), the wrapper element owns the interactive role — the avatar itself is decorative or informative chrome.
- Do not use Avatar to represent an abstract concept, status, or category. Use an Icon for those — Avatar is reserved for identifiable people, groups, bots, or entities.
- Do not stack overlapping avatars manually inside this component. Avatar groups are a separate composed pattern.

---

## Behavior

- **The three display modes are mutually exclusive.** At runtime, show exactly one: Image if a photo is available, otherwise Icon or Initials based on entity type. Do not show a fallback icon alongside initials.
- **Avatar is non-interactive by default.** Do not apply `tabindex`, pointer events, or interactive ARIA roles directly to the avatar. If the surrounding context requires interaction, the wrapper element owns that behavior.
- **Activity ring scales with size.** Both the transparent offset and the brand stroke widen in step with the container — thin at size 16, thicker at size 120 — so the ring reads as a proportional emphasis rather than a fixed overlay.
- **Activity ring at small sizes.** At sizes 16, 20, 24, 28, 32, and 40, the activity ring stroke may be difficult to perceive. Supplement with a textual status indicator such as a tooltip when the ring is the sole presence signal.
- **Always use the Fluent Iconography Image icon as the default INSTANCE_SWAP value in Icon mode.** Never use placeholder frames, shapes, or custom vectors in the icon slot.

---

## Layout

- **Size 16** — use for inline contexts where the avatar is a supporting detail: mentions, compact chips, message timestamps. At 16px, identity cues compress across all three modes: photos lose facial detail, icons read only if simple and high-contrast (default person icon works; multi-stroke entity icons may not), initials are limited to one character in caption type, and the activity ring stroke is thin and may fall below the perceptual threshold. Treat 16 as a supporting detail alongside adjacent text, not as the primary identifier.
- **Size 20** — use when 16 reads too small but 28 introduces too much vertical weight: compact toolbars, tight status rows, and inline contexts that still need a perceptible identity cue. Initials fit 1–2 characters at caption type — kept small to preserve the dense feel. The activity ring stroke is thin and is still difficult to perceive — supplement with a textual status cue when the ring is the sole presence signal.
- **Size 24** — use when 20 reads too small but 28 introduces too much vertical weight: compact toolbars, tight list cells, and status strips. Initials fit 1–2 characters at caption type — kept small to preserve the dense feel. The activity ring stroke is thin and is still difficult to perceive — supplement with a textual status cue when the ring is the sole presence signal.
- **Sizes 28 and 32** — use for compact rows where the avatar still needs to read as identity rather than ornament: condensed participant rosters, input chips, dense list cells. 28 sits a hair larger than the dense scale; 32 fits cleanly inside a one-line row alongside body-medium text.
- **Size 40** — default for most surfaces. Use in comment threads, assignment rows, and any context where the avatar shares vertical space with body text.
- **Size 56** — use for higher-emphasis identity moments: profile cards, people pickers, detail views.
- **Size 120** — use sparingly for hero moments: large profile views, about pages, onboarding flows. One per focal surface is the intended use.
- **Avatar groups** (multiple overlapping avatars) are a separate composed pattern and are not covered by this component.

---

## Content

- **Initials:** Use 1–2 uppercase characters. For a person, use first and last initial (e.g., "LM"). For a group or entity, use up to 2 characters from the entity name. Do not use lowercase or punctuation. At size 16, limit to a single character — two letters feel tight inside the 16px container and compromise legibility. At size 20, two characters fit but read tight; prefer a single character when the surface is dense.
- **Icon:** Default to the Image icon (Fluent Iconography). Swap for a more specific entity icon only when the entity type is consistently recognizable by that icon (e.g., a bot icon for automated agents, a group icon for shared mailboxes).
- **Image:** The photo should crop closely to the person's face or the entity's primary visual mark. Avoid padding or whitespace around the subject inside the circular container.
- **Always use the functional type ramp for Initials.** Avatars are UI chrome — the content ramp is reserved for editorial and AI-generated content.
