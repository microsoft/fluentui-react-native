# Staged spec migration

The former `specs/` files were source copies or adaptations used to stage
component work. They are removed under [#4252](https://github.com/microsoft/fluentui-react-native/issues/4252):
they are not local React Native contracts and must not be maintained as a
parallel component catalog.

For future work, start an authoring session with the pinned
`flex-components:<name>` reference. When implementation begins, author an
original React Native contract in `src/components/<name>/` and validate it
against the supported platforms, types, tests, and stories. Do not reproduce
Flex prose, token tables, or web behavior wholesale.

All linked implementation issues below were verified **open** on 2026-08-28.
The legacy files did not contain issue references; the mappings are consistent
between `spec-source-lock.json` and `spec-source-report.json`.
The feasibility and blockers are the recorded staging outcomes, not a claim
that every named dependency is still absent. Several dependencies were
implemented later; each component issue must re-evaluate the outcome against
the current package before drafting its contract.

The machine-readable records live in `spec-source-lock.json`. Each carries a
status, feasibility, reason, re-evaluation decision, and last-evaluated date.
`legacySpecEvidence` pins the repository commit and path template containing
the complete original FURN blocker analysis, so details remain recoverable
after the staged source copies are removed.

| Component       | Issue                                                                   | Recorded RN feasibility        | Recorded blocker or dependency                                                   | Re-evaluation decision                                                                    |
| --------------- | ----------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Breadcrumb      | [#4219](https://github.com/microsoft/fluentui-react-native/issues/4219) | Partial; blocked               | Popover, Menu, and Tooltip surfaces are absent                                   | Define or provide the overlay/menu stack                                                  |
| Drawer          | [#4223](https://github.com/microsoft/fluentui-react-native/issues/4223) | Partial; blocked as authored   | Arbitrary-child focus trap and return-focus lifecycle                            | Define a supported native focus-management path                                           |
| Dropdown        | [#4224](https://github.com/microsoft/fluentui-react-native/issues/4224) | Feasible in principle; blocked | Popover and ListboxItem contracts                                                | Reuse the implemented ListboxItem contract and decide the remaining overlay dependency    |
| InfoLabel       | [#4226](https://github.com/microsoft/fluentui-react-native/issues/4226) | Blocked                        | Popover anchoring, dismissal, focus, and trigger accessibility                   | Unblock the shared overlay contract                                                       |
| Interaction Tag | [#4227](https://github.com/microsoft/fluentui-react-native/issues/4227) | Feasible in principle; blocked | Avatar/Tag contracts and public package wiring                                   | Re-evaluate against implemented Avatar and Tag, then decide export scope                  |
| Label           | [#4228](https://github.com/microsoft/fluentui-react-native/issues/4228) | Blocked as authored            | HTML label/control association has no pure RN equivalent                         | Choose an RN association or visual-only contract                                          |
| Link            | [#4229](https://github.com/microsoft/fluentui-react-native/issues/4229) | Partial; blocked as authored   | Web navigation semantics and unsupported underline geometry                      | Explicitly accept an RN text-link approximation or retarget                               |
| List            | [#4230](https://github.com/microsoft/fluentui-react-native/issues/4230) | Feasible in principle; blocked | ListItem row, focus, and accessibility contract                                  | Reuse implemented ListItem and define collection focus and accessibility                  |
| MenuButton      | [#4231](https://github.com/microsoft/fluentui-react-native/issues/4231) | Feasible in principle; blocked | Menu, Popover, and MenuItem stack                                                | Land the menu/overlay dependencies                                                        |
| Menu            | [#4232](https://github.com/microsoft/fluentui-react-native/issues/4232) | Partial; blocked               | Overlay, MenuItem, Divider, and keyboard/focus support                           | Reuse implemented MenuItem and Divider, then define the overlay and composite focus model |
| MessageBar      | [#4233](https://github.com/microsoft/fluentui-react-native/issues/4233) | Partial; blocked               | Cross-platform Fluent status-icon source                                         | Provide canonical status-icon assets                                                      |
| Popover         | [#4236](https://github.com/microsoft/fluentui-react-native/issues/4236) | Blocked                        | Anchor measurement, edge-aware placement, dismissal, and focus host              | Establish reusable native/platform overlay infrastructure                                 |
| RadioGroup      | [#4237](https://github.com/microsoft/fluentui-react-native/issues/4237) | Feasible in principle; blocked | Radio child and label/legend composition                                         | Reuse implemented Radio and decide group labeling and navigation                          |
| Scrollbar       | [#4238](https://github.com/microsoft/fluentui-react-native/issues/4238) | Blocked                        | Scroll metrics, tokenized thumb control, and drag interaction need a native host | Define a scroll-source API and platform scrollbar bridge                                  |
| Tablist         | [#4243](https://github.com/microsoft/fluentui-react-native/issues/4243) | Feasible in principle; blocked | Tab child selection and roving focus                                             | Reuse implemented Tab and define roving focus and selection ownership                     |
| Textarea        | [#4245](https://github.com/microsoft/fluentui-react-native/issues/4245) | Blocked as authored            | HTML textarea semantics and CSS resize behavior                                  | Make the product/API choice described below                                               |
| Toolbar         | [#4248](https://github.com/microsoft/fluentui-react-native/issues/4248) | Partial; blocked               | Roving focus needs focusable Button refs; Divider was absent                     | Reuse implemented Divider and define imperative focus for toolbar children                |
| Tooltip         | [#4249](https://github.com/microsoft/fluentui-react-native/issues/4249) | Blocked as authored            | Anchor/overlay host and trigger-coupled accessibility                            | Establish overlay infrastructure or retarget the contract                                 |

## Textarea

CSS `resize` and native HTML `<textarea>` semantics do not map to a pure React
Native `TextInput`. A future implementation therefore requires an explicit
choice between a platform-native RN approximation, with **no resize-handle
parity** with the documented Windows/macOS behavior, and a web/CSS-specific
component. This migration does not make that product or API decision.

## Superseded staging criteria

Issue #4252 originally required commands that copied an upstream skill into
`specs/<name>` and later promoted that folder. Those criteria are intentionally
rejected by this implementation: copying private source bodies into a public
staging tree conflicts with the conservative disclosure boundary, and a
mechanical web-to-native transform reproduces the platform assumptions that
created these blockers.

The replacement is the pinned `flex-authoring` session plus a directly authored
local contract. It preserves reproducibility through immutable paths and
digests, preserves reviewability through contract lifecycle and requirement
evidence, and treats all Marketplace or x3 HEAD changes as proposals. The issue
and pull request must be evaluated against this approved replacement rather
than the obsolete pull/promote acceptance checks.

## Scope

Primitives remain governed by their local `CONTRACT.md` files and are not part
of this migration.
