---
'@fluentui-react-native/desktop-driver': patch
---

Stop the macOS helper from growing its memory with every request. Its stdin reader and worker threads run no run loop, so nothing drained their autorelease pools, and a long session added about 25 KB per command plus 80 KB per `tree` and 250 KB per full `observe` for good. Each frame and each request now runs in its own autorelease pool, and the helper holds steady across thousands of requests.
