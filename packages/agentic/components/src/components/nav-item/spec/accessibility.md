# NavItem accessibility

NavItem owns row-level semantics only. The parent navigation owns the
container role, list structure, position-in-set values, and the identity of the
group a category discloses.

## Row semantics

An `item` row publishes `accessibilityRole: 'link'` because it represents a
destination. Its caller-owned `selected` value is published through
`accessibilityState.selected`, which is how React Native reports the current
entry of a navigation set on Windows UI Automation and macOS accessibility.
React Native has no `aria-current`, so a separate current-page attribute is not
available.

A `category` row publishes `accessibilityRole: 'button'` because it toggles a
group rather than navigating. It publishes `accessibilityState.expanded` and,
when `controls` is supplied, the identifier of the group it discloses. A
category never publishes a selected accessibility value, even when the parent
navigation gives it the selected treatment because a hidden descendant is the
current destination. The parent supplies the description naming that hidden
destination through `accessibilityHint` or a caller-supplied label.

Caller-supplied `accessibilityState` values are preserved; NavItem merges only
the values it owns.

## Names

The visible label is the accessible name. A row rendered with
`showLabel: false` removes the label from layout entirely, so the caller must
supply `accessibilityLabel` with the destination name rather than the icon
name; NavItem warns in development when it is missing. Until this package
publishes a Tooltip, the collapsed rail exposes the name to assistive
technology only.

## Presentation

The leading icon, leading avatar, selected indicator, trailing content, and
chevron are presentation. They are hidden from assistive technology, and the
row is the only announced control for them. Controls nested inside
`trailingActions` announce their own name and role and are reached
independently.

## Disabled rows

A disabled row publishes `accessibilityState.disabled`, is not focusable, and
does not activate. Keeping the row mounted preserves the shape of the
navigation for assistive technology.

## What the parent owns

Position in set, set size, the navigation landmark or list role, arrow-key
movement, and the choice of which rows are reachable while a group is collapsed
are all parent responsibilities. NavItem does not set them and does not manage
its own focus order.
