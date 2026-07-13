---
name: link
platform: react-native (Windows, macOS)
description: Atomic interactive text element for navigation within or between experiences. Covers Type set (Functional vs Content with plain or dotted underline), Inline behavior, and optional trailing icon for new-tab affordance.
argument-hint: "[variant axis or token question, e.g. 'Content type set underline style' or 'when to use Link vs Button']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Link |

This spec covers the Link component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (keyboard, focus, animation) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for Link when Button is correct — Link triggers navigation (changes location or opens a destination), Button triggers an action (mutates state, submits, opens an overlay). The second most common misuse is omitting the underline on an Inline link: Link uses the same color as surrounding body text (`--gnrc-color-foreground-neutral-primary`), so the underline is the *only* visual affordance. Inline=true keeps it persistent; Inline=false defers it to Hover/Pressed/Focus and assumes surrounding context (whitespace, list grouping, or a navigation landmark) supplies the affordance at rest.

---

# Link

## Spec

### Anatomy

1. **Container** — auto-layout root frame; owns gap between label and trailing icon. No background fill; no border. Underline is applied to the Label, not the container.
2. **Label** — text node bound to the `Label string` component property. Carries the underline (style determined by Type set: solid for Functional, dotted for Content). Color follows the foreground token.
3. **Icon** — optional Fluent Iconography instance, trailing the label. Hidden by default. Most common use is the Open icon to signal "opens in a new tab/window."

| Slot | Required | Default |
|------|----------|---------|
| Label | Yes | "Link" |
| Icon | No | Hidden |

> **Underline is a property of the Label, not the Container.** The underline must hug the text baseline and break with the text on wrap. The Container provides only the layout shell and gap between label and trailing icon.

---

### Variants

Variant properties are ordered in the design tool: **Type set → Inline → State**.

#### Type set

| Value | Description | When to Use |
|-------|-------------|-------------|
| **Functional** | Links rendered in functional typography (Segoe UI / SF Pro family) with a **solid** underline. | UI chrome, navigation, controls, and any link in a functional surface (nav bars, footers, panels). |
| **Content** | Links rendered in content typography (Segoe Sans / SF Pro family) with a **dotted** underline. | Body copy, editorial articles, long-form reading. The dotted underline is a content-set convention that visually distinguishes links from body text without competing with the prose. |

**Why Content uses a dotted underline:** Content links live inside long-form prose where the reader's primary goal is uninterrupted reading. A solid underline visually bisects every linked phrase and pulls the eye away from surrounding text; a dotted underline preserves the affordance with much less visual weight, so the link is still recognizable but the reading rhythm is not broken. Functional links live in UI chrome where reading rhythm is not the priority and a solid underline reads as a clearer affordance against control-dense surfaces. The two underline styles encode the same affordance for two different reading contexts.

#### Inline

| Value | Description | When to Use |
|-------|-------------|-------------|
| **True** | Underline visible at Rest (and across Hover, Pressed, Focus). | The link sits within a paragraph, sentence, or run of body text where color alone would not distinguish it from surrounding prose. |
| **False** | Underline visible only on Hover, Pressed, and Focus — not at Rest. | The link is a standalone control with surrounding whitespace (a list of links, a footer column, a panel of named navigation cues) where the link is the dominant interactive element and the surrounding context already implies interactivity. |

**Why Inline=True requires the underline at Rest:** WCAG and Fluent require **at least two visual indicators** that a piece of text is interactive. For standalone links, color + isolation in whitespace is enough. For inline links inside body text, color alone fails this requirement when text-color contrast against surrounding prose is the only differentiator — the underline provides the required second indicator.

> **Figma note: Inline links use text styles, not the component.** In Figma, Inline=true links are not built as instances of the Link component. To solve Figma's span limitations, they are applied via the `Functional/Links/*` and `Content/Links/*` text styles, which encode the underline style, thickness, and offset. The Link component in Figma covers only standalone links (Inline=false). In code, both modes remain part of the same Link component, differentiated by the `Inline` prop.

#### State

| Value | Description |
|-------|-------------|
| **Rest** | Default. Underline visibility follows the Inline axis: visible for Inline=True, hidden for Inline=False. Foreground uses `--gnrc-color-foreground-neutral-primary`. |
| **Hover** | Foreground uses the inline hover value from `tokens.yaml`. Underline becomes visible — even when Inline=False — so the affordance is unambiguous under the pointer. |
| **Pressed** | Foreground uses the inline pressed value from `tokens.yaml`. Underline remains visible. |
| **Visited** | Semantic state that is visually identical to Rest. Enumerated so implementations can target the `:visited` pseudo-class explicitly without falling back to default platform styling. No tokens differ from Rest. |
| **Disabled** | Foreground drops to `--gnrc-color-foreground-neutral-disabled`. Underline visibility follows the Inline axis. No background is introduced. |

> **Figma carve-out — Visited.** Visited is enumerated in `tokens.yaml` and in the code-side variant set, but is **intentionally excluded from the Figma variant set** because it renders identically to Rest. Reproducing it in Figma would double the picker depth on the State axis without adding any design information. Future regenerations of the Figma component should follow the same convention.
