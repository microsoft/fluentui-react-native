# Color validation

`@fluentui-react-native/design/color-validation` contains test and design-tool
policy built on `color-lib`: WCAG thresholds, canonical semantic token
pairings, structured pair audits, failure filters, unresolvable-color filters,
and pinned conformance fixtures.

This submodule is intentionally not a component runtime dependency. Product
code that only needs parsing, conversion, interaction generation, compositing,
or a direct contrast ratio should import `color-lib`. Bundle scenarios enforce
that the design root and `color-lib` do not load `color-validation`.

The validation suite audits rest, hover, and pressed values for both default
and Bebop Warm interaction variants. The pinned default theme has two dark
pressed failures: danger-primary on danger-soft and warning-primary on
warning-soft. The pinned Bebop Warm theme additionally fails danger-primary on
neutral-nearer and danger-subtle in that state. The tests make those existing
results explicit and reject additional regressions.
