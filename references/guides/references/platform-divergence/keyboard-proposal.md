# Proposal: native keyboard ownership

[Guide](../../platform-divergence.md) | [Endpoint differences](platform-capabilities.md)

**Hypothetical API research.** Core View key declarations appear in the inspected
[v0.84.0 contract](https://github.com/facebook/react-native/blob/v0.84.0/packages/react-native/Libraries/Components/View/ViewPropTypes.js);
the release changelog reports Android implementation. That is not proof of iOS or every backend's support.
These events reduce the event-payload gap relative to FURN's core 0.81.6, but an event callback is
not the same contract as claiming a native default before AppKit or Windows routes it further.

## API options

One option is a committed declaration scoped to a native target or group:
`{ key?, code?, modifiers?, phase, preventNativeDefault }`. Another is a native command-binding interface.
A third is synchronous discrete dispatch that honors `preventDefault`; its renderer/latency constraints need
proof before choosing it. Payload-only events are simpler but do not solve native ownership.

Core should define matching, routing and lifetime semantics; backends should map the claim to native routing.
Libraries still decide which keys activate, select, dismiss or navigate. Do not upstream a global Fluent key map.

The contract must distinguish logical `key` from physical `code`, missing or `Unidentified` codes from known
codes, capture from bubble, and preventing a native default from stopping JS propagation.
Unknown-code fallback is an explicit policy, not permission to ignore a conflicting known code.

## Failure and portability

Unsupported native suppression must be reported, not silently treated as success. Claims disappear when the
target detaches; nested claims have a deterministic winner. Specify modifier normalization, repeats, IME and
editing preservation. Down/up pairs interrupted by blur, disable, navigation or unmount must not activate a stale
control. Each activation or movement has one owner.

Desktop, TV remotes and hardware-keyboard mobile can share the contract without sharing key maps.
Other out-of-tree platforms can implement only supported phases/defaults and advertise those limits.

## Validation in core

Build shared matching tables for key/code/modifiers/phases, repeat and unknown codes; run them against props
parsing and event normalization. Renderer fixtures should cover nested scopes, detach, capture/bubble and
down-to-blur-to-up sequences. Reference iOS/Android hardware-keyboard cases should demonstrate that claimed
defaults are suppressed and unclaimed navigation/editing still works.

Out-of-tree implementations run the same fixtures plus native routing tests. Assert one activation or focus
move, not merely receipt of a JS event. Include IME composition, text fields, parent zones, modifiers and repeats.
A keyboard trace for Dropdown Home/End is a useful negative fixture for competing owners.

Evidence: [focus platform evidence](../../../agents/focus/platform-evidence.md),
[shared activation](../../../../packages/framework-base/src/hooks/useFocusablePressable.native.ts),
[ListboxItem keys](../../../../packages/agentic/components/src/components/listbox-item/useListboxItem.ts),
[Windows zone](../../../../packages/agentic/native-core/windows/NativeCore/components/FocusZone/FocusZoneComponentView.cpp).
