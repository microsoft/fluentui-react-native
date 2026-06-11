export { filterImageProps, filterTextProps, filterViewProps } from './filterProps';
export type { ITextProps, ITextStyle } from './textProps';
export type { IImageProps, IImageStyle } from './imageProps';
export type { IViewProps, IViewStyle, NativeKeyEvent, KeyEventHandler, HandledKeyEvent } from './viewProps';
// Re-exported so the cross-platform prop/style types above remain nameable in consumers'
// generated declaration files (the `Omit<*Additions, ...>` they use references these).
export type { ViewAdditions, TextAdditions, ImageAdditions, CursorValue, AccessibilityAnnotationInfo } from './platformProps';
