---
'@fluentui-react-native/components': minor
---

Add the reviewed Dropdown contract and its Windows and Office Win32 implementation. Dropdown draws Input's outline or
underline chrome on a combobox trigger and presents ListboxItem options in a native list popup for single or multiple
selection, with controlled or uncontrolled selection and presence, a placeholder, and a count summary when selected
labels do not fit. Dropdown is not exported from the package root until macOS qualifies.

ListboxItem gains a `value` prop. Inside a Dropdown list, an item with a value becomes a bound option that the list
selects, positions, and focuses, and that exposes select, add-to-selection, and remove-from-selection actions. Outside
a list, or without a value, ListboxItem is unchanged.
