---
name: tooltip
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Tooltip

## Scope

Tooltip is a focusable trigger plus a short, non-interactive label that describes it. It owns visibility, the pointer and focus behavior that reveals the label, the delay before a pointer reveal, the description relationship between the label and the trigger, and the tokenized label surface. Its consumer supplies the trigger presentation and the label text.

Tooltip is a specialization of Popover, not an independent floating-surface implementation. It reuses the reviewed Popover composition pipeline for the wrapper, the trigger, the anchored native surface, the anchor relationship, the mount lifetime of the surface, and the native dismissal channel, and it replaces the Popover decisions that a tooltip must own: trigger role and expanded reporting, initial focus, test identifiers, surface role, placement default, visual tokens, and what an open request means. Everything Popover records as belonging to the native `@fluentui-react-native/callout` surface — placement geometry, viewport containment, dismissal policy, and focus transfer — stays outside this contract too.

Tooltip does not own rich content, interactive content, or a way to make the label reachable. The label is a single text node; a caller that needs interactive floating content should use Popover directly.

## Public contract

`content` is required and is the tooltip label. It accepts a string or `Text` slot properties whose `children` is a string, because the same text also describes the trigger and names the surface. Visibility is self-driving: `defaultVisible` initializes uncontrolled state, `visible` makes the value controlled, and `onVisibleChange` receives the requested next value in either mode. A controlled value is never changed internally.

`position` selects a preferred anchor edge and defaults to `topCenter`, the placement Flex prefers and the one both platforms resolve to an above-the-trigger surface. `showDelay` defaults to 300 milliseconds and applies only to a pointer reveal. `hideDelay` defaults to 0 milliseconds and applies to every interaction-driven hide. `disabled` prevents the trigger from revealing the tooltip and reports disabled trigger semantics; it never blocks a hide. `focused` can force the trigger focus visual for an instance. `accessibilityState` preserves unrelated consumer state on the trigger. The root accepts the owned `ViewProps` surface, including `style`; Tooltip owns every root accessibility property because the root must stay a passive wrapper.

`root` is a passive inline wrapper. `trigger` is a public `Pressable` slot narrowed to presentation: children, style, test identifier, accessible name, `accessibilityRole`, a `ref`, and the pointer, focus, and press handlers, each of which runs after Tooltip's own handling. Tooltip owns the trigger's description, accessibility state, accessible flag, disabled state, focusability, and native focus ring, and composes the consumer `ref` with the internal anchor ref. `content` is a public `Text` slot; its user style is applied after the tokenized label style.

The surface, the label, and their accessibility nodes mount only while the tooltip is visible, so a hidden tooltip contributes no view, no accessibility node, and no focus target. The resolved state retains the visible value, the resolved position and delays, trigger hover/press/focus state, disabled state, theme state, and the preserved user styles.

### Requirements

- **TIP-001:** Resolve the documented defaults and implement controlled and uncontrolled visibility without mutating a controlled value.
- **TIP-002:** Render the wrapper, the trigger, and the anchored surface tree, and mount the surface and the label only while the tooltip is visible.
- **TIP-003:** Describe the trigger with the label text, keep the trigger focusable and accessible while it is enabled, report disabled state without reporting expanded state, compose the consumer `ref` with the anchor ref, and run consumer trigger handlers after Tooltip's own handling.
- **TIP-004:** Reveal the tooltip after `showDelay` on pointer entry and immediately on focus, hide it after `hideDelay` when the pointer leaves and focus is elsewhere, keep it visible while either pointer or focus remains on the trigger, cancel pending timers on the opposite interaction and on unmount, and never reveal it from a disabled trigger.
- **TIP-005:** Draw the label surface — fill, corner radius, clipping, and asymmetric padding — with no stroke on the React Native content host that both platforms render, apply the Flex label typography and foreground, and render persistent trigger focus feedback through `FocusVisual`.
- **TIP-006:** Anchor the surface to the trigger ref with the requested preferred edge, request no initial focus, adopt every close request that arrives from trigger activation or native dismissal even while disabled, and ignore open requests that arrive from trigger activation.
- **TIP-007:** Keep anchor gap, arrow presentation, motion, elevation shadow, a hoverable surface, dismissal policy, anchor rectangles, surface window commands, and focus transfer outside the component contract on Windows and macOS.

## Platform behavior

The surface is the native `Callout` component, which renders into a platform popup window rather than into the React Native view hierarchy. Tooltip passes the trigger ref as the callout target and the resolved placement as the callout directional hint, exactly as Popover does, and adopts the platform result.

Placement is a preferred edge. The macOS component maps all fourteen directional hints onto four screen edges, so `topCenter` and the other above-the-trigger hints are indistinguishable there, and a tooltip is not centered on its trigger. macOS repositions a surface that does not fit the screen on a best-effort basis; Windows does not reposition. Tooltip therefore forwards a preference rather than guaranteeing a position.

The label surface is drawn by the React Native content host inside the popup, which both platforms render and style. Tooltip still passes non-null fill, stroke, and radius values to the callout itself because the macOS surface layer update requires them, and it passes a zero stroke width so the callout layer cannot draw a boundary the Flex tooltip does not have.

Focus is the material platform difference. Tooltip requests no initial focus, which macOS honors: the popup is ordered in front without becoming key, so focus stays on the trigger. The Windows implementation moves focus into the popup and navigates to its first focusable element every time the popup is shown, regardless of the initial-focus property. A Windows tooltip revealed by keyboard focus therefore takes focus away from its trigger, which both breaks the requirement that focus stays on the trigger and blurs the trigger, so Tooltip's own blur handling hides the tooltip again. Tooltip does not attempt to defeat that behavior from JavaScript, and it does not claim keyboard-triggered tooltips on Windows.

