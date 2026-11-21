---
name: tooltip
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Tooltip

## Scope

A Tooltip attaches a short, nonessential text description to an existing control. The control remains the only
activation and focus target. Prefer the tooltip the renderer already knows how to show; do not build a second popup
just to display a string. Use Popover for interactive content. This is a proposed desktop contract for
[#4249](https://github.com/microsoft/fluentui-react-native/issues/4249), not an export or a legacy migration.

## Public contract

| Prop       | Proposed type                      | Meaning                                                                                                               |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `content`  | `string` (required)                | Localized plain text. Empty or whitespace-only content removes the tip and its generated description.                 |
| `children` | one view-backed React element      | The trigger and only root slot. It must forward the tooltip, accessibility props and ref to the **same** native view. |
| `ref`      | React 19 ref to the trigger's view | Composed with the child's ref. It never points to a tooltip window or a new wrapper view.                             |

- **TIP-001 — Anchor.** Decorate the trigger in place; do not insert a layout, hit-test, or accessibility node.
  Preserve its identity, style, enabled state, handlers, and ref across content changes. Support an ordinary
  focusable view or a control that forwards to one. Fragments, multiple children, bare strings, inline text ranges
  and components that swallow the native props are not supported anchors.
- **TIP-002 — Presentation.** There is one text presentation owner per trigger. A host adapter sets, updates and
  removes the native text on that view. The host owns visibility, delays, motion, size, placement and appearance;
  the wrapper does not infer actual visibility from hover or focus events. There is no surface slot, visual axis,
  `visible`, visibility notification, delay, placement, target, or custom style API. See [tokens](spec/tokens.json).
- **TIP-003 — Interaction.** A pointer user and a keyboard-only user must be able to discover and dismiss the tip
  without activating the trigger or moving focus into the tip. Leaving, detaching or reusing a trigger must not
  show stale text. The [interaction contract](spec/interaction.md) identifies proof required for each native route.
- **TIP-004 — Accessibility.** Keep the trigger's existing name, role, state and actions. Make supplemental
  information available on the trigger even when the tip is closed. Never announce matching label and description
  twice or introduce a focusable tooltip. See [accessibility](spec/accessibility.md).
- **TIP-005 — Native boundary.** The wrapper and public API belong to `components`. Start with renderer props in
  platform files, not a new native-core registration. Use the existing Office host only if an endpoint comparison
  demonstrates a need. Neither native-core's root nor the experimental package changes under this draft.
- **TIP-006 — Admission.** Qualify macOS Paper, macOS Fabric, Windows Fabric and Office Win32 independently; a
  renderer source path, OS API or passing mock is not a support claim. iOS and Android are research only.

## Platform behavior

| Endpoint inspected                                    | Available mechanism and recommended route                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| macOS, RNmacOS 0.81.9                                 | Use lowercase `tooltip` on the trigger `View`. Paper remaps it to AppKit `NSView.toolTip`; Fabric sets or clears that same property when props change. **No FURN macOS native view is needed for a text tip.** This establishes hover plumbing, not keyboard presentation or VoiceOver output.                                                                                                                                   |
| Windows, RNW 0.81.38 Fabric                           | Use `View.tooltip`. The Composition view registers with RNW's own `TooltipService`, not XAML. It tracks mouse/pen entry and focus, starts a 1,000 ms timer, and tears down on exit, focus loss (focus-originated tips) or unmount. Removing the prop, not setting an empty string, stops tracking. No additional Windows host for baseline text. Escape and moving the pointer onto the tip are not established by this service. |
| Windows, RNW Paper/XAML                               | The framework-element view manager maps a string `tooltip` to XAML `ToolTipService.SetToolTip`. This is evidence of an existing route, **not** Fabric evidence or an additional support target. Clearing a previously set tip is not established by its string-only setter.                                                                                                                                                      |
| Office Win32, `@office-iss/react-native-win32` 0.81.9 | The fork declares `View.tooltip` and lists it as a native view attribute. Test it first in Office; JS transport does not prove the baked host honors it. Independently, the legacy FURN wrapper requests the host-owned `RCTTooltip` with `content`. Compare both on the same trigger, including Office's documented keyboard shortcut. Never mount both routes.                                                                 |
| iOS / iPadOS, RN 0.81.6                               | UIKit's [UIToolTipInteraction](https://developer.apple.com/documentation/uikit/uitooltipinteraction) is available from 15.0 for pointer hover. Stock RN does not expose an equivalent general-purpose `View` prop. It is not a touch or keyboard fallback. A future iPad pointer feature would need an availability-checked bridge or upstream RN support.                                                                       |
| Android, RN 0.81.6                                    | Android's [view tooltips](https://developer.android.com/develop/ui/views/components/tooltips) use `View.setTooltipText` on API 26+ for hover or long press. Stock RN does not expose that setter on `View`. Do not intercept a child's long press or add a bridge for this desktop contract.                                                                                                                                     |

**Win32 migration decision.** Do not move `TooltipNativeComponent` merely because it exists. The legacy
[spec](../../../../../experimental/Tooltip/SPEC.md) documents cursor-relative placement and marks custom positioning and
targeting unimplemented. Its generic codegen declaration is not evidence that other renderers register `RCTTooltip`.
If Office qualification favors the host over `View.tooltip`, place only the platform-specific binding behind a
`native-core/win32` adapter; retain the exact registration and existing legacy imports and props through a compatibility
shim. Do not add a second registration, introduce new baked-host commands, or make other platforms load it.

## Divergences

- `system-presentation` (accepted for draft): adopt Flex's single noninteractive text label; adapt its styling,
  suggested directions, and timing to host policy. No Fluent surface is rendered or themed by the wrapper.
- `keyboard-and-hover` (deferred to qualification): focus discovery, Escape and persistence while moving onto the
  tip are design goals, not promises made by a native string prop. If a host misses a requirement, withhold admission
  until a native alternative, scoped fix, or explicit platform divergence is reviewed. Do not layer a JS popup over it.
- `trigger-description` (adapted): a native trigger description is not a browser ID relationship. Consumers provide
  a name for icon-only controls; the tooltip itself is never the sole source of that name.
- `view-anchor-only` (accepted for draft): no legacy string/ref targets or inline text anchoring
  ([#4378](https://github.com/microsoft/fluentui-react-native/issues/4378)). Plain-text mobile OS APIs are not
  evidence of a supported RN endpoint.

## Conformance

Draft; review required before implementation. [Provenance](spec/source.json) pins the design input, FURN compatibility
evidence and renderer sources. Flex governs purpose; native sources govern transport, not verified user experience.
See [platform evidence](spec/platforms.md) for the source paths and [usage](spec/usage.md) for an example. Planned
evidence is a type test for the API, a component test for prop/ref preservation and cleanup, and native stories for
the discovery, dismissal and accessibility cases. No renderer has been qualified by this contract.
