// Temporary local copy of the codegen in microsoft/fluentui-system-icons#1292 (`@fluentui/react-native-icons/codegen`).
// Delete this folder and import from that package once it is published and clears the dependency age gate.
export { generateIconComponents } from './convert.ts';
export { ICON_STYLES, parseIconName, resolveSvgIconsDir } from './icons.ts';
export type { IconSpec, IconStyle, ParsedIconName } from './icons.ts';
export { DEFAULT_UTIL_PATH } from './options.ts';
export type { CodegenOptions, QuoteStyle } from './options.ts';
export { generateIconFile, generateIconModule, renderIconModule } from './render.ts';
