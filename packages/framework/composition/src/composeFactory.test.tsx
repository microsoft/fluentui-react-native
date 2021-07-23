/** @jsx withSlots */
import { withSlots } from '@fluentui-react-native/use-slots';
import * as renderer from 'react-test-renderer';
import { composeFactory, UseStyledSlots } from './composeFactory';
import { ViewProps, View, Text, TextProps, ColorValue } from 'react-native';
import { ThemeHelper } from '@fluentui-react-native/use-styling';

type Theme = {
  values: {
    backgroundColor?: ColorValue;
    color?: ColorValue;
  };
  components: {
    [key: string]: object;
  };
};

const theme: Theme = {
  values: {
    backgroundColor: 'black',
    color: 'white',
  },
  components: {},
};

type SlotProps = {
  outer: ViewProps;
  content: TextProps;
};

type Tokens = {
  backgroundColor?: ColorValue;
  color?: ColorValue;
};

const themeHelper: ThemeHelper<Theme> = {
  useTheme: () => theme,
  getComponentInfo: (theme: Theme, name: string) => {
    return theme?.components ?? theme.components[name];
  },
};

function mergeProps<T>(p1: T, p2: T): T {
  return { ...p1, ...p2 };
}

const Base = composeFactory<ViewProps, SlotProps, Tokens, Theme>(
  {
    tokens: [
      (t) => ({
        backgroundColor: t.values.backgroundColor,
        color: t.values.color,
      }),
    ],
    slotProps: {
      outer: (tokens) => ({ style: { backgroundColor: tokens.backgroundColor } }),
      content: (tokens) => ({ style: { color: tokens.color } }),
    },
    slots: {
      outer: View,
      content: Text,
    },
    render: (props: ViewProps, useSlots: UseStyledSlots<ViewProps, SlotProps>) => {
      const Slots = useSlots(props);
      return (extra: ViewProps) => (
        <Slots.outer {...mergeProps(props, extra)}>
          <Slots.content>Hello</Slots.content>
        </Slots.outer>
      );
    },
  },
  themeHelper,
);

const Customized = Base.customize({ backgroundColor: 'pink' });

const mixinStyle = {
  width: 30,
  height: 20,
  borderColor: 'green',
  borderWidth: 1,
};

describe('composeFactory test suite', () => {
  it('Base component render', () => {
    const tree = renderer.create(<Base style={mixinStyle} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Base component render', () => {
    const tree = renderer.create(<Customized style={mixinStyle} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
