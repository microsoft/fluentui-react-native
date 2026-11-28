---
name: presence-badge
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# PresenceBadge

## Scope

A passive visual for a person's availability, composed by an identity owner. A ring denoting current activity, a
generic status badge and a person's presence are not interchangeable.

## Public contract

| Proposed prop | Default     | Purpose                                                                                                                                                                                    |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `status`      | `available` | One of available, busy, doNotDisturb, away, offline or outOfOffice; the caller owns updates. Omit the badge when availability is unknown rather than reporting that a person is available. |
| `size`        | `medium`    | extraSmall, small, medium or large; the host chooses the size appropriate to its Avatar.                                                                                                   |
| `style / ref` | absent      | Address the nonfocusable root View, not the enclosing identity or its focus target.                                                                                                        |

### Slots and ownership

The parent positions the root at the Avatar's logical bottom-end. The private mark combines shape/glyph and
color; the host supplies the localized status words. No press, tooltip-based name, independent status text or
presence subscription.

Related contracts used by this design: [Avatar](../avatar/SPEC.md).

### Data and callbacks

`status` is a discriminant, not six independent booleans. Available, busy, do-not-disturb, away, offline and
out-of-office need distinguishable artwork at the intended size. `formatStatus(status)` is an identity-owner
localization concern; do not promise built-in English speech or a timer for status expiry.

### Requirements

- **PRS-001:** Accept exactly the six proposed statuses and four sizes. Do not inherit additional legacy Badge states.
- **PRS-002:** Render the supplied status immediately, including when the host reuses a row for another person; never infer status from activityRing.
- **PRS-003:** Keep the mark distinguishable by shape as well as color; preserve its contrast boundary across light, dark and forced contrast surfaces.
- **PRS-004:** When informative, the host exposes identity and current availability once. The badge never becomes a second action or a live announcement stream.

## Platform behavior

Avatar does not admit a presence slot. PresenceBadge is a sibling visual placed by its host, which supplies the
accessible name. The mark is excluded from independent traversal and hit testing; qualify status changes and
host focus on Windows Fabric, Office Win32, macOS Fabric and macOS Paper.

## Divergences from Flex

- `presence-host-owner` — **accepted.** Place status meaning on the identity owner, not on an additional image or focusable icon.
- `avatar-presence-admission` — **deferred.** Adding a presence slot to the existing Avatar requires a separate contract review.

## Conformance

Read the same focused row before and after a status change; switch direction and high contrast, and check the
smallest size without relying on color alone.

The [requirement evidence](spec/source.json) identifies the implementation, tests and native story. Endpoint
qualification is tracked separately.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
