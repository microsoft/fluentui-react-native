---
name: info-label
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# InfoLabel

## Scope

InfoLabel adds one help button beside a [Label](../label/SPEC.md). Clicking the label addresses
the form control; activating the button opens supplemental content. Neither action implies the other.
Help may contain interactive content and is not a native tooltip. Instructions required to finish
the task belong inline, where a person need not open the help surface to find them.

## Public contract

| Proposed prop                            | Default                               | Meaning                                                                                                                                               |
| ---------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content: string`, `labelID?`, `target?` | content required                      | Same visible-text and target contract as Label. Never use the help button as the label target.                                                        |
| `size`, `weight`, `required`, `disabled` | `medium`, `regular`, `false`, `false` | Same values as Label. The standalone disabled state also disables the help button.                                                                    |
| `help: InfoLabelHelp`                    | required                              | A nonblank localized `triggerLabel`, meaningful `children: ReactNode`, and optional `surfaceLabel`. If omitted, the surface name uses `triggerLabel`. |

`InfoLabelHelp` also accepts Popover's `open?: boolean`, `defaultOpen?: boolean` (initially false)
and `onOpenChange?: (open, { reason }) => void` (`trigger` or `dismiss`). Supplying `open`, even
`false`, makes requested presence controlled. Forward one request through Popover; a prop change
is not a user event. Disabled forbids presentation even when open was requested. The native dismissal
latch and actual-presence semantics are [Popover's](../popover/SPEC.md), not a second state machine.

The structural `root` View owns the public React 19 ref, style and any native `tooltip` on that view.
The Label and Popover's Button trigger are siblings. Popover supplies the one trigger, not a Button
wrapped around another button. Use a subtle icon-only Button with a decorative Info glyph: a small
Button for a small/medium label and a medium Button for a large label. The help surface is anchored to
that mounted button, prefers top/center and can flip; it reserves no layout space. Give the surface a readable
width independent of the icon-only trigger. Button owns the
focus treatment and Popover owns surface styling. No global registry of open labels is introduced.

### Requirements

- **IFL-001:** Forward the label binding and presentation, but give the help trigger its own accessible
  name and action. Keep the label marker and icon out of both names. Missing help content or a blank
  trigger name is invalid usage; use Label alone when there is no help.
- **IFL-002:** Request one presence change per accepted user action. Hide disabled content and expose
  expanded state from actual presentation, not a stale controlled request. Closed content cannot be visited.
- **IFL-003:** Tab reaches the help trigger but not the label wrapper. On open, focus the first eligible
  help action or the named surface. Escape restores the live trigger; clicking elsewhere leaves focus at
  that destination. Boundary Tab should close help and continue in the original traversal direction.
- **IFL-004:** Use the declared label/trigger sizes, logical order and spacing. Standalone disabled
  mutes the label; within a disabled Field keep the text readable but the trigger inert. Neither host
  tooltip text nor the help body becomes the field's permanent name or description.

## Platform behavior

Use a **nonmodal**, view-anchored Popover: a named native group, not a blocking dialog. A role, hint or
expanded flag alone does not prove a native trigger/surface relationship. Natural boundary exit is
not yet established on every native popup host. Record actual Tab/Shift+Tab results separately on
Windows Fabric, Office Win32 and macOS Fabric/Paper; do not swallow Tab and call that continuation.

## Divergences

- `native-help-surface` — **accepted.** The reviewed local Popover, including its arrowless surface,
  placement, focus policy and dismissal-by-reason, governs; outside clicks do not pull focus back.
- `help-boundary-continuation` — **deferred.** Retain the intended boundary dismissal and destination
  in the contract. A host whose popup currently cycles or cannot continue forward is not qualified for it.
- `explicit-help-name` — **accepted.** Require a caller-localized action name. Do not build it from
  an English prefix, a tooltip, or the glyph name.

## Conformance

The [source evidence](spec/source.json) separates label and help activation and covers controlled and disabled
requests. Native trigger association and natural boundary continuation, and native focus on text-only help,
remain separate from testing the visible contents or invoking its trigger.
