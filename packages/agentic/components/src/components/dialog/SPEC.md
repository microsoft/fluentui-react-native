---
name: dialog
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Dialog

## Scope

A named decision or information surface. Modal blocks the owner window, nonmodal coexists with it, and alert
requires an explicit resolution. A scrim or cyclic Tab by itself is not modality.

## Public contract

| Proposed prop                                   | Default                                             | Purpose                                                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type / open / defaultOpen`                     | `modal` / uncontrolled, closed                      | modal, nonmodal or alert; onOpenChange(next, reason) reports user requests, not prop synchronization. The presentation is scoped to its owner window. |
| `title / children / actions`                    | required title / optional body / explicit actions   | Order primary, secondary and optional tertiary actions meaningfully. Alert must have a reachable resolving action.                                    |
| `triggerRef / initialFocusRef / returnFocusRef` | optional live targets                               | Use a mounted opener or an explicit alternative. Prefer a safe, meaningful initial target, not a destructive default.                                 |
| `onDismissRequest / closeLabel`                 | optional notification / required for a close button | Escape or light dismissal follows mode. Do not offer an apparent close button that cannot dismiss an alert.                                           |

### Slots and ownership

Stable structural root/ref and a presented surface with header/title, optional close, body and footer. The
modal/alert backdrop belongs to the native scope; nonmodal has no blocking backdrop. Reflow footer actions at
narrow measured surface widths.

Related contracts used by this design: [Button](../button/SPEC.md), [DestructiveButton](../destructive-button/SPEC.md).

### Data and callbacks

`onOpenChange(next, { reason })` distinguishes trigger, dismiss request and explicit resolution. A click on an
ordinary modal scrim requests dismissal and return to the opener; nonmodal has no scrim and alert ignores scrim
input. Below a measured 320-unit footer width, stack primary, secondary and tertiary actions without losing any
action to clipping.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **DLG-001:** Distinguish requested from actual presence, including native close. Controlled true must not reopen a natively dismissed generation in a loop.
- **DLG-002:** Ordinary modal and nonmodal accept Escape. Alerts reject Escape and outside clicks; an explicit action resolves them. No action fires twice via keyboard and default-button handling.
- **DLG-003:** Modal and alert isolate background pointer, keyboard and assistive traversal, including nested scopes. Nonmodal must allow leaving and returning without dismissal.
- **DLG-004:** Keep the title, actions and long body accessible on narrow or scaled windows. Bound the surface to usable owner dimensions and allow content scrolling without hiding the safe exit.

## Platform behavior

Modern Callout is nonmodal and FocusZone only navigates. Require the native modal scope tracked in
[#4379](https://github.com/microsoft/fluentui-react-native/issues/4379) for modal/alert; do not put an
accessibility-isolated role on a non-isolated popup.

## Divergences from Flex

- `real-modal-isolation` — **deferred.** A focus loop and overlay alone cannot qualify blocking behavior; gate by mode and endpoint.
- `safe-dialog-entry` — **accepted.** Choose initial and return focus by purpose and actual target lifetime, not an unconditional first footer action.

## Conformance

Nest a confirmation, attempt background input and assistive traversal, remove the opener, and dismiss in each
mode. Inspect actual focus and background operability, not only callback results.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
