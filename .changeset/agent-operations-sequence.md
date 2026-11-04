---
'@fluentui-react-native/desktop-driver': patch
---

Add the `sequence` agent operation. It runs up to eight `act` and `check` steps in order in one call, stopping at the first act that fails or check that does not pass, and optionally closes with a bounded observation. Each step reports its own result or a sanitized error with the act's mutation report; steps that ran stay done. The request is refused before the first step when it could not run as a whole: a quarantined target, an unsupported action, or content the operator denies. The checks share one 30-second wait ceiling. The catalog names embedded step schemas by operation instead of repeating them. The typed client gains `sequence()`.
