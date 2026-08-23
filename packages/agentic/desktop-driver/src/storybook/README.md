# Storybook discovery

This module owns build-time Storybook test discovery. It does not own the running channel server or
test-run coordination; those live under [`server/`](../server/README.md).

## Responsibilities

- statically parse configured `*.stories.ts` and `*.stories.tsx` files;
- derive Storybook-compatible IDs and exact `[story:<id>]` tags;
- validate inline plans and linked specs;
- generate a relocatable, fingerprinted manifest;
- emit the inline-plan WDIO spec; and
- verify a loaded manifest before execution.

Story modules are parsed, never executed. Only JSON-literal `parameters.desktopTest` declarations
are accepted.

## Plan kinds

- **Inline plans** use the closed action schema in `story-plan.ts`. They are compiled into one
  generated spec.
- **Linked specs** point to host-side TypeScript and must contain a runnable suite with the exact
  generated story tag.

## Digest contract

The manifest digest includes normalized story IDs, tags, plans, relative spec/story paths, linked
spec bytes, and the project config fingerprint. Transitive imports of linked specs are not yet
hashed; that decision remains in `NEXT-STEPS.md`.

## Extension rules

- Keep ID behavior compatible with the installed Storybook version.
- Preserve manifest-relative POSIX paths.
- Write generated files atomically with the manifest last.
- Fail on empty discovery by default; zero tests must never become a passing run.
