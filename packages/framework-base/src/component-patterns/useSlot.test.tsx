/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { TextProps, TextStyle } from 'react-native';
import { Text, View } from 'react-native';

import type { FunctionComponent } from '../types/render.types.ts';
import { mergeStyles } from '../merge-props/mergeStyles.ts';
import * as renderer from 'react-test-renderer';
import { act } from 'react';

import { phasedComponent, directComponent, stagedComponent } from '@fluentui-react-native/framework-base';
import { useSlot } from './useSlot.ts';

type PluggableTextProps = TextProps & { inner?: FunctionComponent<TextProps> };

/**
 * Text component that demonstrates pluggability, in this case via passing an alternative component type into a prop called inner.
 */
const PluggableText = phasedComponent((props: PluggableTextProps) => {
  // start by splitting inner and children from the incoming props
  const { inner, ...rest } = props;

  // next call use slot with either inner or Text as the component type, and forwarding the props here. These props will be remembered
  // and don't need to be passed again in the JSX tree.
  const Inner = useSlot(inner || Text, rest);

  // return a closure for finishing off render
  return directComponent<TextProps>((extra: TextProps) => {
    // split children from extra props
    const { children, ...rest } = extra;
    return <Inner {...rest}>{children}</Inner>;
  });
});
PluggableText.displayName = 'PluggableText';

const useStyledStagedText = (props: PluggableTextProps, baseStyle: TextProps['style'], inner?: React.FunctionComponent<TextProps>) => {
  // extract style from props
  const { style, ...rest } = props;

  // create merged props to pass in to the inner slot
  const mergedProps = { ...rest, style: mergeStyles(baseStyle, style), ...(inner && { inner }) } as PluggableTextProps;

  // create a slot based on the pluggable text
  const InnerText = useSlot(PluggableText, mergedProps);

  // return a closure to complete the staged pattern
  return directComponent<PluggableTextProps>((extra: PluggableTextProps) => {
    const { children, ...rest } = extra;
    return <InnerText {...rest}>{children}</InnerText>;
  });
};

const HeaderText = phasedComponent((props: PluggableTextProps) => {
  // could be done outside but showing the pattern of using useMemo to avoid creating a new object on every execution
  const baseStyle = React.useMemo<TextProps['style']>(() => ({ fontSize: 24, fontWeight: 'bold' }), []);

  // return a styled text component
  return useStyledStagedText(props, baseStyle);
});

const CaptionText = phasedComponent((props: PluggableTextProps) => {
  // memo to not recreate style every time
  const baseStyle = React.useMemo<TextProps['style']>(() => ({ fontFamily: 'Arial', fontWeight: '200' }), []);

  // return a styled text component
  return useStyledStagedText(props, baseStyle);
});

// Control authored as simple containment
const HeaderCaptionText1 = (props: TextProps) => {
  const { children, ...rest } = props;
  const baseStyle = React.useMemo<TextProps['style']>(() => ({ fontSize: 24, fontWeight: 'bold' }), []);
  const mergedProps = { ...rest, style: mergeStyles<TextStyle>(baseStyle, props.style) };
  const InnerText = useSlot<PluggableTextProps>(CaptionText, mergedProps);
  return <InnerText>{children}</InnerText>;
};

// Control authored by plugging the root
const HeaderCaptionText2 = (props: React.PropsWithChildren<TextProps>) => HeaderText({ ...props, inner: CaptionText });

// some styles to use in tests
const styleWithColor: TextProps['style'] = { color: 'blue' };

describe('useSlot tests', () => {
  /** first render the component with no updates */
  it('Two base text elements rendering, with and without styles', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <View>
          <PluggableText>No Style</PluggableText>
          <PluggableText style={styleWithColor}>With Style</PluggableText>
        </View>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Header and caption text render as expected', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <View>
          <HeaderText>Header text</HeaderText>
          <CaptionText>Caption text</CaptionText>
        </View>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Multi-level text elements are equivalent', () => {
    let component1: renderer.ReactTestRenderer;
    let component2: renderer.ReactTestRenderer;
    act(() => {
      component1 = renderer.create(<HeaderCaptionText1>HeaderCaptionText</HeaderCaptionText1>);
    });
    const tree1 = component1!.toJSON();
    expect(tree1).toMatchSnapshot();
    act(() => {
      component2 = renderer.create(<HeaderCaptionText2>HeaderCaptionText</HeaderCaptionText2>);
    });
    const tree2 = component2!.toJSON();
    expect(tree2).toMatchSnapshot();
    // @ts-expect-error - we know the structure of the tree here and want to compare the text nodes directly, this is not a general pattern
    expect(tree1!['HeaderCaptionText1']).toEqual(tree2!['HeaderCaptionText2']);
  });
});

