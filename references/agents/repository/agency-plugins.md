---
id: repository.agency-plugins
kind: instruction-reference
owner_paths:
  - agency.toml
---

# Agency design plugins

Read the [permissions reference](permissions.md) before GitHub API access. Plugin source identifiers are safe to
record; private plugin bodies, personal account names, and credentials do not belong in this public repository.

## Authenticate before resolving sources

Agency plugin sources and `x3-design` repositories require the Microsoft enterprise-managed user (EMU) identity,
not the public GitHub identity used for FURN contributions. Switch before plugin resolution, installation, cache
refresh, or source reads; do not wait for an unauthenticated 404 to infer that a plugin is missing.

For sources on `github.com`, inspect the available accounts and select the contributor's existing Microsoft EMU
account. The angle-bracket values below are local placeholders, not shared account names:

```sh
gh auth status --hostname github.com
gh auth switch --hostname github.com --user <microsoft-emu-login>
gh api --hostname github.com repos/x3-design/fluent-design --jq .full_name
```

Check for credential environment overrides if switching accounts does not change access. Never print their values.
Agency uses `AGENCY_GITHUB_TOKEN` for an explicit GitHub credential override; it ignores `GH_TOKEN`. When needed,
scope the selected EMU credential to one Agency invocation without printing or persisting it:

```sh
AGENCY_GITHUB_TOKEN="$(gh auth token --hostname github.com --user <microsoft-emu-login>)" \
  agency copilot --profile flex-authoring
```

Agency/Git must use the corresponding authenticated credential too; a successful `gh` read alone does not prove
that a separate Git credential helper is configured correctly. If the EMU account is unavailable or access fails,
report the authentication/access blocker rather than falling back to anonymous access or inventing source content.

After private-source work, restore the public identity before fetching, pushing, or using issues/PRs in this public
repository:

```sh
gh auth switch --hostname github.com --user <public-github-login>
```

The GitHub-hosted X3 repository is archived and points to `https://msft.ghe.com/x3-design/fluent-design` for ongoing
upstream work. For that host, check/select the Microsoft EMU identity with `gh auth status` / `gh auth switch` using
`--hostname msft.ghe.com`, and use that hostname on API reads. Do not silently migrate the pinned FURN release or
substitute a mutable upstream checkout because the original repository is archived.

## Load only the applicable profile

[agency.toml](../../../agency.toml) declares opt-in profiles; ordinary sessions do not need every design plugin.
Choose one profile when starting Agency:

```sh
agency copilot --profile flex-authoring
agency copilot --profile flex-motion
agency copilot --profile flex-processes
```

The specialized profiles already include the three `flex-authoring` plugins. All entries use the same immutable
curated Marketplace release and `no-refresh`, matching
[spec-source-lock.json](../../../packages/agentic/components/spec-source-lock.json). Do not replace these entries
with the unpinned `github:x3-design/fluent-design:plugins/...` examples or install a second version of the same
plugin alongside them. Updating the release requires the source-review and drift workflow, not just a cache refresh.
Confirm the expected profile/skills are available in the new session; configuration validation alone does not prove
that private plugins downloaded or loaded successfully.

| Plugin            | Loading and task scope                                                                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flex-components` | Included in all three profiles. Invoke `flex-components:<name>` only for a real pinned Flex catalog component; use the [Flex/X3 source adapter](../../../packages/agentic/components/references/contract-sources/flex-x3.md).       |
| `flex-system`     | Included in all three profiles. Load only the relevant foundation, such as `flex-system:focus`, `flex-system:accessibility`, `flex-system:spacing`, or `flex-system:typography`.                                                    |
| `flex-tokens`     | Included in all three profiles. Use `flex-tokens:core`, `flex-tokens:interaction`, or `flex-tokens:textstyle` for token evidence, then map it through [FURN token guidance](../../../packages/agentic/design/references/tokens.md). |
| `flex-motion`     | Select `flex-motion` only for animation, transitions, or reduced-motion work. Start with `flex-motion:motion-index`, then consult the relevant recipe, accessibility, governance, or performance material.                          |
| `flex-processes`  | Select `flex-processes` for Flex-backed contract review or design-documentation work. Start with `flex-processes:processes-index`; use `flex-processes:spec-review` or `flex-processes:d11n` when applicable.                       |

The candidate plugins not loaded here are `flex-dataviz` (chart implementations), `flex-figma` (Figma library/API
authoring), and `flex-output` (editorial, document, and conversational output rendering). Those surfaces are not
owned by this native component repository. Ordinary Markdown documentation does not require output-renderer rules,
and reading a Figma image as contract evidence does not require a Figma authoring plugin. Reconsider them only for
an explicitly requested task that introduces the corresponding surface.

## Keep FURN contracts authoritative

Plugins supply design evidence, not a replacement implementation workflow. Continue to use the repository's
component classification, contract gate, native guidance, and validation commands. Other source adapters and local
foundations do not acquire a Flex-plugin prerequisite.

Adapt web/CSS/DOM guidance deliberately to React Native. Motion work must preserve native reduced-motion,
focus/accessibility, and platform-performance requirements; browser animation runtimes and CSS token spellings are
not native APIs. Process skills must not replace the local `SPEC.md`, `spec/`, source provenance, or review state
with an upstream web/mobile schema, authorize Figma token migration, or mechanically generate FURN contracts from
private source bodies. Record missing skills, tokens, or platform evidence as gaps instead of guessing.
