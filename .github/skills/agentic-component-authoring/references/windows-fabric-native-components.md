# Windows Fabric native components

Use this reference when an agentic component needs a native React Native Windows
view. It targets the repository's React Native Windows 0.81 line. Verify APIs
against the installed `react-native-windows` package before adopting guidance
from a newer RNW branch.

## Decide whether native code is required

Prefer a JavaScript component, slots, and React Native primitives when they can
meet the contract. Use a Windows Fabric component when the implementation needs
a Windows-only visual, window, input surface, native API, or performance
boundary that React Native does not expose.

Establish these facts before editing:

- the installed RNW version;
- whether the consuming host uses the New Architecture;
- whether the package must also retain a Paper implementation;
- whether the surface is a view component, TurboModule, or both;
- the canonical Windows, Win32, or macOS behavior to preserve.

RNW Fabric components use C++/WinRT and Windows App SDK Composition visuals.
Do not copy UWP XAML `IViewManager` patterns into the Fabric branch.

## TypeScript native-component specification

Name the schema `<ComponentName>NativeComponent.ts` and keep the component name
identical in TypeScript, generated code, registration, and the JavaScript
wrapper.

```ts
import type { DirectEventHandler, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';

type ValueChangedEvent = {
  value: boolean;
};

export interface NativeProps extends ViewProps {
  enabled?: WithDefault<boolean, true>;
  onValueChanged?: DirectEventHandler<ValueChangedEvent>;
}

export interface NativeCommands {
  setValue(viewRef: React.ElementRef<React.ComponentType<NativeProps>>, value: boolean): void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setValue'],
});

export default codegenNativeComponent<NativeProps>('ExampleNativeView');
```

Use React Native codegen types for native values. Extend `ViewProps` for visual
components. Keep event payloads and commands typed and minimal.

## Windows codegen configuration

Verify the owning package's `codegenConfig`:

```json
{
  "codegenConfig": {
    "name": "ExampleSpec",
    "type": "components",
    "jsSrcsDir": "src",
    "includesGeneratedCode": true,
    "windows": {
      "namespace": "ExampleCodegen",
      "generators": ["componentsWindows"],
      "outputDirectory": "windows/Example/codegen",
      "separateDataTypes": true
    }
  }
}
```

Use `"all"` and include `"modulesWindows"` when the package contains both
TurboModules and components. Run the package's declared codegen command.
Never edit generated props, event-emitter, registration, or `.g.h` files.
Persist corrections in the TypeScript schema or codegen configuration.

## C++/WinRT component view

Third-party Fabric components normally derive from the generated CRTP base:

```cpp
#ifdef RNW_NEW_ARCH
#include "codegen/react/components/ExampleSpec/ExampleNativeView.g.h"

struct ExampleNativeView
    : winrt::implements<ExampleNativeView, winrt::IInspectable>,
      ExampleCodegen::BaseExampleNativeView<ExampleNativeView> {
  winrt::Microsoft::UI::Composition::Visual CreateVisual(
      winrt::Microsoft::ReactNative::ComponentView const &view) noexcept override;

  void Initialize(
      winrt::Microsoft::ReactNative::ComponentView const &view) noexcept override;

 private:
  winrt::Microsoft::UI::Composition::SpriteVisual m_visual{nullptr};
  winrt::Microsoft::ReactNative::ComponentView::LayoutMetricsChanged_revoker
      m_layoutMetricsChangedRevoker;
};
#endif
```

Implement only the hooks the component needs. Generated registration omits
unused optional callbacks.

- Create the root Composition visual in `CreateVisual`.
- Subscribe with `winrt::auto_revoke` and store the revoker.
- Capture `get_weak()` in event and asynchronous callbacks.
- Treat view lifecycle callbacks as UI-thread work.
- Reset reusable native state when the view is recycled.
- Keep native boundary methods `noexcept`, matching RNW patterns.

The generated CRTP base is not the same as subclassing an RNW built-in
`ComponentView`. Do not call a nonexistent `Super` method. When subclassing a
built-in view, preserve its documented base-method ordering.

## Props, events, commands, and state

- Compare old and new props before scheduling visual work.
- Mark affected visuals dirty in prop updates and batch expensive mutation in
  the final-update hook.
- Store and null-check the generated event emitter before emitting typed
  payloads.
- When a built-in base handles commands, call it first and respect `Handled`.
- Use renderer state only when the renderer must own or measure it. Prefer
  props and events for ordinary controlled interaction state.

