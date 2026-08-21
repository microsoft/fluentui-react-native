---
"@fluentui-react-native/desktop-driver": minor
"@fluentui-react-native/components": patch
---

Add `@fluentui-react-native/desktop-driver`: write-once WebdriverIO desktop tests for React Native Windows and React Native macOS, backed by an owned loopback single-driver host, a versioned portable command matrix, ownership-safe launch/attach lifecycles, and Storybook story-test generation. The agentic-components Button stories now declare desktop story tests as a proof of concept, using both an inline plan and a colocated shared spec.

The loopback test service, the WebdriverIO run executor, and Storybook channel discovery now ship in the package as `desktop-driver serve`. The on-device controls discover the service over the Storybook channel instead of build-time environment variables, which React Native cannot read.

WebdriverIO, Appium, Mac2, and NovaWindows now ship as runtime dependencies. NovaWindows replaces the unmaintained WinAppDriver backend, and `desktop-driver driver detect|install` provides backend-aware setup verification without requiring an Appium driver registry or a separate Windows driver service.
