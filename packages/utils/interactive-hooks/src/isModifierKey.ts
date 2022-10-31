/**
 * Verifies if nativeEvent contains modifier key.
 * @param nativeEvent
 * @returns `true` if one or more of modifier keys are `true`
 */
export const isModifierKey = (nativeEvent: any): boolean => {
  return (
    nativeEvent &&
    (nativeEvent.alt ||
      nativeEvent.altKey ||
      nativeEvent.ctrl ||
      nativeEvent.ctrlKey ||
      nativeEvent.meta ||
      nativeEvent.metaKey ||
      nativeEvent.shift ||
      nativeEvent.shiftKey)
  );
};
