# Test-tools

This is a dev environment only private package designed to aid in testing components via jest

## Color token pinning

`createColorPinningTheme` resolves the platform theme selected by Jest. Pair it with `resolveV0ColorTokens`,
`resolveV1ColorTokens`, or `getColorTokenSnapshot` in `.test.windows.ts`, `.test.win32.ts`, and `.test.macos.ts` files to
snapshot only color-bearing token leaves while preserving nested component states. Windows and Win32 intentionally use
the same Office theme to verify their shared styling contract.

The default macOS pinning theme uses the generated light, standard-contrast Apple aliases. Component snapshots should
track reviewed alias source updates rather than preserve colors from older token packages.
