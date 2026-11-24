---
name: simple-nav
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# SimpleNav

## Scope

A single-level set of app destinations that can fit in an expanded panel, a narrow icon rail, or a host-opened
overlay. Its links remain independently navigable; no category or carried-selection model is introduced.

## Public contract

| Proposed prop                            | Default                                      | Purpose                                                                                                                                |
| ---------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `items / currentValue / onNavigate`      | required / caller-owned / required           | Flat keyed destinations with full names and suitable rail visuals. A route request never changes current before the caller accepts it. |
| `density / collapsed / defaultCollapsed` | `comfortable` / uncontrolled, expanded       | Compact or comfortable. The inline toggle requests rail or expanded; retain scroll position across the change.                         |
| `breakpoints / open / onOpenChange`      | container-measured, overlay initially closed | The shell supplies layout breakpoints and a live external opener. Use owner width rather than screen or browser viewport width.        |
| `accessibilityLabel / footer`            | required region name / absent                | Each destination still needs a name; optional shell actions are not destinations.                                                      |

### Slots and ownership

Named View/ref, header and toggle, scroll region of NavItems and footer. In the rail remove label layout width
but retain each link's name; a native tip supplements sighted discovery. Narrow hidden presentation occupies no
space.

Related contracts used by this design: [NavItem](../nav-item/SPEC.md), [Drawer](../drawer/SPEC.md), [Button](../button/SPEC.md), [Divider](../divider/SPEC.md), [Tooltip](../tooltip/SPEC.md).

### Data and callbacks

`breakpoints: { railBelow: number; hideBelow: number }` is caller-defined in logical units of the containing
layout, with `hideBelow < railBelow`. Do not infer it from physical display resolution. Measure once per layout
change; crossing a threshold updates presentation, not the route. A hamburger-only toggle can collapse or
restore the inline rail within the permitted width.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SNV-001:** Change panel/rail/hidden presentation independently from the route and body scroll position. Only the caller commits a new destination.
- **SNV-002:** Keep each visible link reachable with Tab; optional arrows never replace sequential traversal. A disappearing focused row resolves to a live shell target.
- **SNV-003:** Use expanded/rail extents as preferred sizes; transition using measured available space. Reduced motion must not delay access to newly visible controls.
- **SNV-004:** A rail link is independently named without its tooltip. A shell-opened modal overlay needs actual background isolation and a safe exit.

## Platform behavior

The width ladder uses the containing native layout, including split windows. Inline rail and hidden modes do not
depend on modal infrastructure; do not claim an overlay is modal merely because a visual scrim is visible.

## Divergences from Flex

- `measured-rail-layout` — **accepted.** Use native container measurement and caller-owned routing; preserve link names even where native tips are not presented.
- `simple-nav-overlay` — **deferred.** Gate blocking overlay mode on the same qualified isolation as Dialog/Drawer.

## Conformance

Test expanded to rail to hidden transitions while focused, reopen the overlay, and inspect all names, route
ownership, focus return and scroll retention.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
