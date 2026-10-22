---
'@fluentui-react-native/native-core': patch
---

Keep Paper Callout view creation on the main actor under strict Swift concurrency,
including Office-style builds without a React module. Add a reproducible Apple
integration probe and native popup container-focus, geometry, and expanded-state
regressions for the macOS prerequisites. Callout placement regressions first move
the owner window to the top of its screen, so a small display cannot flip the popup
to the opposite edge.
