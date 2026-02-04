import * as React from 'react';
import { act } from 'react';
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
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Shadow (depth=2)" depth="shadow2" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow (depth=4)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Shadow (depth=4)" depth="shadow4" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow (depth=8)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Shadow (depth=8)" depth="shadow8" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow (depth=16)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Shadow (depth=16)" depth="shadow16" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow (depth=28)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Shadow (depth=28)" depth="shadow28" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow (depth=64)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Shadow (depth=64)" depth="shadow64" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Brand shadow (depth=2)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Brand shadow (depth=2)" depth="shadow2brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Brand shadow (depth=4)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Brand shadow (depth=4)" depth="shadow4brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Brand shadow (depth=8)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Brand shadow (depth=8)" depth="shadow8brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Brand shadow (depth=16)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Brand shadow (depth=16)" depth="shadow16brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Brand shadow (depth=28)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Brand shadow (depth=28)" depth="shadow28brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Brand shadow (depth=64)', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadow displayText="Brand shadow (depth=64)" depth="shadow64brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Pressable that has a shadow vs. pressable without shadow', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestPressableWithAndWithoutShadow />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow on a child with margin and padding', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadowOnChildViewWithProps childViewStyleProps={{ margin: 2, padding: 2 }} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow on a child with border radius', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadowOnChildViewWithProps childViewStyleProps={{ borderRadius: 2 }} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Shadow on a child with border width', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<TestShadowOnChildViewWithProps childViewStyleProps={{ borderWidth: 2 }} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  afterAll(() => {
    jest.unmock('react-native/Libraries/Utilities/Platform');
  });
});
