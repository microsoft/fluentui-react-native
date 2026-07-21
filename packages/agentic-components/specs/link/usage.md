---
component: Link
---

# Link Usage

## When to Use

- To navigate the user to another location — a route within the app, an anchor within the page, or an external URL.
- To open a destination in a new tab or window — pair with the Open trailing icon and an explicit "(opens in new tab)" cue.
- To present navigation cues in a list, footer, or panel where the surrounding context implies interactivity.

### vs Button

A Link navigates; a Button acts. Use Link when the user is leaving their current context for another destination (a URL, route, or anchor). Use Button — typically the Subtle or Outline styles when low emphasis is needed — when the control mutates state, submits a form, opens a dialog, or triggers any non-navigation action. Visual similarity (a Subtle Button can look text-like) does not change the semantic distinction: if the underlying element should render as `<a href>`, it is a Link; if it should render as `<button>`, it is a Button.

---

## Behavior

- **Never use Link to trigger non-navigation actions.** A Link must resolve to a URL (route, anchor, or external destination). For actions, use a Subtle or Outline Button — even when the visual treatment looks similar, the semantics must match the underlying element.
- **Always pair "opens in new tab" links with the Open trailing icon.** Users cannot detect new-tab behavior from the link text or color alone. The icon is the visual cue; the accessible-name supplement ("opens in new tab") is the screen reader cue. Both are required when behavior diverges from same-window navigation.
- **Always set Inline=true for any link that appears within a run of body text.** Color alone is not sufficient to distinguish a link from surrounding prose. The Inline=true variant restores the underline at Rest, satisfying the "two visual indicators" rule.
- **Never apply the Subtle Button visual to a navigation target.** A Subtle Button that navigates is a Link rendered as a `<button>` — this breaks right-click behavior, middle-click, copy-link, and assistive technology's link-list view.

---

## Layout

- **Match Type set to surrounding surface.** A Functional link belongs in functional surfaces (toolbars, nav, dialogs, panels); a Content link belongs in content surfaces (articles, marketing pages, editorial). Mixing produces a typographic mismatch that reads as a bug.
- **Inline links inherit the parent text style.** A link inside a paragraph-large paragraph must render at paragraph-large — do not lock standalone defaults onto inline links.
- **Provide adequate spacing between adjacent standalone links.** When a column or row presents multiple links, the vertical or horizontal gap must be large enough to prevent accidental activation. The component does not enforce this — the parent layout does.

---

## Content

- **Write link text that is meaningful in isolation.** Assistive technology presents links as a flat list, stripped from surrounding context. "Click here" and "Learn more" alone fail this; "View the 2026 fiscal report" succeeds. When the link text must remain short for layout reasons, supplement with an `aria-label` that describes the destination.
- **Use sentence case.** Capitalize only the first word and proper nouns. Title case in link text reads as a heading.
- **Avoid raw URLs in body text.** "Read the documentation" is preferable to "Read it at https://example.com." If the URL itself is the content (a citation, a code reference), use the Content type set and the dotted underline to mark it visually.
- **Never include trailing punctuation inside the link.** A period at the end of a sentence belongs outside the link's hit target so it is not announced by screen readers as part of the link name.
