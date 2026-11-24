---
name: avatar-group
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# AvatarGroup

## Scope

A bounded row of identity markers with a noninteractive overflow count. It is not a people picker and the count
does not secretly open a roster.

## Public contract

| Proposed prop                         | Default                                         | Purpose                                                                                                                                          |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `members`                             | empty list                                      | Ordered entries with a stable key, localized name and Avatar content. Omit empty entries rather than drawing anonymous interactive placeholders. |
| `layout / size`                       | `spread` / `40`                                 | Use spread or stack; pass one supported Avatar size (16 through 120 on Avatar's discrete scale) to every member.                                 |
| `accessibilityLabel / formatOverflow` | group name from caller / locale-aware formatter | Supply meaningful group context and localize the hidden count. The owner of an interactive wrapper supplies its own complete summary.            |

### Slots and ownership

A structural View ref addresses the group. Avatar children are keyed by person; a text overflow marker occupies
the final visible position only when needed. The stack overlap follows logical order without changing reading
order. No nested hit targets.

Related contracts used by this design: [Avatar](../avatar/SPEC.md).

### Data and callbacks

A member is `{ key: string; name: string; avatar: AvatarProps }`. The group supplies the shared size and
decorative/individual exposure appropriate to its context; member content cannot introduce its own actions.
Compute the overflow from the complete array, not a child mount count.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **AVG-001:** When five or fewer members are present show them all. Above five, show the first four and count all remaining members in the fifth position.
- **AVG-002:** Preserve each member's circular silhouette and the underlying surface through stack cutouts; a solid ring painted to resemble one background is not equivalent.
- **AVG-003:** The group, people and count add no keyboard stops. A surrounding actionable owner may present a single action for the whole group.
- **AVG-004:** A named standalone group exposes visible people and the hidden count once. Inside one actionable parent, expose one summary without duplicate descendants.

## Platform behavior

Do not rely on negative overlap alone for a transparent cutout. Verify rendering over patterned and translucent
native backgrounds; if a renderer cannot mask the overlap, use the documented spread presentation rather than
pretending parity.

## Divergences from Flex

- `overflow-is-information` — **accepted.** Use a localized count, not an implicit pressable menu.
- `native-stack-mask` — **deferred.** Verify transparent cutouts on every renderer; spread remains the fallback presentation.

## Conformance

Compare five, six and zero members, remove a visible person, and inspect both the named standalone group and a
group inside a single button.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
