# TabList accessibility

## Structure

TabList supplies the tab-list role on a structural root that is not itself a
focus stop. Child Tabs remain the accessible elements. Each Tab exposes its
name, selected and disabled state, controlled-panel relationship, one-based
position, and total set size.

The list must have an accessible name when surrounding context does not already
identify the group. Use `accessibilityLabel` or a platform-labelled-by prop on
the TabList root. Each icon-only Tab still requires its own accessible label.

## Focus

Exactly one enabled Tab has `focusable={true}`. Disabled Tabs remain readable
but are not focus targets. If the selected value is missing or disabled,
TabList makes the first enabled Tab the active entry point without silently
changing a controlled selection.

Arrow, Home, and End navigation moves native focus to the resolved enabled Tab.
Tab and Shift+Tab use native traversal and encounter only the active Tab.
When all Tabs or the complete list are disabled, no child is focusable.

## Panels

Each Tab's `controls` value must match the `nativeID` of its panel. TabList does
not render or hide panels. The owner keeps exactly one corresponding panel
visible and gives it an accessible name or relationship appropriate to the
surface.

## Platform mapping

Windows exposes a tab-list container with Tab children through UI Automation.
macOS exposes the equivalent AX grouping and radio-tab children. Neither
platform should collapse the children into one accessible root.
