---
"@fluentui-react-native/desktop-driver": minor
"@fluentui-react-native/components": patch
"@fluentui-react-native/storybook-desktop": minor
"@fluentui-react-native/storybook-desktop-runtime": patch
---

Build the source-shipped native desktop helper explicitly, reuse verified
content-addressed artifacts, and add the Windows/Win32 C++ provider. Storybook
can build the helper independently, ensures it during prep, and attaches
authored smoke tests to the exact app process it launched.
