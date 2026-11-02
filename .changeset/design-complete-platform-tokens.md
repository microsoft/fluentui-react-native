---
'@fluentui-react-native/design': patch
---

Generate complete Fluent color, shadow, font, and appearance token sets for Win32, Windows, macOS, iOS, and Android.
Every platform provides light, dark, light elevated, dark elevated, high-contrast light, and high-contrast dark sets.
Elevated sets fall back to their color scheme, high-contrast light falls back to high-contrast dark, and platforms
without high-contrast data use light and dark. Windows high contrast uses the Win32 high-contrast set with Windows
system color brushes. Preserve native values and fill missing tokens with same-platform equivalents, then portable
same-scheme defaults. Use platform global typography when font aliases are absent and enforce required generated token
types.
