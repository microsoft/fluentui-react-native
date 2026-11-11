# Proposals: anchored presentation and surface context

[Guide](../../platform-divergence.md) | [Callout evidence](component-layering.md)

These are **two hypothetical capability families**, not an accepted all-in-one window-management API.
Core already has hosts, surfaces and Modal; build on their lifecycle seams rather than claiming they are absent.

## Anchored secondary presentation

Options are an unstyled `AnchoredSurface`, a lower-level portal/owner protocol implemented by platform popups,
or an anchored Modal presentation. The last option risks importing modal semantics into a nonmodal problem.
A lower-level seam is smaller but leaves interoperability work to libraries.

An illustrative contract accepts a live view anchor or an owner-relative rectangle/point, a presentation identity,
ready/dismissed events, and optional operations. Core would define attachment, layout/event boundaries, lifetime
and outcomes; native backends would own windows, clipping, activation and input. Libraries retain menu/list policy,
styling, entry focus and restoration.

Required behavior should include stale-owner/anchor rejection, closure acknowledgment, reopen generation and
clear distinction between mounted, ready and focused. Native dismissal must not immediately reopen merely because
the controlled open prop has not changed. Unclassified dismissal is honest; fabricated reasons are not.
Cross-boundary event propagation needs a defined rule. Nested ownership must survive child-before-parent closure.

Tab continuation, modal accessibility isolation and rich text-fragment anchors are separately negotiated
capabilities. Unsupported anchors must fail rather than appear at origin; a timeout must not become readiness.
Platforms could map the contract to AppKit windows, Windows islands, tablet popovers, Android popups or
alternative out-of-tree presentation systems without adopting Fluent policy.

### Validation in core

Use renderer/state-machine fixtures for dismiss-before-ready, retained open, double close, replacement, owner
loss and nested cleanup. Add geometry fixtures for RTL, flipping, work-area boundaries, scrolling and scale.
Verify event delivery across presentation boundaries and stale-event rejection. Core native reference adapters
must exercise real attachment and dismissal, with additive compatibility tests for existing Modal.

Every backend then qualifies input, native focus, clipping, mixed DPI, owner activation and repeated
open/close resource cleanup. If modal isolation is advertised, inspect and navigate the native accessibility
tree outside the popup; keyboard cycling is not sufficient.

## Surface context and capabilities

Options are a root-scoped context containing bounds, scale, activity and versioned capabilities, or opaque core
surface handles with opt-in services. A global `Dimensions` value tracking the last active window cannot represent
two differently sized roots reliably.

Separate capability from readiness, focus from active-window state, and unavailable metrics from zero.
Scope capability records to host, renderer and protocol generation; invalidate pending operations on detach or
downgrade. Optional interaction/appearance signals could distinguish Increase Contrast from forced colors and
root activity from application-wide AppState. Do not silently flatten them into one Boolean.

Core owns schema and lifecycle; backends report native signals; applications retain runtime sharing, window
creation and delivery policy. Embedded roots, multiple displays and out-of-tree platforms benefit even without
anchored popups.

### Validation in core

Create two differently sized native roots in one runtime. Resize, rescale, activate and detach each independently;
assert no cross-root leakage. Test delayed events after reload, stale generations, capability downgrade and
unsupported-operation refusal before dispatch. Fake hosts prove bookkeeping; native signal tests prove the
actual metrics/activity boundary. Each optional preference needs an independent native-change fixture.

Evidence: [core ReactHost](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/ReactHost.kt),
[native-core architecture](../../../../packages/agentic/native-core/references/architecture.md),
[native-core remaining gates](../../../../packages/agentic/native-core/references/remaining-work.md),
[Callout facade](../../../../packages/agentic/native-core/src/components/callout/Callout.tsx).
