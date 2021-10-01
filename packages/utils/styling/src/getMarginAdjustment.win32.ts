const margins = { marginTop: -1, marginBottom: 1, marginLeft: 1, marginRight: -1 };

/**
 * Adjusts the margin of text so that it's centered within the layout area of the text.
 * Due to how Segoe UI lays out, the text does not appeared centered within the text
 * layout area without some fuding of margins.
 * @returns Adjustment necessary for text
 */
export function getTextMarginAdjustment() {
  return margins;
}
