---
id: components.legacy-test-apps
kind: instruction-reference
owner_paths:
  - apps/fluent-tester
  - apps/tester-core
  - apps/E2E
  - apps/win32
---

# FluentTester and E2E coverage for v0 and v1 components

v0 and v1 components are exercised manually in FluentTester and automatically with Appium and WebdriverIO. Agentic
components use Storybook stories and `wdio` story tests instead; see
[tests and stories](agentic/tests-and-stories.md).

## FluentTester

- [`apps/fluent-tester`](../../../apps/fluent-tester/README.md) hosts the tester on Android, iOS, macOS, and Windows;
  [`apps/win32`](../../../apps/win32) hosts it on Win32.
- Test pages live in `apps/tester-core/src/TestComponents/<Component>/`. Register each page in
  [`apps/tester-core/src/testPages.ts`](../../../apps/tester-core/src/testPages.ts), whose `platforms` array declares
  where it appears.
- A page that supports E2E tests sets the first section's `testID` to the page object's `_pageName` and may supply
  dedicated `e2eSections`, as [ButtonTest](../../../apps/tester-core/src/TestComponents/Button/ButtonTest.tsx) does.

## End-to-end tests

- Tests live in `apps/E2E/src/<Component>/`: a page object under `pages/` (for example
  [ButtonV1PageObject](../../../apps/E2E/src/ButtonV1/pages/ButtonV1PageObject.ts)), platform specs under `specs/` (for
  example `ButtonV1.spec.win.ts`), and shared constants in `consts.ts` where needed.
- Run them with the E2E workspace's declared scripts, such as `yarn e2etest:<platform>` from `apps/E2E`, after the
  matching `e2eprep:<platform>` setup.
- Android selectors use `accessibilityLabel`; other platforms use `testID`.
- The retained Win32 Appium lane uses WinAppDriver. The new native desktop
  lane uses `desktop-test` and the registered desktop driver. Consult
  `apps/E2E/README.md` before changing E2E lane ownership.

When a maintenance change alters observable behavior, update the existing page and spec rather than creating a
parallel test app. Report E2E runs that were not executed, and why, rather than implying coverage (R-VALID-002).
