/** @jsx withSlots */
import { buildUseTokens, UseTokens } from './useTokens';
import { applyTokenLayers } from '@fluentui-react-native/use-tokens';
import { TextProps, TextStyle, Text, View } from 'react-native';
import { compressible } from './compressible';
import { Theme } from '@fluentui-react-native/theme-types';
import { mergeStyles } from '@fluentui-react-native/merge-props';
import { useSlot, withSlots } from '@fluentui-react-native/use-slot';
import * as React from 'react';
import toJson from 'enzyme-to-json';
import { mount } from 'enzyme';

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

/**
 * this wrapper solves the (so-far) inexplicable type errors from the matchers in typescript
 */
function snapshotTestTree(tree: any) {
  (expect(toJson(tree)) as any).toMatchSnapshot();
}

describe('compressible tests', () => {
  /** first render the component with no updates */
  it('Two labels, one with caption and one without', () => {
    const tree = mount(
      <View>
        <Label headerText="Header1" />
        <Label headerText="Header2" captionText="Caption2" />
      </View>,
    );
    snapshotTestTree(tree);
  });

  it('Two labels, one plugging in SuperHeader instead', () => {
    const tree = mount(
      <View>
        <Label headerText="Super Header" headerSlot={SuperHeader} captionText="Normal caption" />
        <Label headerText="Normal Header" captionText="Another normal caption" />
      </View>,
    );
    snapshotTestTree(tree);
  });
});
