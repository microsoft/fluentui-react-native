# Office React Native Divergence: Hosting, Instance Management, and Platform Overrides

> **Retained historical source study.** The current research did not access the Office monorepo.
> "Observed" below describes the original investigation, not independent revalidation here.
> Read [Office hosting](office-hosting.md) for reconciled conclusions and explicit open gates.
> Original prose and source identifiers are retained; they are not public implementation or deployment guarantees.
>
> **Reconciliation:** broad contrasts below such as "one host per app", process-exit-only lifetime, single-bundle
> loading, or an inability to patch a binary dependency are not universal core/platform constraints.
> Core has host/surface lifecycle and split-bundle seams; Office's distinctions are its standardized policy and
> consumption model. Native 0.81.9 and JS 0.81.6 are separate inputs, while the study's third-party-versus-system
> JSC descriptions remain inconsistent. See [the corrected synthesis](office-hosting.md#corrections-that-matter-for-layering).

**Baseline:** Office monorepo `office/office/Office`, `main` @ `8b0baa0708`
**Scope:** Places where Office code replaces, wraps, patches, or extends the platform layers of
`react-native-windows` / `react-native-win32` (Win32), `react-native-macos` (macOS and iOS), and
Office's React Native fork (Android). The emphasis is conceptual, with particular attention to
**React Native hosting and instance management**. It is not a line-item diff.
**Companion studies:** [Windows](windows-source-study.md) and [macOS](macos-source-study.md).

**Evidence legend**

| Label        | Meaning                                                                |
| ------------ | ---------------------------------------------------------------------- |
| **Observed** | Read in source, build files, or Office-owned docs at the baseline.     |
| **Inferred** | Reasoned from observed structure; not directly stated in code or docs. |
| **Open**     | Not established; see [Open questions](#16-open-questions).             |

> The local enlistment is a sparse checkout. Most files were read with `git show HEAD:<path>` or
> the Bluebird index. Paths are repo-relative.

---

## 1. Executive summary

Office does not hand applications React Native's own host APIs (`ReactNativeHost`/`ReactInstanceSettings` on
Windows, `RCTBridge`/`RCTRootView` on Apple, `ReactInstanceManager`/`ReactHost` on Android). Instead
it puts a **cross-platform Office hosting layer, `Mso::React` (project `reactnativehost`)**, between
apps and React Native. Each platform implementation then specializes or overrides the underlying
React Native host. These are the biggest conceptual divergences:

1. **One Office hosting contract over three different React Native hosts.** _Observed._
   - Apps program against `IReactHost`, `IReactViewHost`, `IReactInstance`, and `IReactViewInstance`,
     configured by `ReactOptions` (also called `SDXDescriptor`).
   - Win32 implements them over RNW's WinRT `ReactNativeHost`.
   - Apple implements them over an Office subclass of `RCTCxxBridge`.
   - Android implements them over Office's fork of `ReactInstanceManager`/`ReactHostImpl`.
2. **An identity-keyed "SDX" model.** _Observed._
   - Every React Native experience is an _SDX_: an identity, a base path, an ordered list of JS bundles,
     native module providers, callbacks, dev options, and a property bag.
   - SDXs can be registered process-wide (`RegisterSDX`).
   - Office keeps a legacy V1 path ("get or create instance by identity") on Android and Apple, and a
     V2 path (an explicit host object) on all platforms.
3. **Office owns instance lifetime.** _Observed._
   - Load, unload, and reload are serialized, asynchronous actions that return `Mso::Future`s.
   - A process-wide `ReactHostRegistry` force-closes every host at liblet shutdown.
   - V1 instances on mobile and Apple are kept alive by their root views and a debounce period.
   - Upstream React Native has no comparable process-wide shutdown model.
4. **Shared platform bundles plus per-SDX app bundles.** _Observed._
   - Office splits JS into shared _platform bundles_ (`foundation`, `ui`) and per-SDX _app bundles_.
   - Native code evaluates the platform bundles into the runtime before React Native loads the app bundle.
   - Metro config and serializer plugins strip the duplicated prelude from app bundles.
   - Upstream React Native assumes one bundle per instance.
5. **Reka, Office's own JS↔native service bridge.** _Observed._
   - Reka is injected into every instance, as a TurboModule (`RekaBridge`) or a legacy module.
   - Office-curated module-provider registries sit alongside it.
   - Together they are the main channel to Office services, beside React Native's own module system.
6. **On Win32, Office owns the UI layer.** _Observed._
   - Under the legacy (Paper) architecture, the default `IUIManager` provider is **NetUI**, Office's
     native UI framework. NetUI ships about 285 React Native files: view managers, shadow nodes, and modules.
   - Fabric is opt-in per SDX through Composition. It forces Hermes, marks the instance bridgeless,
     and reports the platform name as `"windows"`.
7. **Each platform gets React Native differently.** _Observed._
   - Win32 consumes a prebuilt `react-native-win32.dll` from NuGet and **detours WinRT activation** to load it.
   - Apple builds `react-native-macos` `v0.81.9` from source, patched after copy, using JSC and the old architecture.
   - Android uses Office's fork `react-native-mobile` `0.81.5-office.1`, with a JNI delay-load proxy.
8. **Office infrastructure replaces React Native defaults.**
   - Office dispatch queues replace React Native's threads.
   - ChangeGate feature gates select the engine, transport, and architecture.
   - "YarnZen" developer-loop discovery uses named mutexes and file mappings.
   - Errors and logs go to Office telemetry and Watson.
   - The RedBox is Office-hosted, and an Office HTTP User-Agent is applied.

---

## 2. Layer model

```
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ Office app features (Word/Excel/PPT/Outlook panes, Copilot UI, Loop, ...)     │
 │   ├─ ReactContainers (coreui/reactcontainers): TaskPane / Dialog / Callout   │
 │   ├─ OfficeHost (reactnative/officehost): manifest, RichAPI, config helpers  │
 │   └─ Bespoke hosts (e.g. reactnative/activitypane)                           │
 ├──────────────────────────────────────────────────────────────────────────────┤
 │ Mso::React public API  (reactnativehost/public/React.h)                      │
 │   ReactOptions/SDXDescriptor · IReactHost · IReactViewHost · IReactInstance  │
 │   RegisterSDX · MakeReactHost · GetOrCreateReactInstance (V1, Android/Apple)  │
 ├───────────────────────┬──────────────────────────┬───────────────────────────┤
 │ Shared core            │ Shared core               │ Shared core               │
 │ ReactHostRegistry, SDXRegistration, ChangeGate, InstanceFactory, bundles,     │
 │ AsyncActionQueue, FastMessageQueueThread, CxxModuleProviderRegistry           │
 ├───────────────────────┼──────────────────────────┼───────────────────────────┤
 │ Win32                  │ Apple (mac + iOS)         │ Android                   │
 │ ReactHostWin           │ ReactHostApple / ORNHost  │ ReactHost (ActiveObject)  │
 │  over RNW WinRT        │  ORNReactHostBridge →     │  + OfficeReactNativeHost  │
 │  ReactNativeHost       │  ORNRCTCxxBridge          │  (Java/Kotlin), JNI       │
 │ NetUI UIManager (Paper)│ ORNV2RootView / RCTRootView│ OfficeReactRootView      │
 │ Composition (Fabric)   │ ORNJSExecutorFactory (JSC)│ DelayLoadProxy            │
 │ WinRT activation detour│ post-copy source patches  │                           │
 ├───────────────────────┼──────────────────────────┼───────────────────────────┤
 │ react-native-win32.dll │ react-native-macos 0.81.9 │ react-native-mobile fork  │
 │ (OfficeReact.Win32     │ built from source via MDK │ 0.81.5-office.1 (NuGet    │
 │  NuGet, RNW 0.81)      │ + rnx-kit host (patched)  │  AAR / .so)               │
 ├───────────────────────┼──────────────────────────┼───────────────────────────┤
 │ V8 (default) / Hermes  │ JavaScriptCore            │ Hermes                    │
 │ (Fabric) / Chakra      │ (third-party JSC)         │                           │
 └───────────────────────┴──────────────────────────┴───────────────────────────┘
 JS side: sdx/platform/packages/* — platform-bundles, sdx-metro-config,
          metro-plugin-appbundle, reka-react-native
```

_Observed:_ the per-platform file split comes from `reactnativehost/sources.inc`, which defines
`SOURCES_SHARED`, `SOURCES_WIN32`, `SOURCES_APPLE`, and `SOURCES_ANDROID`.

- The generic `ReactHost.cpp` ActiveObject is compiled **only for Android**.
- Apple compiles `ReactHostApple.mm`. Win32 compiles `ReactHostWin.cpp`.

---

## 3. How Office obtains React Native on each platform

| Platform                      | What Office consumes                                                                                                                                           | How it diverges from "stock" consumption                                                                                                                                                                                                                                                                                                                                                                            | Evidence                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Win32**                     | Prebuilt `react-native-win32.dll` (`OfficeReact.Win32` NuGet, ARM64EC on arm64), plus `Hermes` and `V8JSI` NuGets.                                             | Uses no MSBuild or app-package model. RNW's WinRT classes are activated **without registration**: Office detours `RoGetActivationFactory` and `RoActivateInstance`. For `Microsoft.ReactNative.*` class IDs it loads `react-native-win32.dll` and caches its factories. Office also adds React Native DLL directories, a `msoFolly.h` macro shim, and curated folly headers.                                        | `reactnativehost/reactnativehostdetours_win32.cpp`, `opensource/reactnative/`                        |
| **Win32 (arm64 SDK)**         | `opensource/reactnativesdk` arm64 binary from `microsoft/continuity`.                                                                                          | Separate binary channel for one architecture.                                                                                                                                                                                                                                                                                                                                                                       | `opensource/reactnativesdk/arm64/readme.txt`                                                         |
| **macOS / iOS**               | `react-native-macos` **source**, tag `v0.81.9`, built for `mac` and `ios`.                                                                                     | Built by Office's MDK, not CocoaPods. The flags `RCT_NEW_ARCH_ENABLED=0`, `USE_HERMES=0`, and `USE_THIRD_PARTY_JSC=1` mean the old architecture on community JSC. `external-update-post-copy.sh` patches the imported tree: SwiftPM prep, JSI inclusion, de-boosted Office Folly copies, a bounded `strlcpy` in glog, format-header substitutions, and generated codegen. SwiftPM is then converted to MDK targets. | `mbu/projects/opensource_react_native_macos.plist`, `opensource/react_native_macos/`                 |
| **macOS / iOS (host helper)** | `@rnx-kit/react-native-host`, imported.                                                                                                                        | Two Office patches: a warning fix and a conditional `RCTCxxBridgeDelegate.h` import under `USE_BRIDGELESS`.                                                                                                                                                                                                                                                                                                         | `opensource/rnx_kit_react_native_host/OFFICE.md`                                                     |
| **Android**                   | Office **fork** `react-native-mobile` `0.81.5-office.1`, based on Meta 0.81.6. Ships as NuGet-packaged AAR and `.so` files.                                    | The fork exposes internals Office's host needs: a separate `createModuleRegistry` step, an `onModuleRegistryCreated` hook (for `RekaBridge`), `CxxNativeModule::Make`, `PlatformBundleInfo`, and `ReactViewFocusEvent`. It also moves to C++23, overlays about 15 Folly headers, and can strip `.so` files from the AAR (`excludeLibs`).                                                                            | `reactnativehost/.ai/react-native-mobile.md`, `reactnativehost/.ai/office-vs-meta-0.81-stable.patch` |
| **Community modules**         | `opensource/react_native_{async_storage,clipboard,datetimepicker,javascriptcore,netinfo,svg,webview}`                                                          | Imported into the monorepo build instead of resolved through npm autolinking.                                                                                                                                                                                                                                                                                                                                       | `opensource/` listing                                                                                |
| **JS**                        | React 19.1.4, RN 0.81.6, `react-native-windows` 0.81.38, `@office-iss/react-native-win32` 0.81.9, `react-native-macos` 0.81.6, Metro 0.83.3 (rnx-kit-aligned). | Metro is customized for platform and app bundles (§6).                                                                                                                                                                                                                                                                                                                                                              | `sdx/platform/packages/*`                                                                            |

_Observed:_ `opensource/reactnative_macos/` also exists and holds only repo scaffolding (changelogs,
`nx.json`, scripts). _Inferred:_ it is a legacy or tooling remnant; the build plist points at
`opensource/react_native_macos`.

_Inferred (key consequence):_ each platform faces a different kind of divergence.

- **Win32 cannot patch React Native source.** RNW arrives as a binary, so all divergence happens in
  host code, through RNW's public extension points: property bags, `ReactCoreInjection`, and package
  providers.
- **Apple and Android can patch.** Office patches and subclasses React Native internals directly, through
  post-copy scripts, private headers, or the fork.

---

## 4. The Office hosting contract (`Mso::React`)

### 4.1 What Office adds over the React Native host APIs

_Observed_ in `reactnativehost/public/React.h`.

| Office concept                               | Closest upstream concept                                                                                              | Office-specific additions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ReactOptions` (alias `SDXDescriptor`)       | RNW `ReactInstanceSettings`; Apple `RCTBridge` init args; Android `ReactInstanceManagerBuilder` / `ReactHostDelegate` | **Identity** (the SDX name, used as a registry key and telemetry dimension). **`SDXBasePath`**. An **ordered list of JS bundles** in four flavors: registered, file, dynamic (in-memory), and bundle-server. Per-platform module provider lists, including Apple TurboModule registrations. **Reka** callbacks and a provider factory. Error, JS-exception, and logging callbacks (`OnError` defaults to a ship assert). Instance created, loaded, and destroyed callbacks. Bytecode enablement. A typed **property bag**, which carries dispatch queues, versions, and service-delivery flags. Engine and architecture switches: `WindowsUseFabric`, `UseTurboModulesOnly`, `UseV8NodeApi`. `EnableSensitiveTelemetry`. |
| `IReactHost`                                 | RNW `ReactNativeHost`; Android `ReactHost`                                                                            | Returns `Mso::Future`s from `ReloadInstance`, `ReloadInstanceWithOptions`, and `UnloadInstance`. Exposes a **`RekaContext()` that is usable before the instance exists**, because a proxy buffers calls. Tracks its **view hosts** (`MakeViewHost`, `GetViewHostList`). Has a declared native queue.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `IReactViewHost` / `IReactViewInstance`      | RNW `ReactRootView`; Apple `RCTRootView` / `RCTSurface`; Android `ReactRootView`                                      | Separates the logical view (component name and initial props) from the native view instance. Supports attach, detach, reload, and unload on the host queue, so views survive instance reloads.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `IReactInstance` (V1)                        | Apple `RCTBridge`; Android `ReactInstanceManager`                                                                     | `NeedsReload`/`SetAsNeedsReload` lets a stale instance stop being served to new views.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `RegisterSDX` / `GetRegisteredSDXDescriptor` | _(none)_                                                                                                              | A **process-wide catalog of SDX descriptors**, keyed by identity. On Android, Java and C++ registrations are merged, and C++ wins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `GetRegisteredV2ReactHost(identity)`         | _(none)_                                                                                                              | Under parallel V2 registration, exactly **one shared host per identity**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `GetOrCreateReactInstance(identity)`         | _(none)_                                                                                                              | The V1 "get or create a shared instance by identity" API. `PUBLICAPI_EX(android, apple)`, so it is **not exported on Win32**. Marked "do not introduce new uses".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `GetRuntimeExecutor2(instance)`              | `RuntimeExecutor`                                                                                                     | Gives Office native code direct JSI access to an instance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 4.2 SDX: the unit of hosting

_Observed._

- The Office unit of React Native hosting is the **SDX**. Each SDX gets its own descriptor, its own host,
  and its own runtime and instance.
- Apps that use `coreui/reactcontainers` or `reactnative/officehost` normally do not build
  `ReactOptions` by hand. They call helpers that:
  - read an **SDX manifest**,
  - resolve **Click-to-Run** (in-box) or **service-delivered** package locations,
  - add the shared **platform bundles**,
  - and, optionally, add **OfficeJS** (`TryConfigureOfficeReactOptionsUsingPath`, `...UsingPackageSolution`).

_Inferred:_

- **Isolation.** Upstream React Native expects about one host per app. Office expects **many independent
  hosts per process**: task panes, dialogs, callouts, Copilot surfaces, activity panes, and headless SDXs.
  Each is isolated by identity.
- **Lifecycle machinery.** Many hosts per process is what drives the registry, shutdown, debounce, and
  telemetry machinery below.

---

## 5. Instance management and lifecycle

### 5.1 Three implementations of one lifecycle

_Observed._ The build split is in `reactnativehost/sources.inc`.

| Platform | `IReactHost` implementation                                                       | Lifecycle engine                                                                                                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Android  | `ReactHost` (`reactnativehost/ReactHost.cpp`), compiled only in `SOURCES_ANDROID` | `Mso::ActiveObject` on a sequential native queue. An **`AsyncActionQueue`** serializes load, unload, and reload, with unload-action IDs and cancellation.                                                                              |
| Apple    | `ReactHostApple` (`reactnativehost/ReactHostApple.{h,mm}`)                        | Also an `Mso::ActiveObject` with an `AsyncActionQueue` (`LoadInQueue`, `UnloadInQueue`, `PendingUnloadActionId`). It drives an `ORNReactHostBridge`.                                                                                   |
| Win32    | `ReactHostWin` (`reactnativehost/ReactHostWin.cpp`)                               | **Not** an ActiveObject. It is a thin facade over RNW's WinRT `ReactNativeHost`. RNW's `ReloadInstance` and `UnloadInstance` `IAsyncAction`s are adapted into `Mso::Future`s, with an `AutoCancelPromise` so abandoned futures cancel. |

_Observed Win32 consequences:_

- **`MakeReactInstance` crashes on Windows.** It is the generic factory that builds an instance, and
  `InstanceFactory_Win.cpp` makes it `VerifyElseCrash`. All Win32 hosting goes through `MakeReactHost`.
- **`ReactHostWin::Instance()` and `ReactHostWin::NativeQueue()` assert and are unsupported.** Win32
  callers cannot reach the instance or the queue through `IReactHost`.
- **`ReloadInstanceWithOptions` reloads with new developer settings only.** It changes only the bundle
  host and port, direct debugger, break-on-next-line, and fast refresh. It does not apply new options
  in general.
- **Host data is attached to the RNW context.** `RNHostData` (options, Reka proxy, callbacks) lives in
  RNW's `ReactPropertyBag`. A keep-alive property is set on `InstanceCreated` and cleared on
  `InstanceDestroyed`. This way RNW's own context lifetime keeps Office's host data alive.
- **The native queue is resolved, not created.** `ReactHostWin::GetNativeQueue` uses the
  `NativeDispatchQueue` property if set (and requires it to be sequential). Otherwise it uses the current
  queue. If that queue is concurrent, it creates a background sequential queue.

_Inferred:_ on Win32, RNW owns the serialization of instance operations. On Android and Apple, Office
owns it. As a result, edge cases may behave differently across platforms: a reload during an unload,
or calls after close.

### 5.2 Process-wide host registry and shutdown

_Observed:_ `reactnativehost/ReactHostRegistry.{h,cpp}`, plus platform variants.

- **Every host registers globally.** Each `IReactHost` registers in `ReactHostRegistry` when created and
  receives a close promise. On Win32, `ReactHostWin::Close()` fulfills that promise with the
  `UnloadInstance()` future.
- **Shutdown closes everything.** When the `reactnativehost` liblet uninitializes:
  - The registry enters an _uninited_ state.
  - Any host created afterward is **born closed**.
  - Every live host is closed through the private `IClosableReactHost::Close`.
  - Uninit then **blocks until all hosts finish unloading**.
- **Blocking differs per platform:**
  - Win32 and Android: `Mso::FutureWait` (`ReactHostRegistry_WinAndroid.cpp`).
  - Apple: pumps `CFRunLoopRunInMode` in 5 ms slices until the close future completes
    (`ReactHostRegistry_Apple.mm`). The comment there explains that React Native shutdown posts work to
    the main queue, and Office shuts down on the main thread, so a plain wait would deadlock.
- **Feedback telemetry.** The registry enumerates running hosts (identity, version, service-delivered
  flag) and attaches them to OCV feedback (`ReactHostSDXTelemetryInfo`). Win32 implements this; on
  Apple it logs "not supported".
- **Gated.** The registry is controlled by the `UseReactHostRegistryGate` ChangeGate (`ChangeGate.h`).

_Inferred:_ upstream React Native relies on the app process to tear hosts down. Office needs
deterministic teardown, because Office liblets have strict init/uninit ordering and React Native
instances hold Office services. This is one of the clearest **Office-only lifecycle obligations**.

### 5.3 V1 shared instances (Android and Apple)

_Observed:_ `reactnativehost/InstanceFactory_AndroidApple.cpp` and `reactnativehost/ReactBaseImpl.cpp`.

- **Lookup by identity.** `GetOrCreateReactInstance(identity)` keeps a process-wide list of **weak**
  instance references. It serves the newest instance whose bundle name matches and that is **not marked
  `NeedsReload`**. Otherwise it creates a new instance from the registered SDX descriptor.
- **Root views keep instances alive.** The instance lives while any root view (Android
  `OfficeReactRootView`; Apple `ORNRootView` through `ORNInstanceManager`) is attached.
- **Debounce.** When the last root view detaches, a **debounce timer** keeps the instance alive for a
  further period: 1000 ms by default, adjustable in tests. The period is skipped when the instance needs
  a reload. A ChangeGate, `ReactNativeHost.SkipDebounceTimerCancelOnDetach`, avoids a JNI timer-cancel
  path on Android.
- **Monitoring.** A periodic monitor timer walks the live instances and emits instance-count traces.

_Inferred:_

- **This model is Office's own.** React Native has no instance shared by identity, refcounted by views,
  and debounced.
- **It explains Win32.** It is the main reason V1 was never ported to Win32, where RNW's
  `ReactNativeHost` was already host-centric.

### 5.4 V1→V2 bridge ("parallel V2 registration")

_Observed:_ `reactnativehost/RNHostV2Registration.h` and `reactnativehost/apple/RNHostV2Registration_Apple.mm`.

- **Apple only, gated.** On Apple, a feature gate (`ReactNativeHost.SDXRegistration.ParallelV2Registration`,
  scoped to `Audience::Automation`) turns on a registration that **creates exactly one V2 `IReactHost`
  for each registered SDX**.
- **V1 is redirected.** When this is active, V1 `GetOrCreateReactInstance` returns `reactHost->Instance()`
  from that shared V2 host instead of building a V1 instance.
- **Android and Win32 have no real implementation.** They compile `RNHostV2Registration_EmptyImpl.cpp`.
- **Stated trade-off.** The header comment says sharing one host per SDX gives up independent hosts,
  a key V2 benefit, but lets partners migrate.

_Inferred:_ at the baseline, V2 is the target model everywhere. Apple is mid-migration, and the bridge
is exposed only to automation audiences.

### 5.5 Reka before load

_Observed:_

- `IReactHost::RekaContext()` returns a **`RekaContextProxy`**. Native code can create Reka proxies and
  services before the JS runtime or Reka bridge is up.
- `IClosableReactHost::SetNotifyRekaInitializedBeforeLoad()` (Apple) lets a host signal Reka
  initialization ahead of bundle load.
- On Win32, `RNHostData` owns the proxy, and it is connected when the Reka package provider initializes.

_Inferred:_ this lets Office features wire native services to a host as soon as they create it, without
waiting on asynchronous instance load. That is an Office ergonomics layer with no React Native
equivalent.

---

## 6. The platform-bundle model

Upstream React Native loads **one** bundle per instance, and that bundle carries its own copy of
`InitializeCore`, React, and React Native. Office replaces this with an **ordered list of bundles**
in `ReactOptions::JSBundles`. Every bundle except the last is preloaded into the JS runtime, and the
last one is the SDX's app bundle.

### 6.1 What goes into the runtime, in order

| Order | Bundle                                              | Who adds it                                                                                         | Purpose                                                                                                       |
| ----- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1     | **SDX Foundation** (`foundation.<platform>.bundle`) | `AddPlatformBundles` (OfficeHost), the headless runtime, the activity pane, or the app              | React Native core without UI: globals, timers, XHR, error handling, the batched bridge, and the Reka facades. |
| 2     | **SDX UI** (`ui.<platform>.bundle`)                 | Same, except hosts that skip it (e.g. the activity pane)                                            | `AppRegistry`, LogBox configuration, and the platform component library.                                      |
| 3     | **OfficeJS bundle** (optional)                      | `ConfigureOfficeReactOptions` when the manifest requests RichAPI; the headless runtime per OSF host | The Office.js object model, connected to the instance through Reka.                                           |
| last  | **App bundle**                                      | The SDX's manifest or path                                                                          | Feature code only. React and React Native are resolved from the globals above.                                |

_Observed:_ `reactnative/officehost/OfficeHost.cpp` (`AddPlatformBundles`, `ConfigureOfficeReactOptions`),
`jshost/headless/JSHeadlessRuntimeImpl.cpp`, `reactnative/activitypane/src/ReactNativeActivityPaneRuntime.cpp`.

### 6.2 JS side: splitting React Native's own initialization

- **`InitializeCore` is split in two.** _Observed._
  - `platform-bundles/foundation/src/InitializeFoundation.ts` copies React Native's `InitializeCore`
    but leaves out `AppRegistry`, so a **headless** instance never initializes `UIManager` or other UI code.
  - `platform-bundles/ui/src/InitializeUI.ts` adds `AppRegistry` back and installs a LogBox ignore list.
    The list covers the legacy JSX transform warning, the "Legacy Architecture" warning, and the
    `SafeAreaView` deprecation.
- **A global facade (`OfficePlatformGlobal`) replaces module resolution.** _Observed._
  - The foundation entry exports a `Bundle` facade with getters for Reka, ReactNativeReka, and React
    Native internals (`BatchedBridge`, `MessageQueue`, `NativeModules`, `JSTimers`,
    `TurboModuleRegistry`, `AsyncStorage`, and others).
  - Some getters exist only for compatibility with app bundles built with pre-0.81 tooling, which
    expect CommonJS default exports. They sit next to `...V2` variants.
  - `sdx-platform-bundle-externals` maps package imports to these globals, e.g. `@ms/oteljs` →
    `OfficePlatformGlobal.Telemetry.OTel`.
  - `sdx-metro-config` (`withSdxResolver`) redirects imports at app-bundle build time.
    `metro-plugin-appbundle` adds the prelude that app bundles need, and `metro-plugin-noprelude`
    removes the default prelude.
- **Per-platform UI entries.** _Observed._
  - `ui.win32.ts`, `ui.windows.ts`, `ui.ios.ts`, `ui.android.ts`, and `ui.native.ts`.
  - The `windows` entry (Fabric on Win32) exports `react-native-windows` and **patches it so that
    `ViewWin32` resolves to `View`**, which lets SDXs written against `@office-iss/react-native-win32`
    run under Fabric.
- **Bundle-size stubs.** _Observed._
  - `StubbedToReduceBundleSize.js` removes unused code.
  - `StubbedPaperRendererForFabric.js` keeps a stub `unstable_batchedUpdates`, because react-redux
    before v9 imports it from the Paper renderer.
- **Diagnostic root wrapper.** _Observed._ `OfficeWrapperComponent.tsx` calls
  `AppRegistry.setWrapperComponentProvider`. When the host passes `__useOfficeRootComponentWrapper` in
  the initial props, the wrapper overlays "Fabric/Paper" and "Hermes/not Hermes" badges on every root.
- **Version pinning.** _Observed._ The foundation package (`@office-iss/sdx-platform-bundle-foundation`
  10.0.12) declares peer dependencies on React 19.1.4, `react-native` 0.81.6, `react-native-macos`
  0.81.6, and `react-native-windows` 0.81.38. The platform bundles are therefore built against one
  React Native version per Office release, and every app bundle must match it.

### 6.3 Native side: delivering and preloading the platform bundles

- **A named-bundle registry.** _Observed._ Hosts call `Mso::React::GetJSBundles({SDXFoundation, SDXUI})`.
  Each platform supplies its own table in `jshost/officepal/PlatformJSBundles_{win32,mac,ios,android}.*`,
  for example `foundation.macos.jsbundle` or `ui.android.bundle`.
- **Win32 embeds the bundles as resources with three variants.** _Observed._
  - `PlatformJSBundles_win32.cpp` loads the bundles from `RT_RCDATA` resources in the Office UI
    resource DLL.
  - Each bundle has a plain JS resource, a **Hermes bytecode** resource (`*_HBC`), and a **Fabric**
    resource (`IDR_SDXPLATFORM_WINDOWS_*`, the `windows` platform build).
  - The variant is chosen per instance from the `fabric` and `hermes` options. The code also handles
    the null-termination differences between Hermes text and bytecode inputs.
- **Win32 preloads in `InstanceCreated`.** _Observed (`ReactHostWin.cpp`)._
  - `MakePlatformBundleInfos` builds the list. Every bundle except the last is evaluated with
    `runtime.evaluateJavaScript`: synchronously through `GetOrCreateContextRuntime` under Fabric, or
    through `ExecuteJsi` under Paper.
  - Each bundle gets its own LoadBundle telemetry activity. The file name is included only when
    sensitive telemetry is enabled. Failures go to `ReportPlatformBundleException`.
  - The last bundle becomes RNW's `JavaScriptBundleFile`, made relative to `BundleRootPath`, which is
    the SDX base path.
  - In development, platform bundles come from Metro at
    `http://localhost:8081/<url>?fabric=…&flavor=debug|ship&buildPlatform=x86|x64|arm64`.
- **Android wraps the executor.** _Observed (`reactnative/android/host/.ai/index.md`)._
  `WrapperJSExecutor` wraps the Hermes executor. Its `loadBundle()` loads every platform bundle
  through the base executor, then the main bundle, and calls `JSExecutorObserver` callbacks
  (`OnBundleLoaded`, `OnInitialized`). The fork's `PlatformBundleInfo` type carries the list.
- **Apple wraps the executor factory.** _Observed._ `ORNJSExecutorFactory` (`MakeORNJSExecutorFactory`)
  wraps the JSC executor factory with the same preload step.
- **Bytecode and memory mapping.** _Observed._
  - `ReactOptions::EnableBytecode` comes from the manifest (`runtime.byteCodeCaching`).
  - On Win32, file bundles are memory-mapped (`FileMemoryMapJSBundle_Win32`), and `BytecodeHelpers`
    derives bytecode cache paths.

_Inferred:_ this is the deepest JS-level divergence from upstream React Native.

- React Native's "one bundle, one instance" assumption is replaced by a **shared runtime prefix**.
- The benefit is smaller app bundles, cheaper instance startup, and a single place for Office
  polyfills.
- The cost is that every app bundle silently depends on the exact React Native version and module
  layout of the platform bundles that ship with the host (§15).

---

## 7. Native module injection and Reka

Upstream React Native configures native modules per app: package lists and autolinking on Android,
`RCTBridgeModule` registration on Apple, and `IReactPackageProvider`s on Windows. Office replaces
this with **process-wide, name-keyed provider registries**. An SDX selects providers by name in its
options.

### 7.1 Provider registries

| Registry                                                                                                              | Platform | Role                                                                                               | Evidence                                |
| --------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `CxxModuleProviderRegistry`                                                                                           | All      | Named providers of C++ (`CxxModule`) modules. `ReactOptions::CxxModuleNames` selects them per SDX. | `reactnativehost/sources.inc` (shared)  |
| `ReactPackageProviderRegistry`                                                                                        | Win32    | Named RNW `IReactPackageProvider`s. C++ module providers are also wrapped as package providers.    | `SOURCES_WIN32`                         |
| `UIManagerProviderRegistry_Win`                                                                                       | Win32    | Named `IUIManager` factories; the default is NetUI (§8.1).                                         | `SOURCES_WIN32`                         |
| `ORNBridgeModuleProviderRegistry`, `ORNTurboModuleManagerDelegate`, `ORNModuleRegistration`                           | Apple    | Office's module registration on top of `RCTCxxBridge` and the TurboModule manager.                 | `SOURCES_APPLE`                         |
| `RNXTurboModuleManagerDelegate`, `UserCxxTurboModuleProvider`, `UserJavaTurboModuleProvider`, `RNXComponentsRegistry` | Android  | Combine TurboModules from many C++ and Java providers, and register Fabric component descriptors.  | `reactnative/android/host/.ai/index.md` |

_Observed (Win32 extras):_

- Async-storage C++ modules are remapped to TurboModules.
- An Office image module (`NameXImage`) is registered.
- Office values go into the instance property bag: the UI queue, a weak `ReactHostProperty`, and a
  `JSHostPropertyBagProperty`. Office native modules use them to find their host.

### 7.2 Reka

Reka is Office's own JS↔native data-service bridge. Every instance gets it, independent of what the
SDX declares.

- **Win32.** _Observed._ `RekaTurboPackageProvider` registers a `RekaBridge` **TurboModule** when the
  instance uses Fabric or is TurboModules-only. Otherwise the legacy `RekaPackageProvider` (a
  CxxModule) is used. Its initialization connects the host's Reka context proxy (§5.5).
- **Android.** _Observed._ `reactnative/androidhost` implements `RekaBridge` twice: `RekaNativeModule.cpp`
  (a CxxModule, old architecture) and `RekaTurboModule*` (new architecture). The fork adds an
  `onModuleRegistryCreated` hook so that Office can inject the module after React Native builds its
  registry. To create Reka instances, `androidhost` calls back **up** into `libsdxruntime.so`
  through `dlsym`. As a result, the two libraries resolve each other at runtime.
- **Apple.** _Observed._ Reka is registered through Office's bridge module registry and TurboModule
  delegate.
- **JS.** _Observed._ `reka-react-native` (`ReactNativeReka.ts`) resolves `RekaBridge` through
  `TurboModuleRegistry`. The foundation bundle exposes it as a global facade.
- **Thread affinity.** _Observed._ In `ConfigureOfficeReactOptions`, the `OnInitialized` callback sets
  the Office Reka queue property to the SDX's UI queue, so Reka objects run on the UI thread unless the
  host overrides that.

### 7.3 JSI-level hooks

_Observed:_

- `JsiRuntimeInstallerProperty` lets a host run code directly against `jsi::Runtime` when the
  instance is created. The headless runtime uses it to install its own APIs.
- `GetRuntimeExecutor2` (in `React.h`) exposes a runtime executor to Office code.

_Inferred:_ these hooks let Office features skip the module system completely. That is powerful, but
React Native gives no stability guarantees at that level.

---

## 8. View hosting: where React Native meets Office UI

Upstream React Native expects the app to own a root view: `ReactRootView` or `ReactNativeIsland`
on Windows, `RCTRootView` on Apple, `ReactRootView` or `ReactSurface` on Android. Office puts
**`IReactViewHost`/`IReactViewInstance`** between features and those classes, and on Win32 it also
replaces React Native's renderer.

### 8.1 Win32, legacy architecture (Paper): NetUI is the renderer

_Observed:_

- Under Paper, the host puts an `IUIManager` into the context properties (`Mso.React/IUIManager`). The
  provider is chosen by name from `UIManagerProviderRegistry_Win`. **The default provider is NetUI.**
  If no provider is registered, the instance runs **without UI**, as headless or data-only SDXs do.
- `netui/platform/ui/react` (about 285 files) is a complete Office React Native renderer for Win32:
  - **Core:** `PaperUIManager`, `NativeUIManager`, shadow nodes, `ReactRootView`, and a UIA
    accessibility provider (`ReactUiaProvider`).
  - **Standard view managers:** View, Text, TextInput, Image, ScrollView, the Svg family, and others,
    all rendered by NetUI rather than XAML.
  - **Office-only components:** Persona and FaceStack, Callout, Tooltip, FocusZone and FocusTrapZone,
    Pivot, RichTextInput, AtMention, EditorPane, CopilotVoiceGlow, LinkedInPaletteSwitcher, FAB.
  - **Office-backed modules:** Accessibility, Alert, Clipboard, DeviceInfo, I18n, ImageLoader,
    Linking, LogBox, Palettes, TextStyles, QuirkSettings.
  - **Composition interop:** `ContentIslandHost`, `NetUIContentIsland`, and `DrawingIsland`.
- FlexML, Office's declarative UI system, can embed React Native through
  `netui/platform/flex/Concepts/ReactComponent`, `ReactContentIsland.flexdl`, and `ReactLogBox.flexml`.

_Inferred:_ on Win32 Paper, `react-native-win32.dll` supplies the JS runtime, bridge, and module
system, while **Office supplies the entire view layer**. This is the largest single override of a
platform layer in the codebase.

### 8.2 Win32, new architecture (Fabric): Composition with Office queues

_Observed (`ReactHostWin.cpp`):_ Fabric is opt-in per SDX (`WindowsUseFabric`, off by default). When it is on:

- the host **forces Hermes** and sets `ReactNative.IsBridgeless = true`;
- it calls `ReactCoreInjection::SetPlatformNameOverride(L"windows")`, so JS sees `Platform.OS ===
"windows"` and Metro selects the `windows` platform bundles (§6.3). Paper reports `"win32"`;
- with WinAppSDK, it takes the `CompositionContext` from `WinAppSDKCompositorProperty` and fixes up the
  UI queue later, using a temporary context until then. Without WinAppSDK, it installs a custom
  `ReactTimer` factory;
- in both cases it installs `ReactUIDispatcher` over the Office UI queue and a custom RedBox handler.

### 8.3 ReactContainers: Office-standard surfaces

_Observed (`coreui/reactcontainers/README.md`):_

- Features open React Native content in three Office-standard containers: **TaskPane**, **Dialog**,
  and **Callout**.
- Win32 builds them on NetUI. Mac builds them on AppKit (`CRCReact*_mac.mm`). The Deferred and
  Flexbox container variants exist only on Win32.
- JS can open nested dialogs and callouts through `JsRootDialogModule` and `JsRootCalloutModule`.
- The fallback root view is `NetUI::ReactRootView` on Win32 and `RCTRootView` on Mac.

### 8.4 OfficeHost: manifest-driven configuration and RichAPI

_Observed (`reactnative/officehost`):_

- `TryConfigureOfficeReactOptions*` reads the SDX's `app.json` manifest from disk or from the Metro
  server. It fills in identity, bytecode caching, the asset configuration, and the source bundle name.
- It then adds the platform bundles and, when the manifest requests RichAPI, the **OfficeJS bundle**.
- `IRichApiHost` is supplied by the app. `SetupRichApiReactConnection` runs in Reka's `OnInitialized`
  and `CleanupRichApiReactConnection` in `OnDestroyed`.
- `IManifestInfo` is stored in the instance property bag.

_Inferred:_ this makes React Native features look like Office add-ins, with a manifest and the Office.js
object model, but running in-process on Reka rather than in a webview.

### 8.5 Bespoke hosts

- **Activity pane (Win32).** _Observed (`reactnative/activitypane`)._ A singleton
  `ReactNativeActivityPaneRuntime` owns an `IReactNativeHost` for Word's Version History pane, behind a
  feature gate (a FlexML→React Native migration).
  - It uses identity `ReactNativeVHPane.win32`, the NetUI C++ module provider, **Foundation only** (no
    UI platform bundle), and a feature bundle located by `MsoFGimmeFileEx`.
  - The JS package is `oscui-ReactNativeActivityPane`, built on `@fluentui/react-native`.
  - _Inferred:_ the feature bundle carries its own UI layer.
- **Headless JS runtime (Android, iOS, Mac).** _Observed (`jshost/headless`)._
  - `JSHeadlessRuntime` builds on V2 `MakeReactHost` with the Foundation and UI bundles, an optional
    **host-specific OfficeJS bundle** chosen by OSF host type, and a delivery-path app bundle.
  - It installs a JSI runtime installer and offers `Post(std::function<void(jsi::Runtime&)>)`. Posted
    work is queued until the runtime is primed.
  - The `dirs` file builds it for Android, Apple, iOS, and Mac. There is also an empty implementation
    for iOS, and no Win32 target.

### 8.6 Apple

_Observed:_

- V2 views go through `ReactViewHostApple`/`ReactViewInstanceApple` and `ORNV2RootView`. The root-view
  factory can be injected, and the views are sized with Office `PfmView` and Auto Layout.
- V1 views use `ORNRootView` and `ORNShimView` over `RCTRootView`.

### 8.7 Android: a four-layer native stack

_Observed (`reactnative/android/host/.ai/index.md`, `reactnative/androidhost/.ai/index.md`):_

```
Layer 2  reactnativehost/            libsdxruntime.so       Mso::React C++ API (JNI to Kotlin)
           │  dlsym (delay-load; callbacks also dlsym back up for Reka)
Layer 3  reactnative/androidhost     libofficereacthost.so  fbjni HybridClasses, ReactInstanceAndroid
           │  links                                        ActiveObject, RekaBridge (Cxx + Turbo)
Layer 4  reactnative/android/host    librnxreacthost.so     Office-agnostic RN wrapper: ReactNativeHost.kt,
           │  links                                        WrapperJSExecutor, HermesExecutorOverride,
           │                                               RNX TurboModule/component registries
Layer 5  react-native-mobile fork    libreactnative.so, libhermes.so
```

- Layer 3 is a **separate shared object** for two reasons: fbjni's class-loader caching breaks with some
  test class loaders, and a separate library creates a delay-load boundary
  (`ReactInstanceAndroidDeferred.cpp`).
- Layer 4 is meant to be Office-agnostic and reusable. It extends Meta's `ReactNativeHost` with
  `addPlatformBundle`, `setRuntimeInstaller`, `setJSExecutorObserver`, `addCxxReactPackage`, and
  `useFabricRenderer`/`useBridgelessMode`.
- Views are hosted in `OfficeReactRootView`, which has a `LifecyclePolicy`.
- The new architecture is **all-or-nothing**: Fabric, Bridgeless, and TurboModules together. A global
  gate (`ReactHostStatics.initialize`) and per-SDX settings (`enableFabricRendererForHost`) enable it.

---

## 9. Threading and dispatch

Upstream React Native owns its threads: the JS thread, the native-modules thread, and the UI thread
(or the main queue on Apple). Office runs those roles on **Office dispatch queues**, so React Native
work follows the same scheduling, idle, and shutdown rules as the rest of the app.

_Observed:_

- **UI queue resolution on Win32.** The host uses `UIDispatchQueue` if the app supplied one, then
  `NativeDispatchQueue`, then the current queue. `ConfigureOfficeReactOptions` requires the UI queue
  to be **sequential** and falls back to the current queue otherwise.
- **The JS and native queues are Office implementations.** `reactnativehost/FastMessageQueueThread.*`
  implements React Native's `MessageQueueThread` contract over an Office queue and has its own tests.
- **Reka has its own native queue.** The Reka context proxy (§5.5) owns a queue that is passed to Reka
  as `NativeQueue`. Reka calls are therefore ordered against instance load, error, and cancellation
  rather than against React Native's internal queues.
- **Fabric uses Office queues too.** `ReactUIDispatcher` adapts the Office UI queue to the dispatcher
  that RNW's Composition stack expects. Without WinAppSDK, a custom `ReactTimer` factory
  (`ReactCoreInjection::SetTimerFactory`) drives JS timers. `SetUIBatchCompleteCallback` gives Office a
  callback at the end of each UI batch.
- **Apple shutdown and initialization.** Instance shutdown **pumps the run loop in 5 ms slices** until
  the bridge has finished tearing down. A process-wide mutex serializes `ORNRCTCxxBridge`
  initialization.

_Inferred:_ React Native assumes it owns the run loop. Office instead makes React Native a client of
the Office threading model. That is needed for deterministic shutdown in a multi-document,
multi-instance process, but it means threading bugs often look different from anything reported
upstream.

---

## 10. JS engines and architecture selection

|                      | Win32 (RNW)                                                                                                                                                                                                                | Apple (react-native-macos)                                                                                                                                                                                   | Android (mobile fork)                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **JS engine**        | Selected at runtime by the `JSIEngineSelection` ChangeGate. Chakra and ChakraCore map to Chakra; V8Lite and V8NodeApi fall back to V8; **the default is V8**. Fabric **forces Hermes**. The result is logged to telemetry. | JavaScriptCore, the system framework (`React-jsc`).                                                                                                                                                          | Hermes, wrapped by `HermesExecutorOverride` for logging, the debugger, and the runtime installer.           |
| **Default renderer** | Paper with NetUI (§8.1).                                                                                                                                                                                                   | Paper (`RCTCxxBridge`) through `ORN*` classes for V1. Which apps link the new-arch library set is Open (§16).                                                                                                | Old architecture (`ReactInstanceManager`).                                                                  |
| **New architecture** | Per-SDX `WindowsUseFabric`: Fabric, bridgeless, Composition, and platform name `"windows"`.                                                                                                                                | The libraries are built as separate **library sets**: `reactnative_{mac,ios}_oldarch`, `_newarch` (Fabric and `React-Runtime`), `_cxxturbomodules`, and `reactnative_headless_{mac,ios}` (JSI and JSC only). | `ReactHostImpl`: bridgeless, Fabric, and TurboModules together, behind a global gate plus per-SDX settings. |

_Observed:_

- Win32 engine and Fabric logic is in `reactnativehost/ReactHostWin.cpp`.
- The Apple library sets are in `mbu/projects/opensource_react_native_macos/*_libraryset.json`.
- The Android details are in `reactnative/android/host/.ai/index.md`.

_Inferred:_

- Office runs **three different engine strategies** and **two renderer generations** at the same time.
- On Win32 the engine choice is a service-controlled gate, not a build-time choice. Upstream RNW
  apps choose the engine at build time.
- The Win32 default (V8, plus Chakra) differs from RNW's current default direction, which is Hermes.

---

## 11. Developer tooling

Upstream React Native development assumes one app, one Metro server, and one bundle. Office has to
support many SDXs inside a large shipping binary.

_Observed:_

- **YarnZen coordination (Win32).** The host uses a named mutex and file mapping keyed by SDX identity
  (and bundle ID) so that the YarnZen developer tool can find a running instance and redirect it to
  a local Metro server.
- **Per-SDX dev settings.**
  - Win32 uses ChangeGate-backed helpers: direct debugging, break on the first line (aka.ms/sdxdebug),
    and debugger port overrides.
  - Apple uses `ORNDevSettingsDataSource` per identity.
  - `ShouldReadAppJsonFromBundlerServer` lets OfficeHost read the SDX **manifest** from Metro as well as
    the bundle.
- **Platform bundles from Metro.** Development builds can load Foundation and UI from Metro with
  `fabric`, `flavor` (debug or ship), and `buildPlatform` (x86, x64, or arm64) query parameters, so
  platform-bundle changes don't need a rebuilt resource DLL (§6.3).
- **Networking options.** `UseWebSocketV2` and `SetMicrosoftReactRuntimeOptions` set the Office
  User-Agent and select `WebSocket.ResourceV2`.
- **Diagnostic overlay.** `__useOfficeRootComponentWrapper` shows the architecture and engine badges
  (§6.2).

---

## 12. Errors, logging, and telemetry

_Observed:_

- **Default error policy.** `ReactOptions::OnError` defaults to a **ShipAssert**. A JS error in a
  feature that hasn't overridden it is treated as an Office product failure, not a red box. Per-identity
  gates control whether specific SDXs crash on error.
- **RedBox.** `reactnativehost/RedBox.*` provides Office's red box. Win32 Fabric installs a custom
  RedBox handler. `RedBoxErrorReporting_Watson.cpp` sends red-box errors to **Watson**.
- **Native logging.** On Win32, `OnLogging` receives RNW's native log. If it isn't set, **DEBUG**
  builds write to `OutputDebugString` and also send `Error`/`Fatal` messages to the red box as soft JS
  errors. This works around an upstream change that stopped routing dev-bundle JS errors through
  `ExceptionsManager`. Ship builds drop the log.
- **Tracing.** `ETWSystraceHandler.cpp` and the `reactnativehost/etw` manifest send React Native
  systrace events to **ETW**, so React Native work appears in standard Office performance traces.
- **Telemetry.**
  - Every bundle load is a LoadBundle activity. File names are included only when sensitive
    telemetry is enabled.
  - Platform-bundle failures are reported separately (`ReportPlatformBundleException`).
  - The selected engine is logged.
  - The running hosts are attached to OCV (feedback) reports.

_Inferred:_ React Native's error model is built for development. Office's is built for **production
diagnostics**, where every JS failure has to produce a Watson report, telemetry, or a ShipAssert.

---

## 13. Private API reach-ins and source patches

This section covers the places where Office goes **beneath** React Native's public API. These are
the most fragile points during upgrades.

### 13.1 Win32 / react-native-windows

_Observed:_

- **Activation detour.** `reactnativehost/reactnativehostdetours_win32.cpp` uses Detours to hook
  `RoGetActivationFactory` and `RoActivateInstance`.
  - Any class ID starting with `Microsoft.ReactNative.` is served from `react-native-win32.dll`'s own
    `DllGetActivationFactory` and cached per class.
  - The DLL is loaded through `MsoLoadLibrary(msofidReactNativeWin32)`, with a fallback to a safe
    `LoadLibrary`.
  - Detouring is always on (`IsDetouringRequired()` returns `true`), and there is a test hook.
  - _Inferred:_ this provides registration-free WinRT activation of RNW types without the app manifest
    entries that RNW normally relies on.
- **`ReactCoreInjection`.** Office uses RNW's injection API for things a normal RNW app doesn't change:
  `SetPlatformNameOverride` (`"windows"` under Fabric), `SetTimerFactory`,
  `SetUIBatchCompleteCallback`, and `MakeViewHost` (used to build V2 views).
- **Binary consumption.** RNW comes as a prebuilt binary (`react-native-win32.dll`), not as source
  (§3). Office can't patch RNW internals. It can only use injection points, detours, and its own
  NetUI renderer.
- **Folly.** Hosting code includes an Office `msoFolly` wrapper header before using folly types.

### 13.2 Apple / react-native-macos

_Observed:_

- **Private headers.** `reactnativehost/RCTBridgePrivateDeclarations.h` re-declares private
  `RCTBridge`/`RCTCxxBridge` interfaces, and `ORNRCTCxxBridge` subclasses the bridge.
- **Weak instance access.** `ORNWeakInstanceProvider.h` gives Office code weak access to the C++
  `Instance` behind a bridge.
- **Source build with patches.** React Native is built from source by `mbu`
  (`mbu/projects/opensource_reactnative.plist`, `opensource_rnx_kit_react_native_host.plist`). A
  post-copy step and rnx-kit-related patches change the vendored sources.

### 13.3 Android / react-native-mobile fork

_Observed:_

- **A maintained fork.** Office builds and publishes its own React Native for Android, following the
  playbook in `reactnative/android/host/.ai/build-rn-fork.md`.
- **The fork's delta from Meta** is captured in `reactnativehost/.ai/office-vs-meta-0.81-stable.patch`,
  which covers about 146 files. Conceptually, it contains:
  - **Platform-bundle support** in `cxxreact` (`PlatformBundleInfo.h`) and the executor path.
  - **Module-registry injection:** a new
    `CatalystInstanceEventListener.onModuleRegistryCreated(catalystInstance)` callback in
    `CatalystInstance`/`CatalystInstanceImpl` (old architecture) and `BridgelessCatalystInstance`.
    Office uses it to inject Reka and C++ modules after React Native builds the registry
    (`reactnativehost/.ai/android.md`).
  - **Toolchain changes:** Hermes engine and inspector build changes, codegen, and the Babel
    transformer and preset packages.
  - **Patched third-party headers** under `office_patches/includes/` (folly containers, `Function`,
    synchronization, fbjni).
  - A few changes under `React/` and `Libraries/` (Apple-side code), which suggests the fork is used
    on more than Android (§16).
- **Bidirectional dlsym** between `libsdxruntime.so` and `libofficereacthost.so` (§8.7).

_Inferred:_

- Android is the only platform where Office changes React Native's own source **as a fork**.
- On Apple, Office patches vendored source.
- On Win32, Office works only through public injection points, detours, and replacement layers.

---

## 14. Per-platform summary

| Concern                                      | Win32 (RNW / react-native-win32)                                            | Apple (react-native-macos, mac + iOS)                                              | Android (react-native-mobile fork)                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| How React Native arrives                     | Prebuilt DLL from NuGet; WinRT activation detoured                          | Source build through MDK, patched after copy                                       | Office fork, published as AAR and `.so`                                               |
| `IReactHost` implementation                  | `ReactHostWin`, a facade over RNW `ReactNativeHost`                         | `ReactHostApple` (ActiveObject) driving `ORNReactHostBridge` and `ORNRCTCxxBridge` | `ReactHost` (ActiveObject) driving the Kotlin `ReactNativeHost` through `androidhost` |
| Who serializes load and unload               | RNW (`IAsyncAction` adapted to `Mso::Future`)                               | Office `AsyncActionQueue`                                                          | Office `AsyncActionQueue`                                                             |
| V1 shared instances                          | Not exported                                                                | Yes, and gated V2 bridging (§5.4)                                                  | Yes                                                                                   |
| Shutdown wait                                | `FutureWait`                                                                | Run-loop pumping in 5 ms slices                                                    | `FutureWait`                                                                          |
| Renderer                                     | **NetUI** (Paper, the default) or Composition (Fabric, opt-in)              | UIKit/AppKit through `RCTRootView` and `ORNV2RootView`                             | `OfficeReactRootView`; Fabric behind a global gate plus per-SDX settings              |
| Office containers (`coreui/reactcontainers`) | TaskPane, Dialog, Callout, Deferred, Flexbox (NetUI)                        | Mac only: TaskPane, Dialog, Callout (AppKit)                                       | None                                                                                  |
| Module injection                             | Package and C++ provider registries; property bag                           | Bridge-module registry; TurboModule delegate                                       | `onModuleRegistryCreated`; RNX TurboModule and component registries                   |
| Reka                                         | TurboModule (Fabric) or CxxModule                                           | Registered through the ORN registries                                              | CxxModule or TurboModule in `androidhost`                                             |
| Platform-bundle delivery                     | RCDATA resources (JS, HBC, Fabric variants), preloaded in `InstanceCreated` | Bundle files, preloaded by `ORNJSExecutorFactory`                                  | Bundle files, preloaded by `WrapperJSExecutor`                                        |
| JS engine                                    | V8 by default, Chakra via gate, Hermes for Fabric                           | JSC                                                                                | Hermes                                                                                |
| Platform name in JS                          | `win32` (Paper) or `windows` (Fabric)                                       | `macos` or `ios`                                                                   | `android`                                                                             |
| Headless JS runtime                          | Not built (UI-less instances instead)                                       | `jshost/headless`                                                                  | `jshost/headless`                                                                     |
| Deepest reach-in                             | Activation detour, `ReactCoreInjection`                                     | Private `RCTBridge` declarations, bridge subclass, post-copy source patches        | Source fork with 146 patched files                                                    |

---

## 15. Implications and risks

All items here are _Inferred_ from the observations above.

1. **The same API with different lifecycle semantics.**
   - `IReactHost` looks the same everywhere, but Win32 delegates serialization to RNW and does not
     support `Instance()` or `NativeQueue()`.
   - Cross-platform feature code that is correct on Android or Apple can assert or behave differently
     on Win32, especially around reload during unload, close ordering, and direct instance access.
2. **Two renderer stacks on Win32.**
   - NetUI Paper and RNW Fabric are separate renderers. Office-only components and modules (§8.1)
     exist in NetUI, and any Fabric adoption needs equivalents for them.
   - The `ViewWin32 → View` shim in the `windows` UI bundle is a compatibility bridge, not parity.
3. **The platform name and bundle variant split in Fabric mode.**
   - Fabric reports `windows`, while Paper reports `win32`.
   - JS code that branches on `Platform.OS`, Metro platform resolution, and the native resource variant
     must all agree. A mismatch fails at runtime, not at build time.
4. **Coupling through shared platform bundles.**
   - App bundles depend on the React Native version and module layout inside the platform bundles that
     the host ships, through `OfficePlatformGlobal` and the Metro externals.
   - Version skew, for example a service-delivered app bundle running on an older host, shows up as
     missing globals or changed module shapes.
   - The CommonJS compatibility getters are evidence that this has already needed mitigation.
5. **Binary RNW limits Office's options on Win32.**
   - Office can't patch RNW. A bug in RNW internals must be fixed upstream, worked around through
     injection points, or replaced (as NetUI did for UI).
   - The activation detour also depends on RNW's WinRT class-ID naming.
6. **Fragility on Apple upgrades.** Private `RCTBridge` declarations, the bridge subclass, and post-copy
   patches have to be revalidated on every `react-native-macos` upgrade. The old-architecture bridge is
   also the part upstream is retiring.
7. **The cost of the Android fork.** Each React Native upgrade means rebasing a 146-file delta. Several
   parts of it (the module-registry hook, platform bundles, folly overlays) are structural, not
   cosmetic.
8. **Android's bidirectional `dlsym`.** `libsdxruntime.so` and `libofficereacthost.so` resolve symbols
   in each other at runtime. Symbol renames or visibility changes fail at load time or first use, not at
   link time.
9. **Three engines.** V8 or Chakra, JSC, and Hermes behave differently (bytecode, debugger protocols,
   `Intl`, performance). Each platform's JS behavior and telemetry has to be read with its engine in
   mind.
10. **The ownership boundary.** `reactnativehost` mixes Office-generic hosting with platform reach-ins.
    The Android split, where `reactnative/android/host` is meant to be Office-agnostic, is the only
    platform where that boundary is drawn explicitly.

---

## 16. Open questions

| #   | Question                                                                                                                                                                | Why it matters                                                                                                                                                                                                                                               | Where to look next                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1   | How many Win32 SDXs set `WindowsUseFabric` today, and is there a plan to retire NetUI Paper?                                                                            | It decides whether risk 2 in §15 is a transitional risk or a long-term one.                                                                                                                                                                                  | Callers of `WindowsUseFabric`; ChangeGate and app configuration |
| 2   | Is iOS built from `react-native-macos` (per the MDK plist) or from the `react-native-mobile` fork?                                                                      | `reactnativehost/.ai/react-native-mobile.md` describes the fork as serving "Android and iOS", and the fork patch touches `React/` and `Libraries/` Apple code, but `mbu/projects/opensource_react_native_macos.plist` builds `react-native-macos` for `ios`. | iOS app link inputs (`reactnative_ios_*_libraryset`), fork CI   |
| 3   | Which Apple apps link the `newarch` library set, and does any Apple host run bridgeless or Fabric?                                                                      | §3 shows the old architecture, but new-arch library sets exist.                                                                                                                                                                                              | Consumers of `reactnative_{mac,ios}_newarch.libraryset`         |
| 4   | How is the bundle source chosen at runtime: in-box (Click-to-Run), service-delivered, or CDN? And what is the version-skew policy for platform bundles?                 | It determines the real exposure to risk 4 in §15.                                                                                                                                                                                                            | OfficeHost package-solution helpers; JS host delivery           |
| 5   | Will Apple parallel V2 registration reach audiences beyond Automation?                                                                                                  | It decides when V1 shared instances can be removed (§5.3, §5.4).                                                                                                                                                                                             | `ReactNativeHost.SDXRegistration.ParallelV2Registration` gate   |
| —   | _Resolved:_ the headless JS runtime (`jshost/headless`) exists only for Android, iOS, and Mac. On Win32, the equivalent is a `ReactHost` with no `IUIManager` provider. | —                                                                                                                                                                                                                                                            | `jshost/headless/dirs`                                          |

---

## 17. Source index

**Office hosting core (`reactnativehost`)**

- `reactnativehost/public/React.h`: the `Mso::React` contract.
- `reactnativehost/sources.inc`: the shared, Win32, Apple, and Android source split.
- `reactnativehost/ReactHostWin.cpp`, `ReactHostApple.mm`, `ReactHost.cpp`: per-platform hosts.
- `reactnativehost/ReactHostRegistry*.{h,cpp,mm}`: process-wide registry and shutdown.
- `reactnativehost/InstanceFactory_AndroidApple.cpp`, `ReactBaseImpl.cpp`: V1 shared instances.
- `reactnativehost/RNHostV2Registration.h`, `apple/RNHostV2Registration_Apple.mm`: V1→V2 bridge.
- `reactnativehost/reactnativehostdetours_win32.cpp`: WinRT activation detour.
- `reactnativehost/PlatformBundleHelpers_Win.cpp`, `FastMessageQueueThread.*`, `RedBox.*`,
  `RedBoxErrorReporting_Watson.cpp`, `ETWSystraceHandler.cpp`, `etw/`.
- `reactnativehost/RCTBridgePrivateDeclarations.h`, `ORNWeakInstanceProvider.h`,
  `apple/ORNDevSettingsDataSource.mm`: Apple reach-ins and dev settings.
- `reactnativehost/.ai/android.md`, `.ai/react-native-mobile.md`,
  `.ai/office-vs-meta-0.81-stable.patch`: Android fork documentation and delta.

**Platform-bundle and JS tooling**

- `jshost/officepal/public/PlatformJSBundles.h`, `jshost/officepal/PlatformJSBundles_{win32,mac,ios,android}.*`.
- `sdx/platform/packages/platform-bundles/{foundation,ui}`, `sdx-platform-bundle-externals`,
  `sdx-metro-config`, `metro-plugin-appbundle`, `metro-plugin-noprelude`, `reka-react-native`.

**Office-side hosts and UI**

- `reactnative/officehost/OfficeHost.cpp`, `reactnative/officehost/public/OfficeHost.h`: manifest,
  platform bundles, and RichAPI.
- `coreui/reactcontainers/README.md`: TaskPane, Dialog, and Callout containers.
- `netui/platform/ui/react/`: NetUI's React Native renderer and Office components (Win32 Paper).
- `reactnative/activitypane/src/ReactNativeActivityPaneRuntime.cpp`,
  `reactnative/activitypane/doc/ReactNativeActivityPane-Design.md`.
- `jshost/headless/JSHeadlessRuntimeImpl.cpp`, `jshost/headless/dirs`.

**Android layers**

- `reactnative/androidhost/.ai/index.md`: `libofficereacthost.so`, ReactInstanceAndroid, and Reka.
- `reactnative/android/host/.ai/index.md`, `reactnative/android/host/.ai/build-rn-fork.md`: the
  Office-agnostic React Native wrapper and the fork playbook.

**Third-party consumption**

- `mbu/projects/opensource_react_native_macos.plist`, `mbu/projects/opensource_react_native_macos/*_libraryset.json`,
  `opensource/react_native_macos/`, `opensource/rnx_kit_react_native_host/OFFICE.md`.
- `opensource/reactnative/`, `opensource/reactnativesdk/arm64/readme.txt`.
