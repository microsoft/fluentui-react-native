import { globalTokens } from '@fluentui-react-native/theme-tokens';

/**
 * Adjusts the margin of text so that it's centered within the layout area of the text.
 * Due to how Segoe UI lays out, the text does not appeared centered within the text
 * layout area without some fuding of margins.
 * @returns Adjustment necessary for text
 */
export function getTextMarginTopAdjustment(): number {
  return globalTokens.stroke.width.thin * -1;
}

/**
 * Adjusts the margin of text so that it's centered within the layout area of the text.
 * Due to how Segoe UI lays out, the text does not appeared centered within the text
 * layout area without some fuding of margins.
 * @returns Adjustment necessary for text
 */
export function getTextMarginBottomAdjustment(): number {
  return globalTokens.stroke.width.thin;
}

/**
 * Adjusts the margin of text so that it's centered within the layout area of the text.
 * Due to how Segoe UI lays out, the text does not appeared centered within the text
 * layout area without some fuding of margins.
 * @returns Adjustment necessary for text
 */
export function getTextMarginLeftAdjustment(): number {
  return globalTokens.stroke.width.thin;
}

/**
 * Adjusts the margin of text so that it's centered within the layout area of the text.
 * Due to how Segoe UI lays out, the text does not appeared centered within the text
 * layout area without some fuding of margins.
 * @returns Adjustment necessary for text
 */
export function getTextMarginRightAdjustment(): number {
  return globalTokens.stroke.width.thin * -1;
}
