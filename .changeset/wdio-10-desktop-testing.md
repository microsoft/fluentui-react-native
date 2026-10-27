---
"@fluentui-react-native/desktop-driver": patch
"@fluentui-react-native/desktop-test": patch
"@fluentui-react-native/storybook-desktop": patch
---

Move to WebdriverIO 10.1 and expect-webdriverio 8, replacing the patched expect-webdriverio 5.6.1. WebdriverIO 10
requires Node.js 22.19 or newer. Desktop Driver now passes the `{ attachToElement: true }` option object that
WebdriverIO 10 requires when it overwrites element commands. WebdriverIO 10 also makes selectors strict by default, so
a selector that matches several elements now throws; see the desktop-test WDIO suites reference for the opt-out. Storybook
Desktop no longer depends on `@wdio/logger`, which only satisfied the old expect-webdriverio peer requirement.
