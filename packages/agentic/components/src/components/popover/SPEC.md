---
name: popover
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Popover

## Scope

Popover is a trigger plus an anchored floating surface. It owns open state, trigger semantics, the anchor relationship, the tokenized surface, and the mount lifetime of the floating content. Its consumer supplies the trigger presentation and the surface content.

Popover does not own placement geometry, viewport containment, dismissal policy, or focus transfer. Those belong to the native `@fluentui-react-native/callout` surface on Windows and macOS. Where that surface does not implement a Flex behavior, or implements it differently per platform, this contract records a divergence instead of emulating the behavior in JavaScript. Popover also does not provide a selection model, block the underlying surface, or coordinate nested floating surfaces.

## Public contract

Open state is self-driving: `defaultOpen` initializes uncontrolled state, `open` makes the value controlled, and `onOpenChange` receives the requested next value in either mode. A controlled value is never changed internally. `position` selects a preferred anchor edge and defaults to `bottomLeftEdge`, the placement both platforms actually produce for a below-the-anchor surface in a left-to-right layout. `disabled` disables the trigger and prevents opening. `focused` can force the trigger focus visual for an instance. `surfaceAccessibilityLabel` names the floating surface and is distinct from the trigger's own name, which comes from the `trigger` slot. `accessibilityState` preserves unrelated consumer state on the trigger. The root accepts the owned `ViewProps` surface, including `style`; Popover owns every root accessibility property because the root must stay a passive wrapper.

`root` is a passive inline wrapper. `trigger` is a public `Pressable` slot narrowed to presentation: children, style, test identifier, accessible name and hint, a `ref`, and an `onPress` that runs after the component's own toggle. Popover owns the trigger's role, expanded state, activation, disabled state, focusability, and interaction tracking, and composes the consumer `ref` with its own anchor ref. `content` is an optional public `View` slot; omitting it renders a placeholder, and `null` renders an empty surface.

The floating surface and its content mount only while the popover is open, so a closed popover contributes no view, no accessibility node, and no focus target. The resolved state retains the open value, the resolved position, trigger hover/press/focus state, disabled state, theme state, and the user root style.

### Requirements

- **POP-001:** Resolve the documented defaults and implement controlled and uncontrolled open state without mutating a controlled value.
- **POP-002:** Render the wrapper, trigger, and the anchored surface tree, and mount the surface and its content only while open.
- **POP-003:** Expose the trigger as a button that reports expanded state, honors `disabled`, composes the consumer `ref` with the anchor ref, and composes consumer press handling after the component's own toggle.
- **POP-004:** Name the floating surface from `surfaceAccessibilityLabel`, warn in development when the name is missing, and apply the surface name and role to the React Native content host inside the popup rather than to the native popup window.
- **POP-005:** Draw the whole surface boundary — fill, subtle stroke, corner radius, clipping, and content padding — on the React Native content host that both platforms render, and render persistent trigger focus feedback through `FocusVisual`.
- **POP-006:** Anchor the surface to the trigger ref with the requested preferred edge, and report native dismissal through the same open-state channel as trigger activation.
- **POP-007:** Keep anchor gap, arrow presentation, dismissal policy, anchor rectangles, named anchors, surface window commands, minimum display padding, elevation shadow, motion, initial-focus selection, and focus return outside the component contract on Windows and macOS.

## Platform behavior

On Windows and macOS the surface is the native `Callout` component, which renders into a platform popup window rather than into the React Native view hierarchy. Popover passes the trigger ref as the callout target, which is the only anchor form both platforms implement, and passes the resolved placement as the callout directional hint.

Placement is a preferred edge, not an exact position. The macOS component maps all fourteen directional hints onto four screen edges, so alignment variants on the same side are indistinguishable there, and a below-the-anchor surface is leading-aligned to the trigger. macOS repositions a surface that does not fit the screen on a best-effort basis: it flips to the opposite side when that side has more room and slides along the cross axis, but it does not guarantee that every surface is fully on screen. Popover therefore forwards a preference and adopts the platform result.

Surface appearance is drawn by the React Native content host inside the popup, which both platforms render and style. The Windows component implements only the popup window, its anchor, its light-dismiss action, and its size; it does not implement the callout appearance properties. Popover still passes non-null fill, stroke, and radius values to the callout itself because the macOS surface layer update requires them, but the visible boundary and the content padding come from the content host. Windows sizes the popup from the first child of the portal content root, which is that same host.

Dismissal differs by platform. Both platforms dismiss on a light-dismiss interaction outside the surface and raise the callout dismiss event; macOS additionally dismisses explicitly on the cancel key and when the application resigns active. Popover translates any dismiss event into a request for the closed value, so an uncontrolled popover closes and a controlled popover reports through `onOpenChange`. The callout dismiss-behavior properties are not implemented on either platform, so dismissal cannot be suppressed.

