import * as React from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { mergeStyles, useFluentTheme } from '@fluentui-react-native/framework';
import { Pressable } from '@fluentui-react-native/pressable';
import * as renderer from 'react-test-renderer';

import { Shadow } from '../Shadow';

const backgroundColor = { backgroundColor: 'red' };
interface ShadowTestProps {
  displayText: string;
  depth: string;
}

const TestShadow: React.FunctionComponent<ShadowTestProps> = (props: ShadowTestProps) => {
  const theme = useFluentTheme();
  return (
    <Shadow shadowToken={theme.shadows[props.depth]}>
      <View style={backgroundColor}>
        <Text>{props.displayText}</Text>
      </View>
    </Shadow>
  );
};

const TestPressableWithAndWithoutShadow: React.FunctionComponent = () => {
  const theme = useFluentTheme();
  return (
    <View>
      <Shadow shadowToken={theme.shadows['shadow16']}>
        <Pressable style={backgroundColor} />
      </Shadow>
      <View>
        <Pressable style={backgroundColor} />
      </View>
    </View>
  );
};

interface ShadowOnChildViewWithProps {
  childViewStyleProps: object;
}

const TestShadowOnChildViewWithProps: React.FunctionComponent<ShadowOnChildViewWithProps> = (props: ShadowOnChildViewWithProps) => {
  const theme = useFluentTheme();
  return (
    <Shadow shadowToken={theme.shadows['shadow16']}>
      <View style={mergeStyles<ViewStyle>(props.childViewStyleProps, backgroundColor)}>
        <Text>{JSON.stringify(props.childViewStyleProps)}</Text>
      </View>
    </Shadow>
  );
};

describe('Shadow component tests', () => {
  beforeAll(() => {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'macos',
      select: () => null,
    }));
  });

  it('Shadow (depth=2)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=2)" depth="shadow2" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=4)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=4)" depth="shadow4" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=8)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=8)" depth="shadow8" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=16)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=16)" depth="shadow16" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=28)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=28)" depth="shadow28" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=64)', () => {
    const tree = renderer.create(<TestShadow displayText="Shadow (depth=64)" depth="shadow64" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=2)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=2)" depth="shadow2brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=4)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=4)" depth="shadow4brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=8)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=8)" depth="shadow8brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=16)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=16)" depth="shadow16brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=28)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=28)" depth="shadow28brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=64)', () => {
    const tree = renderer.create(<TestShadow displayText="Brand shadow (depth=64)" depth="shadow64brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Pressable that has a shadow vs. pressable without shadow', () => {
    const tree = renderer.create(<TestPressableWithAndWithoutShadow />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow on a child with margin and padding', () => {
    const tree = renderer.create(<TestShadowOnChildViewWithProps childViewStyleProps={{ margin: 2, padding: 2 }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow on a child with border radius', () => {
    const tree = renderer.create(<TestShadowOnChildViewWithProps childViewStyleProps={{ borderRadius: 2 }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow on a child with border width', () => {
    const tree = renderer.create(<TestShadowOnChildViewWithProps childViewStyleProps={{ borderWidth: 2 }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  afterAll(() => {
    jest.unmock('react-native/Libraries/Utilities/Platform');
  });
});
