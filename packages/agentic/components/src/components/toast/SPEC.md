---
name: toast
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Toast

## Scope

An app-local transient notification, not a system notification or a persistent inline banner. Showing one must
not steal editing focus or make an essential action available only against a ticking clock.

## Public contract

| Proposed prop                           | Default                                        | Purpose                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id / title / status`                   | required stable ID and title / `informational` | informational, success, warning or error. A distinct notification has a distinct identity; severity does not automatically make every update urgent. |
| `body / subtitle / thumbnail / actions` | absent                                         | Provide meaningful optional content and at most the actions that can remain usable. An optional dismiss Button needs a localized name.               |
| `timeoutMs / onDismiss`                 | host policy / callback with reason             | Positive finite timeout for transient information, or no timeout for persistence. The host owns the remaining time, stacking and removal.            |
| `progress`                              | absent                                         | Either work progress or a timeout display, never both. Loading suspends expiration until an explicit completion/update.                              |

### Slots and ownership

A structural View ref in an app-owned notification region. Status mark, optional thumbnail, title/text, optional
ProgressBar, actions and close are distinct. The surface itself is not a new keyboard destination.

Related contracts used by this design: [MessageBar](../message-bar/SPEC.md), [ProgressBar](../progress-bar/SPEC.md), [Button](../button/SPEC.md).

### Data and callbacks

`onDismiss(id, { reason: 'timeout' | 'dismiss' | 'action' })` identifies the live notification. A replacement
invalidates the previous ID's timer. The region must expose an accessible duration/disable-timeout policy when
the time limit matters; pausing only after a person has already found the toast is not sufficient.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **TST-001:** Pause remaining time during hover, keyboard focus or loading; overlapping pause reasons compose. Resume the remainder, not a fresh timeout on each rerender.
- **TST-002:** Never autofocus or trap. If an essential action would otherwise expire, keep the Toast persistent or supply a discoverable ongoing alternative.
- **TST-003:** Deliver one announcement per meaningful notification/update, not per progress tick. Keep action/dismiss targets accessible independently; do not double-announce through two transports.
- **TST-004:** Keep the desktop surface neutral across statuses; use icon/text for meaning. Reflow at narrow widths, avoid obscuring focused content and remove nonessential movement under reduced motion.

## Platform behavior

The app-local host chooses accessible timing and placement within the owner window. A native OS toast has
independently controlled lifetime, permission and actions and is not a compatible silent fallback. Unmount
invalidates timer callbacks for the old ID.

## Divergences from Flex

- `app-local-toast` — **accepted.** Use an app-owned presentation and lifetime; do not map to OS notifications or reuse the mobile MessageBar presentation.
- `accessible-expiration` — **accepted.** Hover alone is not a timing accommodation. Essential actions persist or remain reachable elsewhere.

## Conformance

Overlap hover, focus and loading, advance elapsed time, release reasons individually, and replace the
notification ID. Assert one dismissal, intact editor focus and one audible update.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
