# Fluent UI React Native skills

Portable, task-oriented workflows for Copilot CLI, Codex, and Claude:

- `furn-choose-packages`
- `furn-component-authoring`
- `furn-component-contract-authoring`
- `furn-desktop-testing`

Shared accessibility and focus guidance ships once with the suite. Runtime API
documentation stays with its implementing package; this package has no runtime
package dependencies. Its catalog identifies inspected source versions and
integration targets, **not blanket native qualification**.

## Install in a project

Add `@fluentui-react-native/skills` as a development dependency using your
project's package manager and approved version policy. Installing the npm
package alone does not activate skills.

From the project directory, explicitly run one of:

```sh
npx --no-install furn-skills --client copilot
npx --no-install furn-skills --client codex
npx --no-install furn-skills --client claude
```

The dependency-free installer copies the complete suite into project-local
`.agents/skills` (Copilot/Codex) or `.claude/skills` (Claude), with shared files
under that configuration directory's `furn/`. It does not change global
settings, install other packages, add hooks, run a model, or require symlinks.
Use `--project <directory>` to select a project explicitly.

Restart/reload your client's skills if needed. Install only one copy per host;
do not combine local installation with loading the same suite as a plugin.
Updates replace only unchanged files owned by an earlier installation and
reject collisions or local modifications. Shared reference paths depend on
the whole suite: **do not copy a single skill directory or only `SKILL.md`.**

Alternatively, Copilot CLI can register the installed package's `skills`
directory with `copilot skill add <directory>`. Keep that directory available;
registration does not copy it. A plugin envelope is included at the package
root, with a Claude compatibility manifest. Exact plugin interoperability is
a separate qualification surface; direct project-local installation is the
portable default.

See the [distribution reference](references/distribution.md) for boundaries,
compatibility, provenance, source ownership, and checks, and
[AGENTS.md](AGENTS.md) for contributor instructions. The
[reference index](references/README.md) lists package guidance.
