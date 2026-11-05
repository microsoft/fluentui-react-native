---
'@fluentui-react-native/desktop-driver': patch
---

Report the FDR1 mutation `effect` from the Windows helper on every failed or cancelled mutating command. An effect ledger counts each UI Automation pattern action and value write and every key, button, wheel, close, and window-placement change Windows accepts, so a rejection reports `none`, a command stopped after part of it landed reports `partial`, and a provider call that never settled or failed ambiguously reports `unknown`. A cancel for a queued mutation, or for an id the helper does not hold, reports `none`. The gated native test now checks effect reporting against the Windows helper as well as the macOS one.
