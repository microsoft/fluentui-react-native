---
'@fluentui-react-native/components': minor
---

Add the reviewed Dropdown contract and its macOS (Paper and Fabric), Windows Fabric, and Office Win32 implementation.
Dropdown draws Input's outline or underline chrome on a combobox trigger and presents ListboxItem options in a native
list popup for single or multiple selection, with controlled or uncontrolled selection and presence, a placeholder, and
a count summary when selected labels do not fit. On macOS the list requests a vertical scroller only while its options
overflow, so Paper's legacy scrollers do not inset the options. Dropdown is not exported from the package root yet.

ListboxItem gains a `value` prop. Inside a Dropdown list, an item with a value becomes a bound option that the list
selects, positions, and focuses, and that exposes select, add-to-selection, and remove-from-selection actions. Outside
a list, or without a value, ListboxItem is unchanged.
