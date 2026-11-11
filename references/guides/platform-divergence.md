# Platform Divergence and Layering

React Native's desktop platforms share React, layout, and much of the component API with core, but must adapt
input, accessibility, presentation, and hosting to different native systems. Office adds another layer of host
policy and integration. Fluent UI React Native (FURN) turns these capabilities into component behavior; it cannot
make an unsupported native operation real simply by giving every platform the same TypeScript interface.

This human-facing research guide separates those layers and identifies portable contracts worth investigating
upstream. It is **not an implementation plan, approved API, or native qualification report**.
Research date: **November 11, 2026**; FURN baseline: `ae22f89ce6bfa4e56b1f1eccdc6dbe73837cf9f3`.
See [evidence and provenance](references/platform-divergence/evidence.md) for revisions, limitations, and the
dual-model review.

## How the layers fit

```text
Application / Office product
    Component policy: selection, disclosure, labels, focus entry and restoration
FURN components                    Dropdown, Menu, Popover
FURN framework-base + design       activation, focus targets, modality, appearance
FURN native-core                   popup/zone contracts and native adapters
React Native + platform fork        JS surface, renderer, native host integration
Native system                      AppKit/AX or Windows Composition/UIA

Office host overlay ----------------> hosting, bundles, services, queues, containers
                                       and, on Win32 Paper, the native UI layer
Consumer patches -------------------> specific platform implementation fixes
```

These are responsibilities, not a mandatory dependency chain. Office can wrap hosting and replace native UI
infrastructure below FURN. A consumer patch changes the platform implementation directly.

An **endpoint** is a combination of **package version, renderer, and host**. A JavaScript runtime executes code;
a renderer mounts native views; a surface/root contains a tree; a native window or island supplies presentation
and input. They are not interchangeable. A second popup window does not imply a second runtime.

In particular, RNW in a Win32 executable is not `@office-iss/react-native-win32`. Office's historically described
Fabric-on-Win32 configuration reports `windows`; the Office Win32 Paper package reports `win32`.
The [platform article](references/platform-divergence/platform-capabilities.md) explains these boundaries.

## Divergence from core

The comparison below describes source-inspected FURN dependencies, not universal support or execution evidence.
Core is **0.81.6**, macOS **0.81.9 plus FURN's patch**, RNW **0.81.35**, and Win32 **0.81.9**.
Newer upstream research is kept separately; a feature in upstream `main` is not automatically in these releases.

| Area                   | Core baseline                                                 | macOS                                                            | Windows / RNW Fabric                                                     | Office Win32 Paper                                                 |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Focus                  | Text-centric JS bookkeeping; platform-qualified focus props   | AppKit responders, key windows, rings                            | Focus reasons, island entry, native focus search                         | Host focus commands; constrained FURN adapters                     |
| Keyboard               | No generic View key-down/up in inspected 0.81.6 contract      | Handled-key declarations before responder defaults               | Routed events and native handled-key declarations                        | JS declarations over host-owned handling                           |
| Accessibility          | Shared roles, state, actions; projection is platform-specific | AX; FURN patch repairs specific Fabric state/text gaps           | UIA patterns, collection metadata, action dispatch                       | UIA host contract; different action names and some prop spellings  |
| Presentation           | Modal and native host/surface seams already exist             | AppKit child windows; inspected Fabric Modal unavailable         | Window/island/portal hosting; legacy Popup/Flyout are not Fabric support | Baked host Callout, not a general public window manager            |
| Metrics and appearance | Global metrics and platform appearance APIs                   | Window/root distinction, Increase Contrast, AppKit effects       | Island scale/layout, high-contrast resources                             | Host metrics and theming; window dimensions may be unavailable     |
| Editing and services   | Mobile-oriented shared surface                                | Desktop editing, paste/drop, dialogs, app activation adaptations | Desktop keyboard/editing, window chrome and host services                | Host controls and restrictions; exports do not prove functionality |

The [detailed comparison](references/platform-divergence/platform-capabilities.md) retains the broader pointer,
text, scrolling, appearance, service, and module-resolution topics from the original studies.

## Office divergence

Office adds a cross-platform host abstraction, logical feature identity, instance sharing/lifetime rules, ordered
shared bundles, module/service injection, native containers, queue integration, and product-specific diagnostics.
On Win32 Paper it also supplies a native UI layer rather than merely decorating RNW's public views.

Those are **historical findings at Office `8b0baa0708`**, not a fresh Office audit. REX test-host behavior,
Apple bridging-header compilation, and public RNW support do not establish Office application compatibility.
The [Office article](references/platform-divergence/office-hosting.md) explains all major overlay categories,
upgrade risks, and revalidation questions; the complete original study is retained alongside it.

## Component layering

**Callout** illustrates presentation ownership: AppKit popup windows, Windows popup islands, and a constrained
Win32 host adapter share a facade but differ in anchors, readiness, dismissal, commands, and Tab continuation.
**FocusZone** illustrates native navigation: traversal and remembered entry are not identical, and a zone is not
modal accessibility isolation. **Dropdown** composes those primitives with selection, entry focus, option semantics,
and shared popup policy. Its actual option focus is not an implemented active-descendant abstraction.

The [component case studies](references/platform-divergence/component-layering.md) trace source files and recent
Dropdown history, explain platform-file and capability-based adaptation, and retain source-inferred verification
questions separately from confirmed defects.

## Potential extensions to core

The useful upstream boundary is an observable capability, not a Fluent component or Office-specific host.
Each proposal below includes API options, unsupported behavior, and a core validation contract.

| Candidate                        | Portable boundary                                                   | Detailed research                                                                                          |
| -------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Confirmed focus and navigation   | Live mounted targets, refusal, cancellation; optional native groups | [Focus](references/platform-divergence/focus-proposal.md)                                                  |
| Keyboard ownership               | Which native default a committed key declaration consumes           | [Keyboard](references/platform-divergence/keyboard-proposal.md)                                            |
| Accessibility semantics/actions  | Consistent declarations, native projection and actual invocation    | [Accessibility](references/platform-divergence/accessibility-proposal.md)                                  |
| Anchored presentation            | Owner-scoped anchors, readiness, closure, stale-event handling      | [Surfaces and hosts](references/platform-divergence/surfaces-proposal.md)                                  |
| Surface capabilities and metrics | Root-scoped bounds/activity, explicit unsupported capabilities      | [Surfaces and hosts](references/platform-divergence/surfaces-proposal.md#surface-context-and-capabilities) |

**Research direction, not an accepted roadmap:** establish versioned focus, keyboard, and semantic conformance
fixtures before standardizing a large popup API. Keep application selection/restoration policy, Fluent tokens,
Office feature delivery, runtime sharing, and telemetry outside core. Mobile reference implementations plus shared
out-of-tree conformance cases should validate the contract; desktop-only mocks are not sufficient.
