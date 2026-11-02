---
'@fluentui-react-native/components': minor
---

Button, ListItem, Tag, Badge, Card, and Input read their typography, geometry, interaction, hover, and focus-visual
policy from a private traits constant linked from each `SPEC.md`. The Button and Card borders now stay at their rest
color on hover and press, and components rendered with a Fluent-based theme use the Flex corner radii. The contract
checker now validates `SPEC.md` front matter keys strictly and checks each traits constant.
