# Test-tools

This is a dev environment only private package designed to aid in testing components via jest

## Color token pinning

`createColorPinningTheme` resolves the platform theme selected by Jest. Pair it with `resolveV0ColorTokens`,
`resolveV1ColorTokens`, or `getColorTokenSnapshot` in `.test.win32.ts` and `.test.macos.ts` files to snapshot only
color-bearing token leaves while preserving nested component states.