The RNW `SwitchComponentView` is the canonical source for interactive props,
events, commands, pointer input, keyboard input, focus, and UI Automation.

## Layout and Composition visuals

React layout metrics are in device-independent units while Composition visual
sizes and offsets use physical pixels. Multiply positions and dimensions by
`PointScaleFactor` before assigning them to visuals or geometries.

Mount and unmount child visuals in renderer order. Backgrounds, borders,
shadows, transforms, and clipping are normally supplied through
`ComponentViewFeatures`. Disable a verified feature only when the component
fully replaces it.

Custom clipping may require disabling native border handling and explicitly
updating size and offset from layout metrics. Check the target RNW source
because the feature flags are not exhaustively documented as a public API.

## Theme, input, focus, and accessibility

Native components must support:

- light, dark, and high-contrast updates;
- platform or Fluent brushes instead of fixed native colors where appropriate;
- pointer and keyboard input;
- focus acquisition and focus visuals;
- React Native accessibility props;
- a correct UI Automation control type and patterns;
- UIA property-change notifications for native state changes.

Use Accessibility Insights for Windows or Inspect.exe during initial
development. Add stable `testID` values to the Storybook validation story so
automated checks can locate the component through UIA.

## Registration, projects, and autolinking

The complete persistence chain is:

1. Add hand-authored `.h` and `.cpp` files to the library `.vcxproj`.
2. Add `.vcxproj.filters` entries only for Visual Studio organization.
3. Leave generated code under the codegen build integration.
4. Include the component implementation from `ReactPackageProvider.cpp`.
5. Call the generated `Register<ComponentName>NativeComponent` helper.
6. Preserve attributed TurboModule registration when the package has modules.
7. Regenerate or autolink through the consuming app's declared Windows script.
8. Treat generated autolink files and app solutions as disposable output.

A file on disk but absent from `.vcxproj` is not compiled.

When Fabric and Paper use different component names, generate the Fabric name
directly and set `paperComponentName` in `codegenNativeComponent`. Callout uses
the Fabric name `Callout` and the Paper fallback `RCTCallout`; Windows can
therefore use the generated `RegisterCalloutNativeComponent` helper without
copying or modifying generated registration code.

## Paper compatibility

When a package intentionally supports both architectures, guard Fabric-only
headers and implementation with `RNW_NEW_ARCH` and retain the Paper
`IViewManager` branch separately. Do not share UWP XAML types with WinAppSDK
Composition code.

| Paper                                     | Fabric                                                 |
| ----------------------------------------- | ------------------------------------------------------ |
| `IViewManager::CreateView` returning XAML | Generated component base creating a Composition visual |
| Native property map                       | Codegen props                                          |
| `AddViewManager`                          | Generated Fabric registration helper                   |
| XAML child management                     | Mount and unmount component-view hooks                 |
| UWP brushes and geometry                  | Windows App SDK Composition brushes and geometry       |

Test architecture branches in separate compatible hosts. For a
New-Architecture-only package, remove obsolete Paper code rather than adding an
untested fallback.

## Validation

Run the smallest declared command at each layer:

1. package format and lint;
2. TypeScript build for the wrapper and schema;
3. Windows codegen check;
4. consuming-app generation or autolink check;
5. clean native package and app build;
6. Storybook Windows bundle;
7. deployed Storybook smoke automation;
8. interaction and native event assertion;
9. UIA assertion;
10. screenshot through the agent host when visual evidence is required;
11. offline Release smoke after packaging or native dependency changes;
12. root build after public type, manifest, or project-reference changes.

A successful JavaScript bundle does not validate native code.

## Canonical sources

- [RNW native platform components](https://microsoft.github.io/react-native-windows/docs/native-platform-components)
- [RNW New Architecture](https://microsoft.github.io/react-native-windows/docs/new-architecture)
- [RNW Windows codegen CLI](https://microsoft.github.io/react-native-windows/docs/codegen-windows-cli)
- [RNW native library autolinking](https://microsoft.github.io/react-native-windows/docs/native-platform-using)
- [RNW NativeModuleSample](https://github.com/microsoft/react-native-windows-samples/tree/main/samples/NativeModuleSample/cpp-lib)
- [RNW built-in Composition views](https://github.com/microsoft/react-native-windows/tree/main/vnext/Microsoft.ReactNative/Fabric/Composition)

Use the installed dependency or matching release branch first. Treat repository
head as discovery material until each API is verified against the pinned RNW
version.