Dismissal follows the Popover platform contract. Both platforms dismiss on a light-dismiss interaction outside the surface and raise the callout dismiss event; macOS additionally dismisses on the cancel key and when the application resigns active. Tooltip treats every close request the same way, so a disabled or externally driven tooltip still reports the request. Dismissal cannot be suppressed, because the callout dismiss-behavior properties are unimplemented on both platforms.

The trigger is a React Native `Pressable`. Its pointer entry and exit and its native focus and blur drive visibility. Its activation only ever requests a hide, because a tooltip is a description of a control rather than something a person opens; the underlying control's own press handling is unaffected. Trigger focus feedback is a mounted `FocusVisual`, and the RNW native focus ring is explicitly disabled.

## Divergences from Flex

- `tooltip-anchor-gap` — **deferred.** Flex places the label clear of its trigger. The native callout gap property is not implemented on Windows or macOS and the popup offset is computed by the platform, so no React Native style can reproduce it. Revisit when the native surface implements the gap.
- `tooltip-describedby` — **accepted.** Flex describes the trigger with a web description relationship to an identified tooltip element. React Native has no identifier-based description relationship, so Tooltip puts the label text on the trigger's `accessibilityHint`, which is the platform description channel, and repeats it as the accessible name of the surface content host.
- `tooltip-dismiss-key` — **accepted.** Flex requires the dismiss key to hide the tooltip while focus stays on the trigger. macOS implements this explicitly through the popup window's cancel operation. The Windows implementation registers only a light-dismiss action, so its dismiss-key behavior is whatever that platform action provides and is not established by the component. A JavaScript key handler on the trigger would not receive key events raised inside the popup window, so Tooltip documents dismissal per platform instead of adding one.
- `tooltip-focus-retention` — **deferred.** Flex requires the tooltip to appear on keyboard focus and focus to remain on the trigger. The Windows callout unconditionally sets focus into its popup when it is shown, so a focus-revealed tooltip moves focus off the trigger and is then hidden again by the resulting blur. macOS honors the no-initial-focus request and keeps focus on the trigger. Revisit when the native surface stops taking focus on show.
- `tooltip-hoverable-surface` — **accepted.** Flex keeps the tooltip visible while the pointer moves onto it, so a magnified reader can reach the text. The surface is a separate platform popup window whose pointer events are not part of the trigger's hover tracking, and on macOS a click inside the popup is the only interaction the component observes. Tooltip hides when the pointer leaves the trigger and does not claim a hoverable surface.
- `tooltip-motion` — **deferred.** Flex records a short fade in and a near-instant fade out, with no transition under reduced motion. The surface is a platform popup window whose presentation is not animatable from React Native, so Tooltip appears and disappears immediately and declares no motion contract.
- `tooltip-placement-alignment` — **accepted.** Flex models four placements. Windows resolves the full directional-hint union, while macOS collapses every hint on a side onto that screen edge. Tooltip keeps the full hint union for Windows fidelity, defaults to the Flex preference, and documents that a macOS tooltip is edge-aligned rather than centered.
- `tooltip-surface-role-semantics` — **deferred.** Flex gives the tooltip container a tooltip role. Tooltip applies the React Native `tooltip` role and the label text to the content host inside the popup, which is the only node it can address, but neither native implementation maps a role or a control relationship onto the popup window itself. The native accessibility tree is therefore not established by this contract.
- `tooltip-surface-shadow` — **deferred.** Flex specifies a low elevation shadow around the label surface. The surface is a platform popup window whose elevation is owned by the window server, and a React Native shadow drawn inside the popup is clipped by the window bounds. Revisit when the native surface exposes window elevation.
- `tooltip-touch-activation` — **accepted.** Flex describes a pointer and keyboard component and warns that touch users may never see a tooltip. Tooltip is revealed by pointer entry and by focus only; trigger activation never reveals it, so the trigger's own action stays unambiguous. A caller that needs a touch affordance should drive `visible` or use Popover.
- `tooltip-viewport-clamping` — **deferred.** Flex requires the label to move to a placement that fits. macOS handles selected overflow cases and can still leave a surface partly off screen, and Windows does not reposition at all. Tooltip forwards a preferred edge and treats containment as native best effort.

## Conformance

| Requirement | Evidence                                                                          |
| ----------- | --------------------------------------------------------------------------------- |
| TIP-001     | `tooltip.types.ts`, `useTooltip.ts`, `tooltip.test.tsx`, `tooltip.types.test.tsx` |
| TIP-002     | `useTooltip.ts`, `renderTooltip.tsx`, `tooltip.test.tsx`                          |
| TIP-003     | `useTooltip.ts`, `tooltip.test.tsx`, `tooltip.types.test.tsx`                     |
| TIP-004     | `useTooltip.ts`, `tooltip.test.tsx`                                               |
| TIP-005     | `tooltip.styles.ts`, `useTooltipStyles.ts`, `tooltip.test.tsx`                    |
| TIP-006     | `useTooltip.ts`, `tooltip.test.tsx`, `tooltip.stories.tsx`                        |
| TIP-007     | `tooltip.types.ts`, `useTooltip.ts`, `tooltip.types.test.tsx`                     |
