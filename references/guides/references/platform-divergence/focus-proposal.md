# Proposal: confirmed focus and optional navigation scopes

[Guide](../../platform-divergence.md) | [Motivating implementations](component-layering.md)

**Hypothetical API research, not an accepted core API.** The gap is an observable focus contract, not simply a
method named `focus`. Core 0.81.6 has text-input focus but no View `focus`/`blur` command; the inspected desktop
packages already route focus to ordinary views. Upstream command declarations are present in
[v0.83.0](https://github.com/facebook/react-native/blob/v0.83.0/packages/react-native/Libraries/Components/View/ViewNativeComponent.js).
Declaration presence is not all-backend support. Extend those emerging commands with outcomes rather than
replacing them without compatibility analysis.

## Status in core 0.88.1

Ordinary-View focus remains behind the `enableImperativeFocus` flag, which defaults to false with no OSS Stable or
Canary override. It is a native flag, so each host must enable it natively; JavaScript overrides cannot set it. Without it, [`ReactNativeElement.focus()`](https://github.com/facebook/react-native/blob/v0.88.1/packages/react-native/src/private/webapis/dom/nodes/ReactNativeElement.js)
focuses only text inputs. With it, Android requests native focus and iOS Views become first responder. iOS Views accept
first responder unconditionally in 0.83.0 through 0.85.x; from 0.86.0 they accept only when the flag is on. Android also
defers focus until attachment (0.83.0). The commands still return void, so callers cannot distinguish confirmed
focus, refusal or a detached target. Default DOM refs add `isConnected` and `contains`, which can check liveness
and containment before a request but cannot confirm its outcome.

RNW 0.85.0 enables the flag in its host. RNmacOS 0.83.0 implements an unconditional AppKit command but routes
Fabric `ref.focus()` to it only when the flag is on, an inferred upgrade risk for FURN's current focus path.
See [core API evolution](core-api-evolution.md).

## Options and ownership

1. Complete ordinary View focus/blur across backends and separate non-text focus from text-input bookkeeping.
   This is the smallest change, but a void return still cannot express refusal or delayed completion.
2. Add an operation on a live mounted target:
   `target.requestFocus({ intent, activation: 'preserve', signal }) -> outcome`.
   The name and shape are illustrative. Prefer additive refs/generated commands or a root-scoped service over
   an unscoped global numeric-tag manager.
3. Add optional native navigation scopes, either through queries plus confirmed focus or a declarative
   `focusGroup` with entry, wrapping and navigation policies. Queries followed by JS commands risk missing the
   synchronous native key-routing window; a full group is a larger contract.

Core would own target lifetime, outcomes and conformance fixtures. Backends would own native traversal,
eligibility, active-window policy and focus movement. Libraries would choose entry/restoration and modality.
First/last/remembered entry should be negotiated separately; none implies modal accessibility isolation.

## Observable contract

Targets are attachment- and root-scoped, with generations that invalidate old requests. Distinguish confirmed,
not-mounted, not-ready, not-focusable, inactive-owner, refused, unsupported, cancelled, stale and timed-out results.
The exact vocabulary needs consolidation with existing APIs. Never resolve confirmed merely because a command
was dispatched or AppKit accepted a request. Native state or a correlated focus event must establish the result.
Already-focused requests need a defined idempotent result, not a requirement for a new event that may never fire.

Cancellation settles the request once; it is not rollback. Replacement, unmount and owner loss invalidate pending
work. Do not steal activation from another application to satisfy a default request. Keyboard focus and
accessibility focus remain separate APIs.

The boundary applies to desktop, TV, hardware-keyboard mobile and other out-of-tree platforms. A platform with
directional spatial navigation need not pretend to support a linear tab order; it can implement the base request
and report unsupported optional traversal.

## Validation in core

| Layer                       | Required contract cases                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Types/codegen               | Existing focus remains compatible; optional methods and discriminated results have stable serialization                |
| JS/fake backend             | Reused targets, ref handoff, duplicate/late events, already-focused requests, cancellation and exactly-once settlement |
| Renderer/native integration | Detach/remount, same-runtime separate roots, refusal, eligibility changes, inactive owner, actual focused identity     |
| Navigation extension        | Reference traversal fixtures for order/RTL/nesting/disabled/hidden nodes; distinguish geometric and linear navigation  |
| Platform suite              | iOS/Android reference implementations plus out-of-tree backends; physical keyboard and platform focus-engine behavior  |

Use core's native-command/codegen seams, renderer tests and RNTester-style platform fixtures.
Mocks can prove request bookkeeping, not native focus. Desktop adapters additionally need field-editor, popup
owner and window-activation cases. A prototype should first settle the minimum outcome contract before adopting
a complete FocusZone API.

Evidence: [focus guidance](../../../agents/focus/common.md),
[platform observations](../../../agents/focus/platform-evidence.md),
[AppKit focus service](../../../../packages/agentic/native-core/macos/shared/FRNNativeCoreFocusService.swift),
[Windows focus service](../../../../packages/agentic/native-core/windows/NativeCore/shared/FocusRequest.h),
[core native commands](https://reactnative.dev/docs/0.81/the-new-architecture/fabric-component-native-commands).
