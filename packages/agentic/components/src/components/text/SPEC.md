---
name: text
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Text

## Scope

Text is the theme-aware primitive for displaying textual content in the agentic
component library. Web-authored component contracts rely on inherited CSS
typography, while React Native only inherits text styles within a native text
subtree. Text establishes the library's functional body typography and primary
foreground color at that boundary.

Text deliberately preserves the React Native Text prop surface. It does not add
variants, aliases, truncation policy, press handling, or Dynamic Type
calculations that would compete with native behavior or component-owned
typography.

## Public contract

### Theme defaults

**TXT-001:** Text MUST resolve its default font family, size, line height,
weight, and foreground color from the nearest Flex theme.

**TXT-002:** Caller-provided style MUST follow the theme defaults so every
native text style remains directly overridable.

### Native behavior and composition

**TXT-003:** Text MUST delegate React Native Text props, accessibility,
interaction, text layout, and nested native-text behavior without normalization.

**TXT-004:** Text MUST use phased rendering and return its stable native root
slot as the continuation so required component slots can flatten it without a
wrapper or per-render continuation allocation. Required and optional slots MUST
preserve shorthand and default children.

**TXT-005:** Text MUST accept its native root ref as an ordinary React 19 prop
and forward that ref to the native Text instance without `forwardRef`.

### Styling ownership

Component-owned text slots MAY apply typography and state styles after Text's
defaults. Nested Agentic Text instances establish a new default boundary;
strings and raw React Native Text descendants inherit from the nearest native
text ancestor.

## Platform behavior

The same token bindings and native prop contract apply on Windows and macOS.
The active React Native platform implementation remains responsible for text
measurement, font fallback, scaling, selection, truncation, press events, and
accessibility exposure.

## Divergences from Flex

- `text-local-foundation-source` (`accepted`) - Flex web component skills do not
  define a styled Text component because CSS inheritance supplies this
  behavior. The React Native component is therefore governed by the local
  foundation contract and cited platform evidence rather than a fabricated
  Flex component source.
- `text-native-only-api` (`accepted`) - Text exposes native Text props and
  theme defaults, not the expanded variants and convenience props of Fluent UI
  React Native Text V1.
- `text-nested-default-boundary` (`accepted`) - Each Agentic Text instance
  reapplies theme defaults because React Native's private text-ancestor context
  is not a supported public API.

## Conformance

The contract is implemented and reviewed against React Native 0.81 Text
behavior, the repository Text V1 precedent, the Flex token map, unit and type
tests, and the component stories.