/**
 * INTRINSIC ATTRIBUTE ACCEPTANCE
 *
 * A slot produced by useSlot must behave like a real component in the JSX tree, which means it has to
 * accept React's intrinsic attributes (most importantly `key`) regardless of the kind of component the
 * slot was created from. These tests are as much a compile-time contract as a runtime one: the file is
 * type-checked by the check pass (targets/tsconfig.check.json includes *.test.* files), so if a slot type
 * ever stopped accepting `key` the `<Slot key=... />` usages below would fail the build. The runtime
 * renders confirm the slots still produce output when an intrinsic attribute is supplied.
 */

type AcceptProps = { title?: string; children?: React.ReactNode };

// A representative sampling of the component kinds useSlot supports as an input type.
const FnAccept: React.FunctionComponent<AcceptProps> = (props) => <Text>{props.title}</Text>;

/**
 * A class component shaped like the ones exported by react-native-svg (e.g. Rect/Circle): it extends
 * React.Component, declares static defaultProps, and its render() is typed to return React.JSX.Element.
 * Class components receive `key`/`ref` through JSX.IntrinsicClassAttributes rather than
 * JSX.IntrinsicAttributes, so they are worth covering explicitly to prove a slot built from a class still
 * accepts intrinsic attributes.
 */
class ClassAccept extends React.Component<AcceptProps> {
  public static defaultProps: Partial<AcceptProps> = { title: '' };
  public override render(): React.JSX.Element {
    return <Text>{this.props.title}</Text>;
  }
}

const PhasedAccept = phasedComponent((_props: AcceptProps) =>
  directComponent<AcceptProps>((extra: AcceptProps) => <Text {...extra} />),
);

const StagedAccept = stagedComponent<AcceptProps>((_props) => (rest, ...children) => <Text {...rest}>{children}</Text>);

/**
 * Builds a slot for every supported component kind and renders each one with a `key` intrinsic attribute.
 * The mere fact that this component type-checks is the core of the acceptance test; rendering it verifies
 * the slots remain usable at runtime.
 */
const IntrinsicAttributeConsumer: React.FunctionComponent = () => {
  const HostSlot = useSlot(View, {});
  const TextSlot = useSlot(Text, { title: 'text' } as TextProps);
  const FnSlot = useSlot(FnAccept, { title: 'fn' });
  const ClassSlot = useSlot(ClassAccept, { title: 'class' });
  const PhasedSlot = useSlot(PhasedAccept, { title: 'phased' });
  const StagedSlot = useSlot(StagedAccept, { title: 'staged' });

  return (
    <View>
      <HostSlot key="host" />
      <TextSlot key="text" />
      <FnSlot key="fn" />
      <ClassSlot key="class" />
      <PhasedSlot key="phased" />
      <StagedSlot key="staged" />
    </View>
  );
};

/**
 * Focused on class components specifically. A raw class component in a consumer package can lose `key`
 * under a custom jsxImportSource because class attributes flow through JSX.IntrinsicClassAttributes;
 * routing the class through useSlot normalizes it to a SlotComponent (a function type) which reliably
 * accepts `key`. This mirrors how react-native-svg's class-based elements (Rect/Circle) should be
 * consumed via slots.
 */
const ClassSlotConsumer: React.FunctionComponent = () => {
  const ClassSlot = useSlot(ClassAccept, { title: 'class' });
  return (
    <View>
      {['a', 'b', 'c'].map((k) => (
        <ClassSlot key={k} />
      ))}
    </View>
  );
};

describe('slot intrinsic attribute acceptance', () => {
  it('accepts the key attribute on slots created from any supported component type', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<IntrinsicAttributeConsumer />);
    });
    // If any slot rejected `key`, the file would not have compiled; this confirms the tree still renders.
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('accepts the key attribute on a slot created from a class component in a keyed list', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ClassSlotConsumer />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
