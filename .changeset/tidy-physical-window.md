---
'@fluentui-react-native/storybook-desktop': patch
---

Establish and verify a centered macOS physical-lane Storybook window up to 1024x768, clamped within the largest visible screen frame with a one-point inset on each edge. Fail when no positive window fits or the host does not establish the exact requested rectangle. Leave accessible and compatibility lanes, native occlusion detection, and story assertions unchanged.

Use the effective smoke input lane, including `DESKTOP_INPUT=physical` when no `--input` flag is supplied. Explicit input flags retain precedence over the environment.
