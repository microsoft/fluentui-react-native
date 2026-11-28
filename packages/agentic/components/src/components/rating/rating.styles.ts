import { StyleSheet } from 'react-native';
import {
  alignItemsToken,
  colorToken,
  defineComponentTokens,
  flexDirectionToken,
  getGapStyleValue,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import type { RatingState } from './rating.types';
import schema from './spec/tokens.json' with { type: 'json' };

type TokenState = Pick<RatingState, 'size'>;
const slots = {
  root: {
    style: { backgroundColor: colorToken, flexDirection: flexDirectionToken, alignItems: alignItemsToken, gap: getGapStyleValue },
    props: {},
  },
};
declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.rating': ComponentTokenPatch<TokenState, typeof slots>;
  }
}
export const ratingTokens = defineComponentTokens<TokenState, typeof slots>({ id: 'furn.rating', slots, schema });
export const ratingStyles = StyleSheet.create({
  input: { alignSelf: 'flex-start', position: 'relative' },
  target: { ...StyleSheet.absoluteFillObject },
});
