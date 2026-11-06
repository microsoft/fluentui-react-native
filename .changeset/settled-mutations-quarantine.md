---
'@fluentui-react-native/desktop-driver': patch
---

Settle failed and cancelled mutations before reusing a target. Native helpers report an additive `effect` (`none`, `partial`, or `unknown`) on a failed or cancelled mutating command, the macOS helper tracks it with an effect ledger, and the service quarantines a target whose mutation may have reached the application, refusing later mutations with `target-quarantined` instead of replaying them. A failed mutation reports its `data.mutation` disposition (`applied`, `indeterminate`, or `rejected`), `/status` lists active quarantines, and a late success after a Node timeout is reported as applied.
