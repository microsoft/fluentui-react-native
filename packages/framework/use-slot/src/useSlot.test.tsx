/** @jsx withSlots */
import { TextProps, Text, View } from 'react-native';
import toJson from 'enzyme-to-json';
import * as React from 'react';
import { mount } from 'enzyme';
import { useSlot } from './useSlot';
import { withSlots } from './withSlots';
import { mergeStyles } from '@fluentui-react-native/merge-props';
import { NativeReactType } from './renderSlot';
import { stagedComponent } from './stagedComponent';

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
  const mergedProps = { ...rest, style: mergeStyles(baseStyle, style), ...(inner && { inner }) };

  // create a slot based on the pluggable text
  const InnerText = useSlot(PluggableText, mergedProps);

  // return a closure to complete the staged pattern
  return (extra: PluggableTextProps, children: React.ReactNode) => <InnerText {...extra}>{children}</InnerText>;
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
  const mergedProps = { ...rest, style: mergeStyles(baseStyle, props.style) };
  const InnerText = useSlot(CaptionText, mergedProps);
  return <InnerText>{children}</InnerText>;
};

// Control authored by plugging the root
const HeaderCaptionText2 = (props: React.PropsWithChildren<TextProps>) => HeaderText({ ...props, inner: CaptionText });

/**
 * this wrapper solves the (so-far) inexplicable type errors from the matchers in typescript
 */
function snapshotTestTree(tree: any) {
  (expect(toJson(tree)) as any).toMatchSnapshot();
}

// some styles to use in tests
const styleWithColor: TextProps['style'] = { color: 'blue' };

describe('useSlot tests', () => {
  /** first render the component with no updates */
  it('Two base text elements rendering, with and without styles', () => {
    const tree = mount(
      <View>
        <PluggableText>No Style</PluggableText>
        <PluggableText style={styleWithColor}>With Style</PluggableText>
      </View>,
    );
    snapshotTestTree(tree);
  });

  it('Header and caption text render as expected', () => {
    const tree = mount(
      <View>
        <HeaderText>Header text</HeaderText>
        <CaptionText>Caption text</CaptionText>
      </View>,
    );
    snapshotTestTree(tree);
  });

  it('Multi-level text elements are equivalent', () => {
    const tree1 = mount(<HeaderCaptionText1>HeaderCaptionText</HeaderCaptionText1>);
    snapshotTestTree(tree1);
    const tree2 = mount(<HeaderCaptionText2>HeaderCaptionText</HeaderCaptionText2>);
    snapshotTestTree(tree2);
    expect(toJson(tree1['HeaderCaptionText1'])).toEqual(toJson(tree2['HeaderCaptionText2']));
  });
});
