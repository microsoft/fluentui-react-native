# Public primitives

Import these unstyled building blocks from
`@fluentui-react-native/components/primitives`. They are not exported from the
package root.

Primitive component names follow the same stability convention as higher-order
components. Public helpers whose composition contract may change use an
`_unstable` suffix.

| Primitive            | Contract                                                 |
| -------------------- | -------------------------------------------------------- |
| `CheckboxIndicator`  | [Checkbox indicator](checkbox-indicator/CONTRACT.md)     |
| `CompoundItemLayout` | [Compound item layout](compound-item-layout/CONTRACT.md) |
| `FocusVisual`        | [Focus visual](focus-visual/CONTRACT.md)                 |
| `Icon`               | [Icon](icon/CONTRACT.md)                                 |
| `LayoutStableText`   | [Layout-stable text](layout-stable-text/CONTRACT.md)     |

Each primitive is extracted for a reusable behavioral or structural contract.
Package-specific private helpers belong in `src/common` instead.
