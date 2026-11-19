# Agent evals

Private, opt-in evaluations of `furn-desktop-testing` using controlled **Copilot
CLI** trials, **promptfoo 0.125.1**, and **@rnx-kit/agent-evals 0.1.1**.
Requires Node **>=24.11** and an installed Copilot CLI supporting the flags
checked by the controller. Build dependencies first with `yarn build`.

Ordinary build, lint and test commands **never invoke a model**. `yarn test`
uses a visibly test-only CLI subprocess, real MCP registration/HTTP transport,
the actual published session auditor, and deterministic promptfoo assertions.
It is a harness test, not evidence that a model follows the skill.

## Run

```sh
yarn agent-evals list
yarn agent-evals --help
```

`run` is explicitly metered. Supply `COPILOT_GITHUB_TOKEN` through your trusted
credential mechanism; do not put a token in command arguments or source.
Choose an explicit model, reasoning level, **per-trial** timeout and AI-credit
limit. For example, replacing every placeholder:

```sh
yarn agent-evals run \
  --model <model-id> --reasoning-effort <level> \
  --timeout-ms <milliseconds> --max-ai-credits <per-trial-limit> \
  --case supervisor-unavailable --variant skill \
  --output <new-private-directory-outside-this-repository>
```

Repeat `--case` to select cases; omission runs all four. `--variant no-skill`
disables the published skill for a matched negative control. Outcome and
required-read assertions are the same in both variants; only expected skill
activation differs. Compare runs with the same model, effort, client version,
case selection and limits. `--copilot` selects an explicit executable.
The CLI's credit ceiling is not a hard billing guarantee. No default spend
limit, model, or timeout is inferred.

Output must name a **new directory whose parent exists**, outside the checkout.
Use an owner-only location, including appropriate Windows ACLs. The controller
requests private POSIX modes, but it is not an OS security sandbox.

## Initial development cases

| Case                     | Required behavior                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `plan-only`              | Load the skill and consumer/package context without mutation or workload execution.                                       |
| `supervisor-unavailable` | Observe failed supervisor verification; report blocked, without downgrade or admission.                                   |
| `incomplete-workload`    | Discover the trusted catalog, admit once, observe the incomplete outcome and settled cleanup, and report both truthfully. |
| `ambiguous-admission`    | Reconcile a lost admission response using its original request ID, without resubmission.                                  |

The plan prompt comes from the existing
[development fixture](../../references/agents/evals/cases/desktop-test-new-app-target.json).
This first slice scores routing, exact successful document reads, no mutation,
and structured reporting; it **does not score that fixture's semantic plan
assertions** (helper provisioning, resource ordering and exact identity).
Those assertions are not being reclassified as passed. Holdout fixtures are
not loaded or used for tuning.

All workload behavior is synthetic. The production `createDesktopMcpServer`
registers its real tools/schemas against an injected deterministic connector.
Only `desktop_workload` is exposed; **there is no native driver, host, desktop
lease or app**, and no production verification-bypass flag is introduced.
The fixture does not qualify real supervisor discovery, driver handoff,
all-skipped report production, physical input or native cleanup.

## Isolation and evidence

Each trial has a fresh UUID, Git repository, home, Copilot configuration and
private output directory. Only the generated consumer is trusted in that
profile's `config.json`; the CLI's `--trust-folder` flag conflicts with an
explicit `--session-id`. No global trust state is changed.
The controller invokes the actual skills installer;
package API references are copied at runtime from their canonical source
owners into the synthetic consumer. Knowledge is not duplicated in this app.
Hashes identify every fixture file. This is a **source-documentation projection**,
not packed-npm consumer qualification; a packed-artifact tier remains future work.

The CLI runs with custom instructions, built-in MCPs, extensions, hooks, memory,
history sync, auto-update, shell startup scripts and delegation disabled or
excluded. It gets an explicit credential rather than copied account settings.
Shell execution, writes, URL tools and memory writes are denied; read approval
is scoped to the consumer and the only approved MCP tool is the synthetic
workload tool. Unrecognized tool use fails the trace assertion. Managed policy
still applies. These controls are defense in depth, **not a sandbox for
untrusted executables or fixtures**.

The controller owns an authenticated loopback MCP server, so terminating a
timed-out CLI does not orphan a CLI-launched MCP subprocess. It terminates only
its child process, escalates if necessary, and closes its own connections.
Interrupted or incomplete run plans fail.

Private artifacts include:

- `plan.json`, per-trial `trial.json`, immutable fixture hashes and exact CLI arguments;
- the original session `events.jsonl`, stdout/stderr, command outcome and usage file where available;
- `audit.json` from an explicit-session, credential-free rnx auditor worker;
- `evidence.json` with ordered tool starts/completions, outcomes, skill-context delivery and authoritative fixture events;
- `results.json` and `report.txt` from deterministic promptfoo checks.

The auditor's GitHub lookup has no inherited token or account configuration.
It audits the frozen checkout before anything is removed; reports live outside
that checkout. The auditor normalizes session inputs/changes, **not successful
tool execution**: full completion evidence and the fixture ledger are separate.
Both inline `skill.invoked` and reference-backed `skill.invoked_ref` records
must correlate to delivered context by content ID (SHA-256 for inline content)
and to the exact fixture installation path.
CLI exit zero, a command invocation, or an agent's own claim is never sufficient.
The final JSON reply is a reporting protocol, not an LLM judge.

Promptfoo runs in a separate credential-free process with telemetry/update
checks, provider caching, sharing and database result persistence disabled.
Every declared trial and required assertion must be present and checked.
Empty, missing, duplicate, skipped, unchecked and partially graded suites fail.
No optional model judge, automatic upload, public PR comment or shared history
is enabled. Raw outputs can contain sensitive data: keep them private and
delete only the specific run directory when it is no longer needed.

## Validation and extension

From this workspace run `yarn format`, `yarn build`, `yarn lint`, and `yarn test`.
Repository acceptance uses `yarn clean-lage-cache` then `yarn lage buildci`;
live model runs are deliberately not part of that aggregate.
The JavaScript PR test lane uses Node 24 for the auditor. Other native/build
lanes retain Node 22; the root package's supported engine range is unchanged.

Next tiers are real-client qualification on a selected model, packed consumer
discovery, richer semantic plan assertions, actual relinquish/drain handoff,
and separately authorized single-desktop native trials. Record client/model,
reasoning, instruction hashes, confounders and efficiency independently of
correctness. Do not tune against the held-out case set.
