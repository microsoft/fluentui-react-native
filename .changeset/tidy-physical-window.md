---
'@fluentui-react-native/storybook-desktop': patch
---

Establish and verify a centered 1024x768 window before macOS physical-lane Storybook runs, clamping its position inside a visible screen and failing when the display or host cannot accommodate it. Leave accessible and compatibility lanes, native occlusion detection, and story assertions unchanged.
