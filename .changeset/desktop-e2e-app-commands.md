---
"@fluentui-react-native/tester": patch
---

FluentTester runs its macOS and Windows end-to-end tests through `desktop-test`: `yarn e2eprep:<platform>` prepares
the app and `yarn e2etest:<platform>` runs the `legacy` suite from `apps/E2E`. The Windows build also registers the
Debug package with `scripts/register-windows-app.ps1`. The Appium and WinAppDriver lanes are removed.
