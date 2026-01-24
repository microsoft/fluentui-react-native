/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { TextProps } from 'react-native';
import { Text, View } from 'react-native';

import { mergeStyles } from '@fluentui-react-native/framework-base';
import * as renderer from 'react-test-renderer';

import type { NativeReactType } from '@fluentui-react-native/framework-base';
import { stagedComponent } from '@fluentui-react-native/framework-base';
import { useSlot } from './useSlot';

type PluggableTextProps = React.PropsWithChildren<TextProps> & { inner?: NativeReactType | React.FunctionComponent<TextProps> };

/**
 * Text component that demonstrates pluggability, in this case via passing an alternative component type into a prop called inner.
 */
const PluggableText = stagedComponent((props: PluggableTextProps) => {
  // start by splitting inner and children from the incoming props
  const { inner, ...rest } = props;

  // next call use slot with either inner or Text as the component type, and forwarding the props here. These props will be remembered
  // and don't need to be passed again in the JSX tree.
  const Inner = useSlot(inner || Text, rest);

  // return a closure for finishing off render
  return (extra: TextProps, children: React.ReactNode) => <Inner {...extra}>{children}</Inner>;
});
PluggableText.displayName = 'PluggableText';

const useStyledStagedText = (
  props: PluggableTextProps,
  baseStyle: TextProps['style'],
  inner?: NativeReactType | React.FunctionComponent<TextProps>,
) => {
  // split out any passed in style
  const { style, ...rest } = props;

  // create merged props to pass in to the inner slot
  const mergedProps = { ...rest, style: mergeStyles(baseStyle, style) as TextProps['style'], ...(inner && { inner }) };

  // create a slot based on the pluggable text
  const InnerText = useSlot(PluggableText, mergedProps);

  // return a closure to complete the staged pattern
  return (extra: Partial<PluggableTextProps>, children: React.ReactNode) => {
    return InnerText({ style: undefined, ...extra } as any, children);
  };
};

const HeaderText = stagedComponent((props: PluggableTextProps) => {
  // could be done outside but showing the pattern of using useMemo to avoid creating a new object on every execution
  const baseStyle = React.useMemo<TextProps['style']>(() => ({ fontSize: 24, fontWeight: 'bold' }), []);

  // return a styled text component
  return useStyledStagedText(props, baseStyle);
});

const CaptionText = stagedComponent((props: PluggableTextProps) => {
  // memo to not recreate style every time
  const baseStyle = React.useMemo<TextProps['style']>(() => ({ fontFamily: 'Arial', fontWeight: '200' }), []);

  // return a styled text component
  return useStyledStagedText(props, baseStyle);
});

// Control authored as simple containment
const HeaderCaptionText1 = (props: React.PropsWithChildren<TextProps>) => {
  const { children, ...rest } = props;
  const baseStyle = React.useMemo<TextProps['style']>(() => ({ fontSize: 24, fontWeight: 'bold' }), []);
  const mergedProps = { ...rest, style: mergeStyles(baseStyle, props.style) as TextProps['style'] };
  const InnerText = useSlot(CaptionText, mergedProps);
  return InnerText({ style: undefined } as any, children);
};

// Control authored by plugging the root
const HeaderCaptionText2 = (props: React.PropsWithChildren<TextProps>) => HeaderText({ ...props, inner: CaptionText });

// some styles to use in tests
const styleWithColor: TextProps['style'] = { color: 'blue' };

describe('useSlot tests', () => {
  /** first render the component with no updates */
  it('Two base text elements rendering, with and without styles', () => {
    const tree = renderer
      .create(
        <View>
          <PluggableText>No Style</PluggableText>
          <PluggableText style={styleWithColor}>With Style</PluggableText>
        </View>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Header and caption text render as expected', () => {
    const tree = renderer
      .create(
        <View>
          <HeaderText>Header text</HeaderText>
          <CaptionText>Caption text</CaptionText>
        </View>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Multi-level text elements are equivalent', () => {
    const tree1 = renderer.create(<HeaderCaptionText1>HeaderCaptionText</HeaderCaptionText1>).toJSON();
    expect(tree1).toMatchSnapshot();
    const tree2 = renderer.create(<HeaderCaptionText2>HeaderCaptionText</HeaderCaptionText2>).toJSON();
    expect(tree2).toMatchSnapshot();
    expect(tree1['HeaderCaptionText1']).toEqual(tree2['HeaderCaptionText2']);
  });
});
