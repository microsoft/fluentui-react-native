# CompoundItemLayout contract

`CompoundItemLayout` is an unstyled structural layout for compound rows.

- Primary content is required.
- Leading, secondary, and trailing regions are optional.
- Secondary content may appear beside or under primary content.
- Region styles apply after the primitive's structural styles.
- Regions are centered by default, including arbitrary icons and custom content.
  Text-only rows with different font metrics can opt into `alignItems: 'baseline'`
  on both `style` and the inline `contentStyle`. Baseline participation includes
  leading and trailing content; do not apply it indiscriminately to image or
  action-button regions.
- Native root, accessibility, and test props not owned by the primitive are
  forwarded.
