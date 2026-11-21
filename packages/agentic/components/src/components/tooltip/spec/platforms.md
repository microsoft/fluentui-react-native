# Native evidence

These are source observations, not native test results. The [contract](../SPEC.md) records the proposed routing.
The [source inventory](source.json) pins the files and digests used to make the decision.

- **macOS:** The RNmacOS [view prop](https://github.com/microsoft/react-native-macos/blob/3693ac91a00df6374e610a0a06b0f90aaa1fe4b3/packages/react-native/Libraries/Components/View/ViewPropTypes.js),
  [Paper view manager](https://github.com/microsoft/react-native-macos/blob/3693ac91a00df6374e610a0a06b0f90aaa1fe4b3/packages/react-native/React/Views/RCTViewManager.m)
  and [Fabric view](https://github.com/microsoft/react-native-macos/blob/3693ac91a00df6374e610a0a06b0f90aaa1fe4b3/packages/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm)
  establish the route to [NSView.toolTip](https://developer.apple.com/documentation/appkit/nsview/tooltip).
  `tooltip` and `accessibilityHint` are separate inputs; do not infer VoiceOver behavior from hover.
- **Windows:** Compare the [Fabric composition view](https://github.com/microsoft/react-native-windows/blob/3eaa23597552160257ad24a2d9142e9c6435f2f8/vnext/Microsoft.ReactNative/Fabric/Composition/CompositionViewComponentView.cpp)
  and [tooltip tracker](https://github.com/microsoft/react-native-windows/blob/3eaa23597552160257ad24a2d9142e9c6435f2f8/vnext/Microsoft.ReactNative/Fabric/Composition/TooltipService.cpp)
  with the [Paper/XAML setter](https://github.com/microsoft/react-native-windows/blob/3eaa23597552160257ad24a2d9142e9c6435f2f8/vnext/Microsoft.ReactNative/Views/FrameworkElementViewManager.cpp).
  The [Fabric accessibility provider](https://github.com/microsoft/react-native-windows/blob/3eaa23597552160257ad24a2d9142e9c6435f2f8/vnext/Microsoft.ReactNative/Fabric/Composition/CompositionDynamicAutomationProvider.cpp)
  reads description and help separately from tooltip presentation.
- **Office Win32:** The [view attributes](https://github.com/microsoft/react-native-windows/blob/3eaa23597552160257ad24a2d9142e9c6435f2f8/packages/%40office-iss/react-native-win32/src-win/Libraries/Components/View/ReactNativeViewAttributes.win32.js)
  expose a string-prop route. The [legacy binding](../../../../../../experimental/Tooltip/src/TooltipNativeComponent.win32.ts)
  instead looks up `RCTTooltip`. Neither source is the Office host implementation. Do not treat an accepted prop,
  a successful lookup or the presence of `visible` in legacy JS types as proof of controlled native visibility.
- **Mobile:** The stock RN [view props](https://github.com/facebook/react-native/blob/cddf8a7536de12db889e35e946281cfaf327197a/packages/react-native/Libraries/Components/View/ViewPropTypes.js)
  do not advertise tooltip text. An accessibility role named `tooltip` does not attach a platform tooltip. The OS
  mechanisms in the [platform table](../SPEC.md#platform-behavior) would need separate RN transport and input policy.
