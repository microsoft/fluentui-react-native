---
'@fluentui-react-native/storybook-desktop': patch
'@fluentui-react-native/desktop-test': patch
---

Let `driver --agent` attach on Windows and Win32 without an application lease: the agent connection names the app's verified AUMID or REX executable, resolved through the new `resolveDesktopApplication(target, signal, { attach: true })` option, and the command fails before starting services when no identity can be verified. `driver` also serves Metro on a platform's declared fixed smoke Metro port, such as the RN Test App Windows Debug host's 8081, and fails clearly when that port is in use.
