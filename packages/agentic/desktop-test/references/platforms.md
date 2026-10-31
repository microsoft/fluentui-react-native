---
id: desktop-test.platforms
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
---

# Platform setup

## macOS RN Test App

Bundle before `prep`; CocoaPods embeds only resources that exist when
`pod install` runs. Use `prep`, `build`, then `test`. Changing Fabric/Paper
requires a new `prep`. The adapter verifies bundle identifier, renderer, and
embedded JavaScript bundle, and launches the exact built product.

## Windows RN Test App

Generate, build, and register the app through its declared workspace scripts.
The adapter verifies the generated renderer and registered package identity.
Use a target-specific helper and preserve the exact target identity.

## Win32 REX

Win32 uses the prebuilt REX host and Paper renderer. Bundle before test/run;
native app build is unsupported.

Each platform's native readiness and physical-input evidence is distinct.
Report renderer, skipped capabilities, unsupported operations, and app
qualification separately.
