---
'@fluentui-react-native/desktop-driver': patch
---

Add the `act` agent operation. It clicks with a physical pointer, performs the default accessibility action, types, or clears one element, which must be named by a reference that a `find` proved unique and by that find's sample id. Before dispatching, it rereads the element inside the target's input turn and refuses one whose role, name, or automation id changed, or that is disabled, hidden, or covered. The result reports the mechanism used. A mutating request with a caller-chosen `requestId` is recorded, so repeating it returns the first outcome instead of acting again, and reusing the id for a different request fails with `request-id-reused`. While the target is quarantined, `act` is refused in fixed words and reads continue. The typed client gains `act()`.
