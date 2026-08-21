/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { Switch } from './switch';

const LabeledSwitch: SlotProp<typeof Switch> = {
  afterLabel: false,
  beforeLabel: 'Wi-Fi',
  label: 'Wi-Fi',
  layout: 'horizontal',
};

const StandaloneSwitch: SlotProp<typeof Switch> = {
  accessibilityLabel: 'Wi-Fi',
  layout: 'switch',
  track: {
    testID: 'switch-track',
  },
};

describe('Switch slot types', () => {
  it('accepts the public switch contract as a slot prop', () => {
    expect(LabeledSwitch).toBeDefined();
    expect(StandaloneSwitch).toBeDefined();
  });
});
