---
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Fix macOS desktop runs: canonicalize the reporting root so artifacts under
symlinked temporary directories stay confined, skip stop requests to producers
whose Unix-domain sockets have already half-closed, and request the canonical
desktop target that Storybook's embedded driver registers for Fabric and Paper
smoke tests. macOS RN Test App sessions without explicit identity now launch
the project's exact built product instead of any Launch Services copy sharing
its bundle identifier, and fail closed when its bundle identifier, renderer, or
embedded JavaScript bundle does not match. Console test labels number retried
attempts by ordinal rather than by WDIO's sparse attempt keys.
