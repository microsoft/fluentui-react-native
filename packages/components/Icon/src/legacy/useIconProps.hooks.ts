import { Image } from 'react-native';
import { RasterImageIconProps, IconProps } from './Icon.types';

// this hook creates icon props from given source
export function createIconProps(src: number | string | IconProps): IconProps {
  if (src === undefined) return null;

  if (typeof src === 'number') {
    const rasterProps: RasterImageIconProps = { src: src };
    const asset = Image.resolveAssetSource(+src);

    return {
      rasterImageSource: rasterProps,
      width: asset.width,
      height: asset.height,
    };
  } else if (typeof src === 'string') {
    const rasterProps: RasterImageIconProps = { src: { uri: src as string } };
    return { rasterImageSource: rasterProps };
  } else {
    return src as IconProps;
  }
}
