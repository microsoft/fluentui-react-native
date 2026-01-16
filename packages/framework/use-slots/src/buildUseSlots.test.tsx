import type { ViewProps, TextProps } from 'react-native';
import { View, Text } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework-base';
import * as renderer from 'react-test-renderer';

import { buildUseSlots } from './buildUseSlots';

type SlotProps1 = {
  outer: ViewProps;
  inner: ViewProps;
  content: TextProps;
};

const useSlotsBase = buildUseSlots<SlotProps1>({
  slots: {
    outer: View,
    inner: View,
    content: Text,
  },
});

const CompBase = stagedComponent((props: ViewProps) => {
  const Slots = useSlotsBase(props);
  return (extra: ViewProps) => {
    const merged = { ...props, ...extra };
    return (
      <Slots.outer {...merged}>
        <Slots.inner style={{ backgroundColor: 'blue', width: 20, height: 10 }}>
          <Slots.content>Hello</Slots.content>
        </Slots.inner>
      </Slots.outer>
    );
  };
});

describe('buildUseSlots test suite', () => {
  it('Simple component render', () => {
    const tree = renderer.create(<CompBase style={{ width: 30, height: 20, borderColor: 'green', borderWidth: 1 }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
