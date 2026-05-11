# Accessibility Review Prompt

## Goal

Produce a structured accessibility review of a single React Native component. You will combine static rule output with judgment that the automated rules cannot exercise (screen reader prose quality, focus order, role choice, role/state consistency under interaction).

## Inputs

You will receive three artifacts for one component:

1. **Component source** — the implementation file(s) under `packages/components/<Name>/` or `packages/experimental/<Name>/`. Read for prop wiring, internal slot composition, and platform branches.
2. **Rendered a11y tree (JSON)** — the output of `serializeA11yTree(extractA11yTree(root))` for the component's default render. Nodes contain `path`, `type`, and any subset of `role`, `label`, `hint`, `state`, `value`, `actions`, `text`, `testID`, `children`. Paths are arrays of child indices; `[]` is the root.
3. **Automated issues (JSON array)** — the output of `findA11yIssues(tree)`. Each entry has `severity` (`error` | `warning` | `info`), `rule` (e.g., `a11y/missing-label`), `message`, and `path`.

If any of the three is missing, ask for it before continuing.

## Task

Work through these steps in order. Do not skip steps.

### 1. Triage automated findings

For each entry in the automated issues input:

- Locate the offending node by `path` in the a11y tree.
- Decide if the finding is a true positive, a false positive, or duplicates another finding. Note your reasoning briefly.
- For true positives, propose a concrete fix: which prop to add or remove, in which source file. Reference the rule id verbatim so suppression configs can key off it.
- For false positives, explain why the rule fired (e.g., a wrapper that is correctly hidden via `accessibilityElementsHidden`) and propose either a code change or a configuration suppression.

### 2. Look for gaps the rules miss

The shipped rules cover missing labels, empty labels, nested interactive roles, sibling label collisions, missing roles on pressable surfaces, and missing disabled state. They do **not** cover the items below. Inspect the tree and source for each:

- **Role choice fit**: does the chosen `accessibilityRole` match the component's actual semantics? (e.g., a toggle masquerading as `button` should be `switch`.)
- **State completeness**: for `checkbox`/`switch`/`radio`, is `accessibilityState.checked` (or `selected`) wired from props? For collapsible regions, `expanded`? For loading components, `busy`?
- **Value support**: for `adjustable` / slider-like controls, is `accessibilityValue` populated and updated on interaction?
- **Label prose**: are labels human-readable, distinct from neighboring labels, and free of dev-only jargon or duplicated control type (e.g., `"Submit button"` when role is already `button`)?
- **Hint usage**: is `accessibilityHint` reserved for non-obvious actions? It should not duplicate the label.
- **Focus order**: does the visible reading order match the source order in the tree? Off-screen or absolutely positioned slots can reorder focus.
- **Hidden/inert siblings**: are decorative wrappers correctly excluded via `accessible={false}` or `accessibilityElementsHidden`? Are interactive surfaces *not* accidentally hidden?
- **Platform branches**: do `.ios.ts`, `.android.ts`, `.macos.ts`, `.win32.ts` variants diverge in a11y wiring? Flag any platform that omits props the others set.
- **Action contracts**: when `accessibilityActions` is declared, is `onAccessibilityAction` wired and does it match the action names?
- **Live regions**: does dynamic content (toasts, validation messages) use `accessibilityLiveRegion`?

Add a finding for each real issue you observe. Use `severity: 'info'` for stylistic/quality suggestions, `'warning'` for likely problems, `'error'` for spec violations or screen-reader-breaking issues.

### 3. Cross-check with the source

For every finding (yours or the automated set):

- Confirm the offending prop wiring exists or is missing in the source. Quote the line if helpful.
- Make sure the suggested fix is implementable in the source you were given (right file, right hook, no contradiction with the design system's slot model).

### 4. Emit the report

Return exactly one JSON document. Do not include prose outside the JSON.

```json
{
  "component": "<ComponentName>",
  "findings": [
    {
      "severity": "error|warning|info",
      "rule": "<rule id or descriptive slug>",
      "message": "<one sentence describing the issue>",
      "path": [/* indices into the a11y tree, or [] for root */],
      "suggestedFix": "<concrete change, ideally referencing the source file>"
    }
  ],
  "summary": "<2-4 sentence overall assessment>"
}
```

Field rules:

- `component`: the component's display name (e.g., `"ButtonV1"`).
- `findings`: includes every triaged automated finding *and* every new finding from step 2. False positives should still appear with a `suggestedFix` of `"Suppress: <reason>"`.
- `rule`: for automated entries use the original rule id (`a11y/missing-label`); for new findings use a stable slug under `a11y/` (e.g., `a11y/role-mismatch`, `a11y/focus-order`).
- `path`: copy from the source tree when possible. Use `[]` for whole-component issues.
- `suggestedFix`: must be actionable. Avoid generic advice like "improve a11y" — name the prop and the file.
- `summary`: short, factual; the overall a11y posture and the top one or two priorities.

## Constraints

- Do not invent props or roles that React Native does not support. If a problem requires a platform-specific workaround, say so and name the platform.
- Do not output snapshots or full tree dumps in the report — keep findings targeted.
- If the input contains no issues and you find none, return `findings: []` with a `summary` that records what you checked.
