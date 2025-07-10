// @ts-check

// @ts-expect-error - declaration file is not needed for this config
import * as upstreamTransformer from 'metro-react-native-babel-transformer';
// @ts-expect-error - declaration file is not needed for this config
import * as svgTransformer from 'react-native-svg-transformer';

/**
 *
 * @param {{src: string, filename: string, options: object}} param0
 */
export function transform({ src, filename, options }) {
  if (filename.endsWith('.svg')) {
    return svgTransformer.transform({ src, filename, options });
  } else {
    return upstreamTransformer.transform({ src, filename, options });
  }
}
