# @fluentui-react-native/native-core

## 0.1.0

### Minor Changes

- c547395: Initialize the native-core package with cross-platform, macOS, Windows, shared Windows/Win32, and Win32 entrypoints and a native component and TurboModule organization plan.
  
  Own the Callout and FocusZone JS wrappers, codegen specifications, macOS Paper/Fabric adapters, and Windows Fabric implementations in this shared package.
- c547395: Isolate the existing Callout and FocusZone JavaScript wrappers under native-core/legacy instead of the package root. Compatibility shims retain their exports through this submodule; native implementations and codegen specifications are unchanged.

### Patch Changes

- c547395: Fix the macOS Swift interoperability header name for the consolidated native-core pod.
