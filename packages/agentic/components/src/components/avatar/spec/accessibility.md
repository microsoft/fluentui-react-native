# Avatar accessibility

Provide `accessibilityLabel`, `accessibilityLabelledBy`, `aria-label`, or
`aria-labelledby` when the avatar is the identity exposed to assistive
technology. The root then uses `role="img"` and presents that name. When
adjacent text already identifies the person or entity, omit the name so the
avatar and all of its descendants remain hidden from the accessibility tree.

The root honors an explicit `accessible` value, while decorative image, icon, and initials slots remain inaccessible in every content mode. `activityRing` has no exposed state or label; provide nearby text when active or collaboration status must be communicated.

On Windows, an informative avatar maps to a UI Automation image. On macOS, it maps to an AX image. Avatar is not a control and should not be given a focusable role.
