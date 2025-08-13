/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ViewProps, TextProps, ColorValue } from 'react-native';
import { View, Text } from 'react-native';

import type { ThemeHelper } from '@fluentui-react-native/use-styling';
import * as renderer from 'react-test-renderer';

import type { UseStyledSlots } from './composeFactory';
import { composeFactory } from './composeFactory';

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
    useRender: (props: ViewProps, useSlots: UseStyledSlots<ViewProps, SlotProps>) => {
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
