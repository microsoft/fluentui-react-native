---
'@fluentui-react-native/components': minor
'@fluentui-react-native/framework-base': minor
'@fluentui-react-native/native-core': minor
---

Add opt-in disabled-focusable pressable targets and MenuItem rows that retain
disabled semantics without enabling activation. Give Input its variant-specific
focus-visible treatment: a shared outline ring or an additive underline
indicator, without a competing native editor ring.
Keep keyboard release cleanup exactly once when disabling a pressed target.

Extend the experimental modern Callout focus operation with native first/last
strategies, report observed dismissal causes without guessing unclassified
notifications, and ignore duplicate close or late ready events for a dismissed
presentation. Rebuild native hosts for the changed modern command schema.
Legacy APIs and prebuilt Win32 commands are unchanged.
