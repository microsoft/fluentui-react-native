---
name: skeleton
platform: react-native (Windows, macOS)
description: Atomic non-interactive placeholder element that shows an animating bar in the shape of content while it loads. No variant axes and no states — sized and positioned per instance to match the incoming content.
argument-hint: "[e.g. 'what color does the bar use', 'reduced motion behavior']"
tokens: tokens.yaml
accessibility: accessibility.md
interaction: interaction.md
usage: usage.md
---

## Metadata

| Field | Value |
|-------|-------|
| Type | atomic |
| Component | Skeleton |

This spec covers the Skeleton component for React Native (Windows & macOS). React Native tokens are in `tokens.yaml`, React Native interaction guidance (animation, reduced motion) is in `interaction.md`, React Native accessibility guidance (ARIA, WCAG, screen reader) is in `accessibility.md`, and shared usage guidance is in `usage.md` — read the relevant companion file before answering.

Answer design questions directly — lead with rationale, then tokens. The most common misuse is reaching for Skeleton when the structure of the incoming content is not actually known — at that point the placeholder is lying about what is about to appear, and a Spinner or progress indicator is the more honest signal. Skeleton only earns its keep when its silhouette matches the layout that will replace it.

---

# Skeleton

## Spec

### Anatomy

1. **Bar** — single animating rectangular shape sized and shaped per instance to approximate one block of incoming content (a line of text, an avatar, a thumbnail, a media tile). A skeleton group is composed by placing multiple Bar instances side by side; this component covers a single Bar.

---

### Variants

Skeleton has no variant axes and no states. The component is a single animating shape that consumers resize and re-radius per instance to match the dimensions and shape of the content it stands in for.

**Why no variants:** Skeletons are not different things — they are the same thing at different sizes. Shape variation (text-line / avatar / card) is expressed by resizing the Bar and overriding its border radius on the instance, not by switching between named variants. There is no interactive surface, so the standard Rest / Hover / Pressed / Disabled axis does not apply; the bar exists in a single, always-loading visual state. Animation style is also fixed — a single Wave animation runs at rest and is removed entirely under the OS reduce-motion setting.
