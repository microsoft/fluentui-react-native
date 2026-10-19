---
'@fluentui-react-native/components': minor
'@fluentui-react-native/native-core': minor
---

Add the reviewed Menu and MenuButton contracts and their macOS implementation: command rows with wrapping arrows,
Home/End, type-ahead, two submenu levels that open on arrows, press, or hover, activation dismissal, and focus return.
MenuButton adds Button chrome with a down chevron, Up/Down entry, and Tab past the trigger. Neither is exported from the
package root until Windows and Office Win32 qualify. MenuItem gains a `submenu` prop and a Menu context that supplies
registration, type-ahead labels, and the platform's disabled-focusable default.

The experimental modern Callout accepts `tabNavigation: 'cycle' | 'dismiss' | 'continue'` and reports `tab-forward` and
`tab-backward` dismissals. On macOS, Tab in a popup family closes its outermost Tab-exiting presentation and can continue
focus past the anchor. Legacy Callout behavior and APIs are unchanged.
