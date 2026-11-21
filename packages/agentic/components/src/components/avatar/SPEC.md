---
name: avatar
platform: react-native (Windows, macOS)
status: contract-reviewed
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Avatar

## Scope

Avatar is a non-interactive identity marker. It renders exactly one image, icon, or initials presentation inside a circular React Native view, with optional active-ring styling. It does not open a profile, manage presence state, crop supplied image data, or compose a multi-avatar group.

## Public contract

`size` defaults to `40` and accepts `16`, `20`, `24`, `28`, `32`, `40`, `56`, or `120`. `activityRing` defaults to `false`. Supply at most one of `image`, `initials`, or `icon`; omitting content uses the Person icon. An initials slot without supplied children uses `AB`. String or numeric initials are trimmed, uppercased, and limited to one character at size `16` or two characters otherwise.

The root contains a persistent decorative activity-ring visual and only the active content slot. Images are absolute-fill and use cover resizing. Icon and initials slots are centered; all content slots are decorative because the root owns any accessible identity. Untyped conflicting slot input still receives a development warning and resolves in the order image, initials, icon. Presence is always hidden and independent of `activityRing`; there is no presence prop until the dedicated PresenceBadge contract is approved.

The circular View centers the initials' intrinsic native line box. Avatar owns
all initials typography and uses native Text without an inherited body line
height or an em-sized line-height clamp, which can clip or displace glyphs.
Font-size tokens, native text scaling, and explicit caller line metrics are preserved.
The initials are an absolute child without edge offsets, so the smallest
avatar's padded frame cannot clamp that intrinsic line box during measurement.

The resolved state retains size, activity-ring value, content mode, theme state, and user root style. User style is applied last. Avatar has no interaction-state ownership.

### Requirements

- **AVT-001:** Resolve the allowed sizes, activity-ring default, mutually exclusive public content slots, icon fallback, and initials normalization.
- **AVT-002:** Render only the selected content slot in the circular root and retain user root style after component styles.
- **AVT-003:** Apply the size, content-mode, active-ring, icon, and initials token bindings documented in the companion.
- **AVT-004:** Make a labeled avatar informative and an unlabeled default avatar hidden from accessibility descendants.
- **AVT-005:** Add no interaction or focus behavior of its own and delegate
  those semantics to a containing control. The root does not accept `focusable`.
- **AVT-006:** Keep the activity ring mounted with its border configured from the
  first render, hide it through opacity when inactive, and avoid native outline
  properties. Its token-derived gap and stroke extend outside the avatar without
  changing layout, hit testing, or accessibility.

## Platform behavior

An Avatar with `accessibilityLabel` is accessible with React Native image role; callers can also explicitly control `accessible`. Without an informative label, the default root is hidden from accessibility descendants. Its image, icon, and initials children are always hidden so identity is not announced twice.

The informative root requests the native image role. Avatar adds no tab stop or focus feedback.

The activity ring reuses `FocusVisual` as a persistent decorative border, not as
a focus indicator. Its absolute edges are inset by the negative sum of the
activity-ring gap and stroke width. The same border remains configured when
inactive; only opacity changes. This avoids the native outline path that can
fail-fast in React Native Windows 0.81 Fabric on a background-filled avatar,
including when the initial render already requests an active ring.

## Divergences from Flex

- `avatar-content-precedence` — **resolved.** The public type makes content modes mutually exclusive.
- `avatar-focusable-prop-surface` — **resolved.** Identity-only Avatar excludes `focusable`.
- `avatar-visible-presence` — **deferred.** Visible indicators require a dedicated PresenceBadge contract, including placement and accessible status. The activity ring is not a presence substitute.

## Conformance

The linked tests cover the API, token styles and decorative ring; native text centering and accessibility exposure require renderer evidence.

| Requirement | Evidence                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| AVT-001     | `avatar.types.ts`, `useAvatar.ts`, `avatar.test.tsx`, `avatar.types.test.ts`                          |
| AVT-002     | `useAvatarStyles.ts`, `renderAvatar.tsx`, `avatar.test.tsx`                                           |
| AVT-003     | `avatar.styles.ts`, `useAvatarStyles.ts`, `avatar.test.tsx`                                           |
| AVT-004     | `useAvatar.ts`, `useAvatarStyles.ts`, `avatar.test.tsx`                                               |
| AVT-005     | `avatar.types.ts`, `useAvatar.ts`, `avatar.stories.tsx`                                               |
| AVT-006     | `avatar.styles.ts`, `useAvatarStyles.ts`, `renderAvatar.tsx`, `avatar.test.tsx`, `avatar.stories.tsx` |
