# Skeleton accessibility

## Native semantics

The root sets `accessible={false}`, `accessibilityElementsHidden={true}`, and
`importantForAccessibility="no-hide-descendants"`, so the placeholder and every
descendant are removed from the UI Automation tree on Windows and from the
accessibility tree on macOS. Narrator and VoiceOver never land on a placeholder
and never announce one.

Skeleton exposes no role, no accessible name, and no accessibility state. There
is no naming prop to supply and no development warning for a missing name,
because a named placeholder would be noise rather than information.

## Communicating that a region is loading

Skeleton does not announce loading. The screen or region that swaps
placeholders for real content owns that message. Set the busy state on the
container that holds the placeholders, or announce a short status string once
for the region, and clear it when content arrives. Use one announcement per
logical loading region, not one per placeholder.

A placeholder that stands in for a control the user will later focus does not
reserve that control's name. When the real content mounts, the accessible name
arrives with it.

## Focus

The root is not focusable and is never in the keyboard tab order, so keyboard
focus can neither enter nor be trapped inside a placeholder. Do not move focus
to a placeholder.

When placeholders unmount, focus that was inside the loading region is lost
with them. The region should return focus to a stable ancestor rather than
letting the platform drop it.

## Motion sensitivity

When the platform reduced-motion setting is on, the sweep does not run and the
highlight overlay is not mounted. The placeholder still reads as a static
themed block. No slower, dimmer, or fading substitute is played.

The placeholder fill is intentionally low contrast because it carries no
meaning; it is not required to reach a text or non-text contrast threshold.
