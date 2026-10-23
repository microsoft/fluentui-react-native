---
id: native-core.codegen-and-publishing
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core/package.json
  - packages/agentic/native-core/FRNNativeCore.podspec
---

# Codegen, registration, and publishing

The shared native build metadata follows this organization:

1. Use one package-level codegen identity, `FRNNativeCoreSpec`, with
   `type: "all"` and `jsSrcsDir: "src/specs"` so components and modules remain
   distinct in source but share a generation boundary.
2. Name component schemas `<Name>NativeComponent.ts` and module schemas
   `Native<Name>.ts`. Prefix native registration names with `FRNNativeCore`
   for new APIs to avoid collisions. Migrated Callout and FocusZone retain
   their existing Fabric and Paper names for compatibility. Keep names
   identical in the schema, generated interface, registration, and JS binding.
3. Configure Windows with both `componentsWindows` and `modulesWindows`
   generators and `windows/NativeCore/codegen` output. Apple codegen should
   run through the consuming macOS app's Pod integration. Inspect each
   platform's generated schema and provider list so platform-only APIs do
   not require registration on unrelated hosts.
4. Leave `includesGeneratedCode` unset unless generated artifacts for every
   supported native platform are deliberately shipped and verified. It is
   not a Windows-only switch and can prevent Apple code generation.
5. The macOS podspec includes both components' shared and Paper sources.
   Fabric component views retain their `RCT_NEW_ARCH_ENABLED` guards. Paper
   managers remain available for existing bridge interoperability until the
   supported macOS hosts are Fabric-only. Windows declares `RnwNewArchOnly`
   and registers both components through one package provider.
6. Keep native targets and required generated outputs in the published
   archive. The `files` allowlist includes `src`, `lib`, `macos`,
   `windows`, `win32`, podspecs, and `react-native.config.cjs`. Intermediate
   native build artifacts, tests, and machine-local project output must not
   leak into it.
7. Verify the packed package in consuming hosts before replacing an existing
   package. Migrations are separate changes with compatibility evidence, not
   implicit effects of adding this workspace.
