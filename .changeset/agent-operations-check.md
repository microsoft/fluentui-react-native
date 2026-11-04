---
'@fluentui-react-native/desktop-driver': patch
---

Add the `check` agent operation. It compares a referenced element's states, name, value, or text with what is expected, or counts the elements a selector matches (`none`, `unique`, or `some`), and reports each expectation's status with the actual value when it failed. With `waitMs`, up to 30 seconds, it re-evaluates on the provider's change events and a bounded poll until the expectation holds, and otherwise reports `timed-out` with the last status. An incomplete search is `inconclusive`, never an absence, and expected values and text are refused when the operator denies content. `act` also accepts a selector in `find`, which a search inside the request must prove unique, and returns the proven `ref` and `sample`. The typed client gains `check()`.
