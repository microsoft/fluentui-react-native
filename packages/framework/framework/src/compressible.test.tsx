/** @jsxRuntime classic */
/** @jsx withSlots */
import * as React from 'react';
import type { TextProps, TextStyle } from 'react-native';
import { Text, View } from 'react-native';

import { mergeStyles } from '@fluentui-react-native/framework-base';
import type { Theme } from '@fluentui-react-native/theme-types';
import { useSlot, withSlots } from '@fluentui-react-native/use-slot';
import { applyTokenLayers } from '@fluentui-react-native/use-tokens';
import * as renderer from 'react-test-renderer';

import { compressible } from './compressible';
import { buildUseTokens } from './useTokens';
import type { UseTokens } from './useTokens';

type Variant = 'normal' | 'header' | 'caption';
interface VariantTextTokens {
  color?: string;
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
  defaultType?: Variant;
  header?: VariantTextTokens;
  caption?: VariantTextTokens;
}

type VariantTextProps = TextProps & { variant?: Variant };

const useVariantTokens = buildUseTokens<VariantTextTokens>({
  color: 'black',
  fontSize: 12,
  fontWeight: '500',
  defaultType: 'normal',
  header: {
    color: 'blue',
    fontSize: 16,
    fontWeight: '700',
  },
  caption: {
    color: 'gray',
    fontWeight: '300',
  },
});

const VariantText = compressible<VariantTextProps, VariantTextTokens>(
  (props: VariantTextProps, useTokens: UseTokens<VariantTextTokens>) => {
    // fake theme here
    const theme: Theme = {} as Theme;
    // get the tokens
    let [tokens, cache] = useTokens(theme);
    // split the props, defaulting the variant type to the default type from the tokens
    const { variant = tokens.defaultType, style, ...rest } = props;
    // now apply the alternate layer tokens as appropriate
    [tokens, cache] = applyTokenLayers(tokens, ['normal', 'header', 'caption'], cache, (layer) => layer === variant);
    // merge styles together with what is passed in
    const mergedStyle = mergeStyles({ color: tokens.color, fontSize: tokens.fontSize, fontWeight: tokens.fontWeight }, style);
    // now get the slot
    const InnerText = useSlot<TextProps>(Text, { ...rest, style: mergedStyle });

    return (extra: VariantTextProps, children: React.ReactNode) => {
      return <InnerText {...extra}>{children}</InnerText>;
    };
  },
  useVariantTokens,
);

const SuperHeader = VariantText.customize({ header: { fontSize: 24, color: 'purple' } });

type LabelProps = {
  headerText: string;
  captionText?: string;
  headerSlot?: React.FunctionComponent<VariantTextProps>;
  captionSlot?: React.FunctionComponent<VariantTextProps>;
};

type LabelTokens = {
  headerVariant?: Variant;
  captionVariant?: Variant;
};

const useLabelTokens = buildUseTokens<LabelTokens>({
  headerVariant: 'header',
  captionVariant: 'caption',
});

const Label = compressible<LabelProps, LabelTokens>((props: LabelProps, useTokens: UseTokens<LabelTokens>) => {
  const theme: Theme = {} as Theme;
  const [tokens] = useTokens(theme);
  const { headerText, captionText, headerSlot, captionSlot } = props;
  const Header = useSlot<VariantTextProps>(headerSlot || VariantText, { variant: tokens.headerVariant });
  const Caption = useSlot<VariantTextProps>(captionSlot || VariantText, { variant: tokens.captionVariant });
  return () => {
    if (captionText) {
      return (
        <View>
          <Header>{headerText}</Header>
          <Caption>{captionText}</Caption>
        </View>
      );
    }
    return <Header>{headerText}</Header>;
  };
}, useLabelTokens);

describe('compressible tests', () => {
  it('Two labels, one with caption and one without', () => {
    const tree = renderer
      .create(
        <View>
          <Label headerText="Header1" />
          <Label headerText="Header2" captionText="Caption2" />
        </View>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Two labels, one plugging in SuperHeader instead', () => {
    const tree = renderer
      .create(
        <View>
          <Label headerText="Super Header" headerSlot={SuperHeader} captionText="Normal caption" />
          <Label headerText="Normal Header" captionText="Another normal caption" />
        </View>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
