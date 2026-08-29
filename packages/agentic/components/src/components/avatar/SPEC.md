---
name: avatar
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Avatar

## Scope

Avatar is a non-interactive identity marker. It renders exactly one image, icon, or initials presentation inside a circular React Native view, with optional active-ring styling. It does not open a profile, manage presence state, crop supplied image data, or compose a multi-avatar group.

## Public contract

`size` defaults to `40` and accepts `16`, `20`, `24`, `28`, `32`, `40`, `56`, or `120`. `activityRing` defaults to `false`. `root` is required; `image`, `icon`, and `initials` are optional slots. The resolved content mode uses image first, then initials, then icon. Icon mode renders a person icon by default. Initials mode defaults to `AB`, uppercases string or numeric content, trims whitespace, and limits output to one character at size `16` or two characters otherwise.

The root contains only the active content slot. Images are absolute-fill and use cover resizing. Icon and initials slots are centered; all content slots are decorative because the root owns any accessible identity. Supplying more than one content slot is accepted for compatibility, resolves through the documented priority, and issues a development warning.

The resolved state retains size, activity-ring value, content mode, theme state, and user root style. User style is applied last. Avatar has no interaction-state ownership.

### Requirements

- **AVT-001:** Resolve the allowed sizes, activity-ring default, content-mode precedence, icon fallback, and initials normalization.
- **AVT-002:** Render only the selected content slot in the circular root and retain user root style after component styles.
- **AVT-003:** Apply the size, content-mode, active-ring, icon, and initials token bindings documented in the companion.
- **AVT-004:** Make a labeled avatar informative and an unlabeled default avatar hidden from accessibility descendants.
- **AVT-005:** Add no interaction or focus behavior of its own and delegate
  those semantics to a containing control, while forwarding the broad root
  `ViewProps` surface.

## Platform behavior

An Avatar with `accessibilityLabel` is accessible with React Native image role; callers can also explicitly control `accessible`. Without an informative label, the default root is hidden from accessibility descendants. Its image, icon, and initials children are always hidden so identity is not announced twice.

Windows exposes an informative root as a UI Automation image; macOS exposes it as an AX image. Avatar adds no tab stop or `FocusVisual`, although a caller can opt the forwarded root into focus with `focusable`. The active ring uses React Native root outline properties and does not introduce a separate rendered child or change the requested width and height.

## Divergences from Flex

- `avatar-content-precedence` — **accepted.** Flex evidence treats the three content presentations as an authoring-time exclusive choice. FURN preserves a permissive slot API: image wins over initials and initials wins over icon, while development builds warn about multiple supplied modes.
- `avatar-focusable-prop-surface` — **deferred.** FURN forwards
  `focusable` through root `ViewProps` even though Avatar supplies no action or
  focus visual. Product code should keep an identity-only Avatar unfocusable.

## Conformance

| Requirement | Evidence                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| AVT-001     | `avatar.types.ts`, `useAvatar.ts`, `avatar.test.tsx`, `avatar.types.test.ts` |
| AVT-002     | `useAvatarStyles.ts`, `renderAvatar.tsx`, `avatar.test.tsx`                  |
| AVT-003     | `avatar.styles.ts`, `useAvatarStyles.ts`, `avatar.test.tsx`                  |
| AVT-004     | `useAvatar.ts`, `useAvatarStyles.ts`, `avatar.test.tsx`                      |
| AVT-005     | `avatar.types.ts`, `useAvatar.ts`, `avatar.stories.tsx`                      |
