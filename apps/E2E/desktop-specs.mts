export const legacyDesktopSpecs = {
  macos: [['src/**/specs/*.macos.ts']],
  windows: [
    [
      'src/ActivityIndicator/specs/*.win.ts',
      'src/ButtonLegacy/specs/*.win.ts',
      'src/CheckboxLegacy/specs/*.win.ts',
      'src/LinkLegacy/specs/*.win.ts',
      'src/PersonaCoin/specs/*.win.ts',
      'src/Pressable/specs/*.win.ts',
      'src/Separator/specs/*.win.ts',
      'src/TabsLegacy/specs/*.windows.ts',
      'src/TextLegacy/specs/*.win.ts',
      'src/TextV1/specs/*.win.ts',
      'src/Theme/specs/*.win.ts',
      'src/Tokens/specs/*.win.ts',
    ],
  ],
  win32: [['../E2E/src/**/specs/*.win.ts']],
} as const;
