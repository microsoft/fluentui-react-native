---
'@fluentui-react-native/desktop-driver': patch
---

Add a Windows helper self-test that drives the stdio host over in-process pipes and shows that cancelling a queued mutation reports `effect: none`, cancelling a queued read reports no `effect`, and neither cancelled request ever runs. The Windows helper documentation now describes `SendInput` as completed injection into the input stream rather than application handling, so a `partial` effect needs authoritative re-observation.
