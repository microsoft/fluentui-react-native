---
id: repository.code-scanning
kind: instruction-reference
owner_paths:
  - .github/workflows/codeql-analysis.yml
---

# Code scanning

CodeQL ([workflow](../../../.github/workflows/codeql-analysis.yml)) analyzes all JavaScript and TypeScript on each pull
request, including tests, contract fixtures, and scripts. A new alert fails the pull request's **CodeQL** check and
appears as a `github-advanced-security` review comment. The analysis does not run locally, so write code that avoids
the patterns below rather than waiting for CI to find them.

## Rules

- **R-SCAN-001:** A regular expression applied to text from callers, child processes, files, or the network must match
  in linear time. Adjacent quantified parts must not be able to match the same characters, as in `\s*["']?\s*`,
  `(a+)+`, or `.*x.*`. Start each optional part with a character its neighbors cannot match, for example
  `\s*(?:["']\s*)?`, or trim the text instead of matching surrounding whitespace. CodeQL reports violations as
  `js/polynomial-redos` or `js/redos`.
- **R-SCAN-002:** Do not splice values into JavaScript that will run: `node -e`, `eval`, `new Function`, `vm`, or a
  generated spec, hook, worker, or helper module. Keep the source constant and pass values through `process.argv`,
  environment variables, or a JSON file, or derive sibling paths from `import.meta.url` or `__dirname`.
  `JSON.stringify` is not a code sanitizer; CodeQL reports it as `js/bad-code-sanitization`. A generated module whose
  only statement is `export default <JSON value>`, written for a loader that requires a module, is data.
- **R-SCAN-003:** Fix a code-scanning alert in the pull request that introduces it. Dismiss an alert only as a verified
  false positive, with the reason in the dismissal, and never narrow the CodeQL configuration, paths, or queries to
  clear one.

## Patterns

Pass values to a child script as arguments. `node -e <source> <values>` places the first value at `process.argv[1]`; a
script file receives its first value at `process.argv[2]`.

```js
// Avoid: the path becomes part of the program.
spawn(process.execPath, ['-e', `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'done')`]);

// Prefer: the program is constant and the path is an argument.
spawn(process.execPath, ['-e', "require('node:fs').writeFileSync(process.argv[1], 'done')", marker]);
```

A generated spec or module that needs a file next to it resolves it with `new URL('./name', import.meta.url)`. A
module it must import can be loaded with `await import(process.argv[2])`.

Keep at most one way for adjacent quantifiers to divide the same input:

```ts
// Avoid: without a quote, both \s* runs compete for the same spaces, so a failed match is quadratic.
/(password)\s*["']?\s*[:=]/;

// Prefer: the second \s* is reachable only after a quote.
/(password)\s*(?:["']\s*)?[:=]/;
```

When fixing a regular expression, add a regression test that times long adversarial input, such as a keyword followed
by tens of thousands of spaces and no match. `packages/agentic/desktop-test/src/reporting/protocol.test.ts` is an
example.

## Checking a pull request

`gh pr checks <number>` shows the CodeQL result. A GET request to
`repos/microsoft/fluentui-react-native/code-scanning/alerts/<number>` returns an alert's rule and location (see
R-PERM-004 for approved `gh api` use). Alerts close when a later analysis of the branch no longer finds them.
