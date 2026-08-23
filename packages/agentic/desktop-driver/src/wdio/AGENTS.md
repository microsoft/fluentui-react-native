# WDIO module agent guidance

Read [README.md](./README.md) before editing.

## Authoring contract

Standard WebdriverIO is the portable API. Do not introduce a second browser/element abstraction for
test authors. Add to `browser.desktop` only when native desktop drivers cannot express the
operation through standard WDIO behavior.

## Responsibilities

- config/service composition;
- protected native capabilities;
- launcher/worker run-context handoff;
- readiness;
- result and artifact reporting;
- story plan execution;
- Windows attach discovery; and
- standalone driver lifecycle.

Keep launcher and worker results truthful across both `suite` and `spec` strategies. Startup,
readiness, session, app, host, timeout, cancellation, assertion, and cleanup outcomes must remain
distinguishable.

## Documentation

Update package `README.md` for public WDIO APIs, `USAGE.md` for configuration/recipes, `DESIGN.md`
for lifecycle or portability changes, and this module README for internal responsibility changes.

## Validation

Add focused unit tests first, then the fake Storybook E2E. Any portable command change requires
unchanged native assertions on both platforms before release claims change.
