---
name: furn-desktop-testing
description: Configure, run, or troubleshoot native desktop tests with Fluent UI React Native desktop-test, desktop-driver, and optional storybook-desktop. Covers app targets, suites, helpers, permissions, WDIO, story callbacks, reports, and CI. Not for package implementation changes or application build-toolchain development.
license: MIT
---

# FURN desktop testing

Read [consumer context](../../../references/agents/portable/context.md) first.
Resolve references from the target application's installed dependencies, not
from an assumed FURN checkout. Storybook is optional; do not require it for a
neutral desktop-test or desktop-driver task.

| Task                               | Read                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add an app target or suite         | `@fluentui-react-native/desktop-test/references/configuration.md`                                                                                                                                                 |
| Run stages or inspect results      | `@fluentui-react-native/desktop-test/references/commands.md` and `@fluentui-react-native/desktop-test/references/reporting.md`                                                                                    |
| Prepare a platform/helper          | `@fluentui-react-native/desktop-test/references/platforms.md` and `@fluentui-react-native/desktop-driver/references/native-helpers.md`                                                                            |
| Storybook integration/callbacks    | `@fluentui-react-native/storybook-desktop/references/integration.md`, `@fluentui-react-native/storybook-desktop/references/commands.md`, and `@fluentui-react-native/storybook-desktop/references/story-tests.md` |
| E2E adapters or lifecycle failures | `@fluentui-react-native/desktop-test/references/wdio-suites.md` and `@fluentui-react-native/desktop-test/references/lifecycle.md`                                                                                 |

1. Identify the consumer workspace; read its instructions, configuration, and
   declared scripts. Do not change installed package source to configure a test.
2. Reproduce with the narrowest declared stage, suite, story, or filter.
   Provision the verified helper explicitly; never guess flags or invoke
   private runner internals.
3. Obtain authorization before changing privacy settings. Do not overlap
   interactive workloads or stop resources not owned by this run.
4. Use the documented reporter modes for bounded machine-readable output;
   use NDJSON progress only when a live event stream is useful.
5. Report failures, skips, unsupported capabilities, empty work, and incomplete
   work distinctly. Skips are not passes. Native accessibility claims require
   [native accessibility evidence](../../../references/agents/portable/accessibility.md),
   not a JavaScript event or a successful bundle.
6. Follow the consumer repository's validation and release rules. In FURN,
   root and app/package instructions own contributor checks and routing to
   maintenance or Storybook build workflows.

Component assertions belong to
[component authoring](../furn-component-authoring/SKILL.md), not to a new
application lifecycle implementation.
