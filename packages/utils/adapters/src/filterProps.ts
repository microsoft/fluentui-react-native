import { getViewMask, getTextMask, getImageMask } from './filters';

/**
 * Prop transform functions that filter a set of props down to only those valid for the target native
 * component (View, Text, or Image). They take a props object and return a filtered props object,
 * matching the PropsTransform shape used by the slot/composition frameworks. Each mask is computed once
 * and memoized as it does not change during the lifecycle of the app.
 *
 * If no props need to be removed the original object is returned to preserve referential identity.
 */
function createPropsMaskTransform(getMask: () => Record<string, boolean>) {
  let mask: Record<string, boolean> | undefined;
  return <T,>(props: T): T => {
    if (!props || typeof props !== 'object') {
      return props;
    }
    mask ??= getMask();
    let result: T | undefined;
    for (const key of Object.keys(props)) {
      if (!mask[key]) {
        result ??= { ...props };
        delete (result as Record<string, unknown>)[key];
      }
    }
    return result ?? props;
  };
}

/**
 * Filter a set of props down to only valid View props.
 */
export const filterViewProps = createPropsMaskTransform(getViewMask);

/**
 * Filter a set of props down to only valid Text props.
 */
export const filterTextProps = createPropsMaskTransform(getTextMask);

/**
 * Filter a set of props down to only valid Image props.
 */
export const filterImageProps = createPropsMaskTransform(getImageMask);
