---
"@fluentui-react-native/desktop-driver": patch
---

Refuse pointer moves and scrolls whose macOS element or viewport origin lacks usable live geometry. Map this refusal from both native providers to the WebDriver `move target out of bounds` error.
