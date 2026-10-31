import { StyleSheet } from 'react-native';

// Room for native focus rings, which draw outside a row's bounds.
const focusRingOutset = 4;

// The widest layout a popup may take. A popup's Callout lies inside its trigger's container, or a parent popup's layout,
// which would otherwise cap the popup at that width.
const popupLayoutWidth = 4096;

/** Layout for the content of a native popup that sizes to its widest row. */
export const popupLayoutStyles = StyleSheet.create({
  /** Hosts a Callout in a wide, zero-height layout that does not affect the trigger's container. */
  host: {
    height: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: popupLayoutWidth,
  },
  // Yoga measures a scrolling row's children at their max-content width, so the content takes its widest row's natural
  // width instead of filling the window; rows then stretch to that width so trailing visuals align.
  fit: {
    flexDirection: 'row',
    margin: -focusRingOutset,
    overflow: 'scroll',
    padding: focusRingOutset,
  },
});
