---
'@fluentui-react-native/desktop-driver': patch
---

Add the bounded observation contract to the native protocol: `observe` reads one budgeted, breadth-first sample of a window's accessibility tree and `releaseElements` drops the records Node created for agents, both negotiated as the additive `boundedObservation` helper feature. The native host validates every request and response against the contract, and the fake host is the reference provider. Helpers that do not negotiate the feature behave as before.
