import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  assetField,
  defineComponentTokens,
  dimensionToken,
  getComponentTokens,
  numericToken,
  resolveTokenStates,
} from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';
import { parseStarSource, starAssets } from './rating-item.assets';
import type { RatingItemState, RatingItemTokenState } from './rating-item.types';
import schema from './spec/tokens.json' with { type: 'json' };

const star = assetField('fluent-icon', starAssets, parseStarSource);
const slots = {
  root: { style: { width: numericToken, height: numericToken }, props: {} },
  glyph: { style: {}, props: { ...iconTokenProps, outlineSource: star, filledSource: star } },
  fillMask: { style: { width: dimensionToken }, props: {} },
};

const definition = defineComponentTokens<RatingItemTokenState, typeof slots>({ id: 'furn.rating-item', slots, schema });

export const ratingItemStyles = StyleSheet.create({
  root: { alignItems: 'center', flexShrink: 0, justifyContent: 'center' },
  mask: { alignItems: 'flex-start', height: '100%', overflow: 'hidden', position: 'absolute', start: 0, top: 0 },
});

type StarProps = IconElementProps & { svgSource: SvgIconSource };

export function resolveRatingItemChrome(state: RatingItemState): {
  root: ViewStyle;
  mask: ViewStyle;
  frame: ViewStyle;
  base: StarProps;
  overlay: StarProps;
} {
  const tokens = getComponentTokens(state, definition);
  const { outlineSource, filledSource, ...glyph } = resolveTokenStates(tokens.glyph, state).props;
  return {
    root: resolveTokenStates(tokens.root, state).style,
    mask: resolveTokenStates(tokens.fillMask, state).style,
    frame: { width: glyph.width, height: glyph.height },
    base: { ...glyph, svgSource: state.fill === 'full' ? filledSource : outlineSource },
    overlay: { ...glyph, svgSource: filledSource },
  };
}
