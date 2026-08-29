# Badge accessibility

Badge is decorative by default: its root and children are hidden from accessibility so a host control can own the announcement. Put status or count meaning in the host's accessible name when the host already describes the badge.

For a standalone meaningful indicator, supply `accessibilityLabel` or an accessible-label reference. The root then uses React Native image role and exposes the supplied name. An icon-only badge without either name produces a development warning. Leading and trailing icons remain decorative, including on an informative badge.

On Windows, an informative badge maps to a UI Automation image. On macOS, it maps to an AX image. Badge does not provide a focusable accessibility element, a disabled value, or an activation action.
