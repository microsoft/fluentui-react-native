---
component: Card
---

# Card Usage

## When to Use

- Group related content and actions about a single subject (an entity, a document, a person, a result) into one bounded, scannable unit.
- Present a collection of peer items as a grid or feed, where each item shares the same internal structure.
- Surface a media preview (image, file thumbnail, chart) together with its title, metadata, and actions.

Do **not** use a Card merely to add a border or background to arbitrary content — that is a surface/section concern, not a card. A card implies a self-contained, repeatable unit of related content.

### vs Surface / Section

A Card is a *unit* — a repeatable, self-contained grouping of one subject's content. A plain surface or section is *page structure* — it organizes the layout but does not represent a single addressable thing. If the content isn't a discrete, repeatable item, use a section, not a card.

### vs Message Bar

Use a **Message Bar** for transient, page- or section-level status feedback. Use a **Card** for persistent content you group and act on. A card is content; a message bar is a notification about content.

---

## Behavior

- **Interactive vs static is a deliberate choice.** A card is clickable only when it has a single, obvious primary target (e.g. "open this item"). When the whole surface is clickable, the click must resolve to one destination — do not make a card clickable if it contains several equally-important actions.
- **Nested controls stay independent.** Action buttons within the card are real Buttons and must remain operable on their own, even inside a clickable card. The card's click target must not swallow their activation, and their hit areas must not overlap the card's. See `accessibility.md` for the nested-interactive pattern.
- **Selection is a set behavior.** Use the Selected state only when cards form a choosable set (pick-one or multi-select grid). A lone card has nothing to be selected against. Communicate selection with the programmatic state, not color alone (see `accessibility.md`), and keep a non-color cue so it survives color-blindness and high-contrast modes.
- **Padding = None is for media, not text.** Only collapse padding when Content is edge-to-edge media. Text that touches the card boundary is hard to read and breaks the grouping rhythm.
- **Disabled cards are rare.** Disable a card only when the entire unit is unavailable; if only one action is unavailable, disable that Button instead.

---

## Layout

- **One subject per card.** A card represents a single thing. If you are tempted to put two unrelated subjects in one card, use two cards.
- **Keep peer cards on one Size and Layout.** A grid or feed should use a consistent Size, Layout, and Direction across its cards so the collection reads as a set, not a patchwork.
- **Width is capped at 720px.** Cards do not stretch arbitrarily wide; beyond the cap, switch to a multi-column grid rather than one very wide card.
- **Horizontal cards need a reflow plan.** A Horizontal (side-by-side) card must collapse to a single stacked column at narrow viewports — otherwise it overflows. Pick Horizontal only where the layout has room to stack on small screens.
- **Density by Size.** Use Small in dense grids, sidebars, and feeds; use Large for primary or hero content where the card is the focus of the surface.

### Cards in a carousel

A carousel is a layout pattern for cards — a horizontally-scrolling row that pages through a set of peer cards. Reach for it when the collection is long *and* the off-screen items are genuinely optional; if every item matters, use a wrapping grid instead so nothing is hidden behind a paging action.

- **Two framings.** Let the cards scroll edge-to-edge (full-bleed) when each card already carries its own surface — a wrapping frame would double the boundary. Wrap the row in a bounded surface only when the items are bare media tiles that need a container to group them.
- **Uniform items.** Keep every card in the row on the same Size, Layout, and Direction so the set reads as one collection and paging lands cleanly.
- **Paging controls.** Provide Previous/Next controls that reflect position — disable Previous at the start and Next at the end rather than looping silently. The controls are the accessible path for non-touch input; touch swipe is an enhancement layered on top, never the only way to advance.
- **No silent auto-advance.** If the row advances on a timer, it must offer a visible pause control and honor reduced motion — because auto-motion that can't be stopped fails accessibility and pulls focus from reading.
- **Reflow.** A fixed-width scroller must scale down or become swipe-first at narrow viewports so items stay legible and the paging controls stay reachable, instead of shrinking below a usable size.

---

## Content

- **Title:** Write the title as a concise noun phrase — the name of the thing the card represents. Sentence case, no trailing punctuation. Allow it to wrap or truncate-with-tooltip rather than overflow (see `accessibility.md` → Typography overflow).
- **Metadata:** Keep secondary metadata (timestamps, status markers, counts) short and scannable; it is supporting context, not a second title.
- **Actions:** Label action Buttons with the action verb per `flex-components:button` content rules. Keep Footer actions to a small set; overflow extras into a "+N" affordance rather than crowding the row.
