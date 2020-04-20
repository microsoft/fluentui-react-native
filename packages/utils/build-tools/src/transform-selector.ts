import * as upstreamTransformer from 'metro-react-native-babel-transformer';
import * as svgTransformer from 'react-native-svg-transformer';

export function transform({ src, filename, options }) {
  if (filename.endsWith('.svg')) {
    return svgTransformer.transform({ src, filename, options });
  } else {
    return upstreamTransformer.transform({ src, filename, options });
  }
}
