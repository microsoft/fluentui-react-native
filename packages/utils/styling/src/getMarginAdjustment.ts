const margins = { marginTop: 0, marginBottom: 0, marginStart: 0, marginEnd: 0 };

/**
 * Adjusts the margin of text so that it's centered within the layout area of the text.
 * Be default, there is no adjustment, but some platforms may need adjustments due to
 * their font.
 * @returns Adjustment necessary for text
 */
export function getTextMarginAdjustment() {
  return margins;
}
