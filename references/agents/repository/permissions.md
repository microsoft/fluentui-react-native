---
id: repository.permissions
kind: instruction-reference
owner_paths:
  - .github/hooks/agent-permissions.json
  - .github/scripts/agent-permissions.mjs
---

# Agent permissions

The shared Copilot CLI defaults are implemented by [the repository hook](../../../.github/hooks/agent-permissions.json),
not by prose instructions alone. After trusting this repository, start a new CLI session to load the hook. Node.js must
be on `PATH`; the hook itself needs no dependency installation.

- **R-PERM-001:** Hook approvals are not a sandbox. Operations the hook does not approve fall through to the CLI's
  normal permission handling; they are not blanket-denied, and they are not implicitly authorized.
- **R-PERM-002:** Do not amend commits, discard other people's changes, or rewrite history without explicit
  authorization.
- **R-PERM-003:** Never print authentication tokens. Do not commit personal permission files, account names, or
  credentials.
- **R-PERM-004:** REST `gh api` calls to user, repository, and search endpoints are approved only for GET requests
  without request-body or field flags. GraphQL and API mutations require separate approval.
- **R-PERM-005:** Run Pod operations only from the owning app or its `ios`/`macos` directory. Root-level Pod
  invocations, updates of every pod, global cache cleanup, and `pod deintegrate` require separate approval.
- **R-PERM-006:** Process inspection and loopback probes are limited to the constrained forms below. Uploads, redirects,
  output files, arbitrary endpoints, and process termination are not pre-approved.
- **R-PERM-007:** Unrestricted `screencapture`, `osascript`, debugger attachment, external crash-report directories,
  certificate trust changes, and TCC resets remain separately authorized. Do not grant them broadly to work around a
  failed native capability check.
- **R-PERM-008:** Run `yarn test:agent-permissions` after changing the permission policy.

## Approved operations

- Read and write files inside this repository.
- Run all Yarn commands, including `yarn` and `yarn install`.
- Inspect Git state, stage changes, create new local commits, list branches, and fetch from `origin` (subject to
  R-PERM-002).
- Read GitHub issues, pull requests, workflow definitions, and pipeline runs using `gh` (subject to R-PERM-004).
- Inspect the active account with `gh auth status` and `gh api user --jq .login`, and use `gh auth switch` to select an
  existing authenticated account when needed (subject to R-PERM-003).
- Run `pod install` (including `--repo-update` and `--clean-install`) or named `pod update <Pod>...` operations,
  optionally through `bundle exec`, from the owning app or its `ios`/`macos` directory. A project-directory argument
  must resolve to that app's native directory and existing Podfile (R-PERM-005).
- Inspect processes and listeners with constrained `ps` and `lsof` commands in Bash. Probe loopback `/status` and
  `/index.json` using `curl -q` (which disables user curl configuration), GET or HEAD, and the instance's reported port
  (R-PERM-006).

## How the hook evaluates commands

The hook accepts simple Bash or PowerShell commands and `&&` sequences when **every** command is approved.
`cd ./<workspace> && ...` is allowed only within the repository; use `./` to avoid Bash `CDPATH`. In Bash,
native-driver variables listed in the hook may prefix Yarn commands, directly for unquoted values or through `env`, for
example `FURN_NATIVE_DRIVER_TEST=1 yarn test` or
`env "FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY=FURN Development" yarn storybook build-driver --macos`.

Arbitrary environment overrides, pipelines, redirections, shell expansions, unrecognized options, remote writes, and
destructive Git operations fall through to the CLI's normal permission handling (R-PERM-001). Run commands separately
when practical. File approvals resolve symlinks and are limited to this repository. Yarn scripts and Git hooks can
execute arbitrary code, and explicit approvals intentionally trust them.

## Native diagnostics and capture

The Yarn approval covers the supported macOS, Windows, and Win32 Storybook workflows; extra blanket approvals for
Xcode, Swift, PowerShell scripts, Metro, or screen capture are unnecessary. Use the
[Storybook diagnostics commands](../../../apps/storybook/AGENTS.md#native-diagnostics).

Screenshots require a running driver or app and the operating system's own screen-recording permission; CLI approval
does not grant Accessibility or Screen Recording access. Keep evidence scoped to the registered target and ignored
artifact directories (R-PERM-007).

## Extending permissions locally

Contributors can add permissions through the CLI's "don't ask again in this repo" prompt, which saves repository-scoped
approvals in their local `~/.copilot/permissions-config.json`, or through `--allow-tool` flags. Personal hooks can be
defined in the gitignored `.github/copilot/settings.local.json`. To opt out of hooks locally, set
`disableAllHooks: true` there; this disables all non-policy hooks. Hook approvals precede normal tool permission checks,
so disable the hook if CLI deny rules must govern these approved operations.

See the [Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference) and the
[saved permissions schema](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference#permissions-configjson).
