# Office as a host overlay

[Guide](../../platform-divergence.md) | [Complete historical study](office-source-study.md)

**Evidence boundary:** this article synthesizes the existing Office study at `office/office/Office@8b0baa0708`.
The private monorepo was not accessed during this research. Source identifiers below are navigation aids for
authorized readers, not copied implementation or promises about current deployment.

## What Office adds

Office standardizes feature hosting above different platform hosts. It controls feature identity, which instances
are shared, when they load or close, bundle composition, services, queues, and native containers. It can also
substitute the native UI implementation: the study describes NetUI-backed Paper views on Win32 and a separately
gated Fabric path. This replaces the native Paper UI layer, not React's reconciliation algorithm.

| Layer                       | Historical Office behavior                                                                                                                | Source identifiers in the retained study                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Consumption and builds      | Win32 binaries and architecture-specific channels; Apple source/MDK patches; Android fork, AAR and native toolchain adaptations           | `reactnativehostdetours_win32.cpp`, Apple source project manifests, Android fork patch                           |
| Public host contract        | Logical feature/SDX identity, descriptors, options, bundles, providers, property bags and callbacks                                       | `reactnativehost/public/React.h`, `IReactHost`, `IReactViewHost`                                                 |
| Lifecycle                   | Win32 adaptation of RNW actions versus serialized Apple/Android lifecycle; limited accessors/reload paths and context keepalive           | `ReactHost*`, `InstanceFactory_AndroidApple.cpp`                                                                 |
| Registry and sharing        | Process-wide shutdown, hosts born closed during shutdown, V1 weak sharing/root retention/debounce, Apple V1-to-V2 bridge                  | `ReactHostRegistry*`, `ReactBaseImpl.cpp`, `RNHostV2Registration*`                                               |
| Bundles                     | Foundation/UI/optional OfficeJS/app ordering; split or headless initialization; global facade; Metro externalization and resolver plugins | `sdx/platform/packages/*`, `PlatformJSBundles_*`, `PlatformBundleHelpers_Win.cpp`                                |
| Loading                     | Platform/resource variants, executor wrappers, preloading, bytecode caches and memory maps                                                | `ORNJSExecutorFactory`, `WrapperJSExecutor`                                                                      |
| Services                    | Named native/module/UIManager registries, Reka injection and queue affinity, JSI/runtime installers, image/storage adaptations            | `CxxModuleProviderRegistry`, `ReactPackageProviderRegistry`, `UIManagerProviderRegistry_Win`, `RekaContextProxy` |
| Renderer and containers     | NetUI Paper controls/UIA; opt-in Fabric Composition; TaskPane/Dialog/Callout plus Deferred/Flexbox containers and FlexML interop          | `netui/platform/ui/react`, `coreui/reactcontainers`, `ReactHostWin.cpp`                                          |
| Specialized hosting         | Manifests, assets, RichAPI, activity-pane singleton, headless queued work, Apple roots, Android JNI/delay-load stack                      | `reactnative/officehost`, `reactnative/activitypane`, `jshost/headless`, `reactnative/androidhost`               |
| Scheduling and engines      | Office queues, timers and UI-batch hooks; engine/architecture gates and platform-specific library sets                                    | `FastMessageQueueThread.*`, `ReactHostWin.cpp`, Android and Apple host documentation                             |
| Development and diagnostics | Per-feature discovery/debugging, Metro variants, networking/badges, assertion/error policy, crash reporting and privacy-gated telemetry   | Study sections 11-12 and their source index                                                                      |

This preserves the full taxonomy rather than reducing Office divergence to a Win32 renderer.
The [source study](office-source-study.md) retains all lifecycle subcases, Android stack details, tooling,
upgrade-risk groups, open questions and original source inventory.

## Corrections that matter for layering

Core already has [host/surface lifecycle](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/ReactHost.kt).
Segment registration exists on
[Android](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/bridge/ReactContext.java)
and the [iOS legacy bridge](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/React/CxxBridge/RCTCxxBridge.mm);
Android also has [split-bundle loading](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/bridge/CatalystInstanceImpl.java).
These are platform/architecture-specific seams, not one universal multi-bundle contract.
Office's distinctive contribution is the standardized bundle prefix, shared facade, delivery and lifetime contract,
not the mere existence of more than one bundle.

A feature identity is not proof of a private runtime: the study explicitly describes instance sharing.
Binary consumption does not mean platform producer patches are impossible. A library-set declaration does not
establish that a renderer is deployed. The study also disagrees on Apple JSC provenance and describes different
JavaScript/native version inputs; preserve those as unresolved rather than selecting a convenient interpretation.

## Where FURN meets the overlay

Win32 adapters consume host `RCTCallout`/`RCTFocusZone` registrations, rather than installing FURN's modern native
protocol into that host. Office appearance also arrives through the
[Win32 theming module](../../../../packages/theming/win32-theme/src/NativeModule/getThemingModule.native.ts).
Apple integration must support both CocoaPods modules and Office bridging headers
([Apple integration rules](../../../agents/native/apple-office.md)).

These are integration seams, not qualification shortcuts. A bridging-header build proves a build configuration;
REX behavior proves that test host; neither proves an Office application's lifecycle, service registration,
UI-thread integration, input or assistive technology behavior.

## Revalidation and upgrade gates

Before using this evidence for an implementation, authorized Office owners need to establish current renderer/engine
deployment, actual JS/native version alignment, V1/V2 sharing audiences, module/provider registrability, and
REX-versus-Office behavior. Also recheck private bridge reach-ins, activation detours, Android dynamic linkage,
bundle ordering/version skew, shutdown ownership and shared-UI-thread hooks.

The study records RNW 0.81.38 and RNmacOS JS 0.81.6, compared with FURN's RNW 0.81.35 and patched RNmacOS 0.81.9.
Its Apple native source tag is separately 0.81.9. Those differences require compatibility evidence; FURN's test
lanes do not qualify Office's versions.

Keep Office delivery, feature registration, service naming, telemetry and engine selection host-owned.
Potential core contracts should describe surface identity, lifecycle, readiness and capability outcomes without
requiring Office's internal model.