Initial focus is platform-specific and is not a Popover guarantee. Windows always moves focus into the popup and navigates to its first focusable element when the popup is shown, regardless of the callout initial-focus property. macOS honors the initial-focus property by making the popup window key but does not choose a focusable descendant. Neither platform restores focus to the trigger on dismissal, and the callout restore-focus event and window focus commands are unimplemented on both.

The trigger is a React Native `Pressable` with button role. Its native pointer, touch, and keyboard activation toggle the open value. Trigger focus feedback is a mounted `FocusVisual`; no native focus visual is enabled.

## Divergences from Flex

- `popover-anchor-gap` — **deferred.** Flex specifies a gap between the surface and the trigger. The native callout gap property is not implemented on Windows or macOS, and the popup offset is computed by the platform, so no React Native style can reproduce it. Revisit when the native surface implements the gap.
- `popover-arrow-not-modeled` — **accepted.** Flex models an optional arrow whose default is hidden. The native callout beak properties are not implemented on Windows or macOS, so exposing an arrow would silently do nothing. Popover renders the Flex default, an arrowless surface, and does not expose an arrow axis.
- `popover-escape-dismissal` — **accepted.** Flex requires the dismiss key to close the surface. macOS implements this explicitly through the popup window's cancel operation. The Windows implementation registers only a light-dismiss action, so its dismiss-key behavior is whatever that platform action provides and is not established by the component. Popover documents dismissal per platform instead of adding a JavaScript key handler that the popup window would not receive.
- `popover-focus-return` — **deferred.** Flex returns focus to the trigger on explicit dismissal but preserves the natural destination when navigation crosses the surface boundary. Neither platform restores focus, the dismiss event does not distinguish those cases, and the callout restore-focus event is unimplemented, so Popover makes no focus-return guarantee. Callers that need it can drive `open` and move focus themselves.
- `popover-haspopup` — **accepted.** Flex requires the web popup-relationship trigger attribute. React Native has no equivalent accessibility property, so the trigger conveys the relationship through button role and expanded state only.
- `popover-initial-focus` — **deferred.** Flex moves focus to the first focusable element in the surface. Windows does this unconditionally, and macOS only makes the popup window key, so the behavior is neither uniform nor controllable from the contract. Revisit when the native surface exposes a portable initial-focus target.
- `popover-motion` — **deferred.** Flex records surface motion as pending. The surface is a platform popup window whose appearance is not animatable from React Native, so Popover appears and disappears immediately and declares no motion contract.
- `popover-placement-alignment` — **accepted.** Flex models placement as a side plus an alignment. The macOS implementation collapses every alignment variant onto the four screen edges, so only the side is portable. Popover keeps the full directional-hint union for Windows fidelity, documents the macOS behavior, and defaults to the leading-aligned placement both platforms produce.
- `popover-surface-dialog-semantics` — **deferred.** Flex gives the surface a dialog role tied to the trigger. Popover applies a dialog role and the surface name to the React Native content host inside the popup, which is the only node it can address, but neither native implementation maps a role, identifier, or control relationship onto the popup window itself. The native accessibility tree is therefore not verified by this contract.
- `popover-surface-shadow` — **deferred.** Flex specifies a low elevation shadow around the whole surface. The surface is a platform popup window whose elevation is owned by the window server, and a React Native shadow inside the popup would be clipped by the window bounds. Revisit when the native surface exposes window elevation.
- `popover-viewport-clamping` — **deferred.** Flex requires the surface to flip and clamp inside the viewport so that no part renders off screen. The macOS repositioning handles selected overflow cases only and can still leave a surface partly off screen, and the Windows implementation does not reposition at all. Popover forwards a preferred edge and treats containment as native best effort rather than a guarantee.

## Conformance

| Requirement | Evidence                                                                          |
| ----------- | --------------------------------------------------------------------------------- |
| POP-001     | `popover.types.ts`, `usePopover.ts`, `popover.test.tsx`, `popover.types.test.tsx` |
| POP-002     | `usePopover.ts`, `renderPopover.tsx`, `popover.test.tsx`                          |
| POP-003     | `usePopover.ts`, `popover.test.tsx`, `popover.stories.tsx`                        |
| POP-004     | `usePopover.ts`, `popover.test.tsx`                                               |
| POP-005     | `popover.styles.ts`, `usePopoverStyles.ts`, `popover.test.tsx`                    |
| POP-006     | `usePopover.ts`, `popover.test.tsx`                                               |
| POP-007     | `popover.types.ts`, `usePopover.ts`, `popover.types.test.tsx`                     |
