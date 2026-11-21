---
'@fluentui-react-native/components': minor
'@fluentui-react-native/design': patch
---

Align the agentic component contracts and token bindings with Flex 1.7. Button is action-only: migrate selection to the new Subtle ToggleButton, and use independent leading and trailing icon slots instead of `icon` and `iconPosition`. Use `circular` explicitly in place of `circle`; the square shape was removed.

MenuButton uses `leadingIcon`. Dropdown uses `selectionMode` instead of `multiselect`; MenuItem and ListboxItem use a single selection mode instead of independent indicator flags. Badge defaults to Informative, removes Brand, and adds Filled Counter and Dot layouts. Avatar content modes are mutually exclusive. Tag supports an explicit caller-owned dismiss request, and busy status belongs to the host of a decorative Spinner. Visual defaults and component token overrides now follow the v2 JSON bindings.
