---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Add exact Windows and Win32 application identities, read-only inspection, cross-service application control exclusion, and bounded recovery of acquired Windows application resources from verified crashed owners. Retire reused recorded incarnations without signalling their replacements, and resume interrupted recovery barriers only after verifying their native owners exited. Keep packaged activation explicitly uncontained and uncertain launches fenced. Resolve Storybook bridge identities without acquiring another controlling attachment.
