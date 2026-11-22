---
name: message-bar
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# MessageBar

## Scope

Persistent feedback about a page or section. The parent decides when to show, replace or remove the banner. It
does not expire, interrupt editing, or appear as an OS notification.

## Public contract

| Proposed prop              | Default                            | Purpose                                                                                                           |
| -------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `status / content`         | `information` / required           | information, success, warning or error plus a localized message; an optional title is read before its body.       |
| `actions`                  | none                               | At most two independently named action Buttons. Do not hide additional required decisions behind the banner body. |
| `onDismiss / dismissLabel` | absent / required when dismissible | Omit the close target if there is no dismissal action. Pressing it requests removal from the parent once.         |
| `announcementKey`          | content/status change              | A caller may identify a distinct repeated event. Ordinary rerenders do not represent new messages.                |

### Slots and ownership

Inline structural View/ref, status glyph, wrapping message, optional actions and dismiss Button. The status icon
sits beside the message, not in the focus order. Real child buttons retain their native targets.

Related contracts used by this design: [Button](../button/SPEC.md), [Field](../field/SPEC.md).

### Data and callbacks

Use the parent's message identity, not a counter updated on render, to distinguish a fresh alert from the same
feedback being laid out again. Each action has its own visible/localized label and handler. Dismiss requests
have no built-in retry or validation side effect. If a narrow layout wraps actions, retain their logical and
accessibility order.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **MSB-001:** Do not track visibility privately or start a timer. A declined dismiss leaves the banner present without clearing any message or action.
- **MSB-002:** Distinguish all four statuses through a consistent icon, text and semantic color, without truncating essential feedback when actions wrap.
- **MSB-003:** A button handles its own activation. The banner never steals focus on insertion; if a focused banner is removed the surrounding app chooses a live successor.
- **MSB-004:** Announce meaningful messages once without focus transfer. Use polite delivery for information/success and urgency appropriate to warning/error; verify actual delivery and independent access to actions.

## Platform behavior

Use desktop inline behavior, not the toast presentation described in the mobile comparison material. UIA live
behavior and AppKit announcements are distinct transports; choose one effective announcement owner per host.

## Divergences from Flex

- `desktop-inline-feedback` — **accepted.** No mobile transient presentation or system notification; the app owns removal.
- `banner-announcement-delivery` — **deferred.** Verify exactly-once native speech and whether urgency is respected; a role read or JavaScript callback is insufficient.

## Conformance

Insert, replace and rerender a warning while an editor has focus, invoke its secondary action and dismiss it
from the keyboard. Count announcements and callbacks separately.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
